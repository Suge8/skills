#!/usr/bin/env node
// Architecture wiki verifier. Zero deps; exits 1 on any stale/broken finding.
//
// Lives at docs/architecture/verify.mjs, next to wiki/ and architecture.html.
// Wiki page frontmatter:
//   ---
//   sources:
//     - src/auth.ts 8f3a21bc4d2e validateToken
//   ---
// Each entry: <repo-relative-path> <git blob hash prefix (>=8)> [symbol...]
// index.md additionally: baseline: <commit sha>
//
// Usage: node verify.mjs            # verify; stale sources print a unified diff, exit 0/1
//        node verify.mjs --digest   # print current wiki digest and exit
//        node verify.mjs --sync     # refresh stale hash prefixes + baseline, then verify
//
// Contract for --sync: read the diffs first, fix prose where a claim broke, then sync.
// It only rewrites bookkeeping (hash prefixes, baseline); semantic findings
// (missing symbols, broken links) still fail and must be fixed by hand.
// The digest covers page bodies only, so --sync never invalidates architecture.html.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const wikiDir = join(here, "wiki");
const htmlPath = join(here, "architecture.html");
const repoRoot = git("rev-parse", "--show-toplevel").trim();
const errors = [];

function git(...args) {
  return execFileSync("git", args, { cwd: here, encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] });
}

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name.endsWith(".md")) out.push(p);
  }
  return out;
}

function parsePage(path) {
  const text = readFileSync(path, "utf8");
  const rel = relative(wikiDir, path);
  const page = { path, rel, sources: [], baseline: null, body: text };
  if (!text.startsWith("---")) return page;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return page;
  page.body = text.slice(end + 4);
  let inSources = false;
  for (const line of text.slice(3, end).split("\n")) {
    if (/^sources:\s*$/.test(line)) { inSources = true; continue; }
    const item = inSources && line.match(/^\s+-\s+(\S+)\s+(\S+)\s*(.*)$/);
    if (item) {
      page.sources.push({ file: item[1], hash: item[2], symbols: item[3].split(/\s+/).filter(Boolean) });
      continue;
    }
    const kv = line.match(/^baseline:\s*(\S+)/);
    if (kv) page.baseline = kv[1];
    if (/^\S/.test(line)) inSources = false;
  }
  return page;
}

function blobHashes(relPaths) {
  if (!relPaths.length) return new Map();
  const out = execFileSync("git", ["hash-object", "--stdin-paths"], {
    cwd: repoRoot, input: relPaths.join("\n"), encoding: "utf8",
  }).trim().split("\n");
  return new Map(relPaths.map((p, i) => [p, out[i]]));
}

let pages = walk(wikiDir).map(parsePage);

if (process.argv.includes("--sync")) {
  syncBookkeeping(pages);
  pages = walk(wikiDir).map(parsePage);
}

// Wiki digest: identity of the prose only (frontmatter is maintenance bookkeeping),
// embedded into the HTML at render time. Hash refreshes must not force a re-render.
const digest = createHash("sha256")
  .update(pages.map((p) => `${p.rel}\n${p.body}`).sort().join("\0"))
  .digest("hex").slice(0, 12);

/** Rewrite stale source hash prefixes in frontmatter and advance index.md baseline to HEAD. */
function syncBookkeeping(pages) {
  const files = [...new Set(pages.flatMap((p) => p.sources.map((s) => s.file)))]
    .filter((f) => existsSync(join(repoRoot, f)) && !statSync(join(repoRoot, f)).isDirectory());
  const current = blobHashes(files);
  const head = git("rev-parse", "HEAD").trim();
  for (const page of pages) {
    let text = readFileSync(page.path, "utf8");
    let changed = false;
    for (const src of page.sources) {
      const now = current.get(src.file);
      if (!now || now.startsWith(src.hash)) continue;
      text = text.replace(
        new RegExp(`(-\\s+${src.file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+)${src.hash}`),
        `$1${now.slice(0, 12)}`,
      );
      changed = true;
    }
    if (page.rel === "index.md" && page.baseline && page.baseline !== head) {
      text = text.replace(/^baseline:.*$/m, `baseline: ${head}`);
      changed = true;
    }
    if (!changed) continue;
    writeFileSync(page.path, text);
    console.log(`synced: ${page.rel}`);
  }
}

/** Unified diff from the recorded blob to the working file; null when the blob is unavailable. */
function sourceDiff(src) {
  let old;
  try {
    old = git("cat-file", "-p", src.hash);
  } catch {
    return null; // recorded blob never committed; nothing to diff against
  }
  const tmp = join(tmpdir(), `wiki-verify-${process.pid}-${src.hash}`);
  writeFileSync(tmp, old);
  try {
    execFileSync("diff", ["-u", "--label", `${src.file}@${src.hash}`, "--label", src.file, tmp, join(repoRoot, src.file)], { encoding: "utf8" });
    return null; // identical content (hash drift from e.g. filters); nothing to show
  } catch (result) {
    return typeof result.stdout === "string" ? result.stdout : null;
  } finally {
    rmSync(tmp, { force: true });
  }
}

const DIFF_CAP = 120;

/** Render a capped diff, tagging pure mechanical drift (no anchored symbol touched). */
function describeDrift(src) {
  const diff = sourceDiff(src);
  if (!diff) return "";
  const lines = diff.trimEnd().split("\n");
  const changedLines = lines.filter((l) => /^[+-]/.test(l) && !/^(\+\+\+|---)/.test(l));
  const touched = src.symbols.some((sym) => changedLines.some((l) => l.includes(sym)));
  const note = src.symbols.length && !touched
    ? "\n    ⚠ 未触及锚定符号：疑似机械漂移，确认后 --sync 即可"
    : "";
  const body = lines.length > DIFF_CAP
    ? [...lines.slice(0, DIFF_CAP), `… 截断（共 ${lines.length} 行），余下回源码看`]
    : lines;
  return `${note}\n${body.map((l) => `    ${l}`).join("\n")}`;
}

if (process.argv.includes("--digest")) {
  console.log(digest);
  process.exit(0);
}

// 1. Sources: file exists, hash matches, symbols still present.
for (const page of pages) {
  for (const src of page.sources) {
    const abs = join(repoRoot, src.file);
    if (existsSync(abs) && statSync(abs).isDirectory()) {
      errors.push(`${page.rel}: source must be a file, not a directory: ${src.file}`);
      src.skip = true;
    }
  }
}
const sourceFiles = [...new Set(pages.flatMap((p) => p.sources.filter((s) => !s.skip).map((s) => s.file)))];
const existing = sourceFiles.filter((f) => existsSync(join(repoRoot, f)));
const hashes = blobHashes(existing);
for (const page of pages) {
  for (const src of page.sources) {
    if (src.skip) continue;
    if (!hashes.has(src.file)) {
      errors.push(`${page.rel}: source missing: ${src.file}`);
      continue;
    }
    if (src.hash.length < 8 || !hashes.get(src.file).startsWith(src.hash)) {
      errors.push(`${page.rel}: source changed since last sync: ${src.file}${describeDrift(src)}`);
      continue;
    }
    const content = readFileSync(join(repoRoot, src.file), "utf8");
    for (const sym of src.symbols) {
      if (!content.includes(sym)) errors.push(`${page.rel}: symbol gone from ${src.file}: ${sym}`);
    }
  }
}

// 2. Relative links resolve; every page except index.md has an inbound link.
const inbound = new Set();
for (const page of pages) {
  for (const m of page.body.matchAll(/\]\(([^)#\s]+)(?:#[^)\s]*)?\)/g)) {
    const target = m[1];
    if (/^(https?:|mailto:|\/)/.test(target)) continue;
    const abs = resolve(dirname(page.path), decodeURIComponent(target));
    if (!existsSync(abs)) {
      errors.push(`${page.rel}: broken link: ${target}`);
    } else if (abs.startsWith(wikiDir)) {
      inbound.add(relative(wikiDir, abs));
    }
  }
}
for (const page of pages) {
  if (page.rel !== "index.md" && !inbound.has(page.rel)) {
    errors.push(`${page.rel}: orphan page (no inbound wiki link)`);
  }
}

// 3. index.md baseline is a valid commit.
const index = pages.find((p) => p.rel === "index.md");
if (!index) {
  errors.push("wiki/index.md missing");
} else if (!index.baseline) {
  errors.push("index.md: missing `baseline: <commit sha>` in frontmatter");
} else {
  try {
    git("cat-file", "-e", `${index.baseline}^{commit}`);
  } catch {
    errors.push(`index.md: baseline commit not found: ${index.baseline}`);
  }
}

// 4. architecture.html exists and was rendered from the current wiki.
if (!existsSync(htmlPath)) {
  errors.push("architecture.html missing (run render)");
} else {
  const m = readFileSync(htmlPath, "utf8").match(/name="wiki-digest"\s+content="([0-9a-f]+)"/);
  if (!m) errors.push('architecture.html: missing <meta name="wiki-digest">');
  else if (m[1] !== digest) errors.push(`architecture.html: stale (digest ${m[1]} != wiki ${digest}), re-render`);
}

// 5. data.json (when present): graph completeness + geometry red lines.
const dataPath = join(here, "data.json");
if (existsSync(dataPath)) {
  let d = null;
  try { d = JSON.parse(readFileSync(dataPath, "utf8")); }
  catch (e) { errors.push(`data.json: invalid JSON (${e.message})`); }
  if (d) checkData(d);
}
function checkData(d) {
  const nodes = d.nodes || [], districts = d.districts || [];
  const flows = d.flows || [];
  const codes = new Set(nodes.map((n) => n.code));
  const touched = new Set();
  for (const l of d.links || []) {
    touched.add(l.from); touched.add(l.to);
    if (!codes.has(l.from) || !codes.has(l.to))
      errors.push(`data.json: link ${l.from}→${l.to} references unknown node`);
  }
  for (const f of flows) {
    if (f.page && !existsSync(join(wikiDir, f.page.split("#")[0])))
      errors.push(`data.json: flow "${f.title}" page not found: ${f.page.split("#")[0]}`);
    for (const s of f.steps || []) {
      touched.add(s.from); touched.add(s.to);
      if (!codes.has(s.from) || !codes.has(s.to))
        errors.push(`data.json: flow "${f.title}" step "${s.title}" references unknown node`);
      if (!s.sources?.length)
        errors.push(`data.json: flow "${f.title}" step "${s.title}" missing sources (call-site evidence)`);
    }
  }
  for (const n of nodes) {
    if (!touched.has(n.code))
      errors.push(`data.json: orphan node ${n.code} (no link or flow touches it)`);
    if (n.page && !existsSync(join(wikiDir, n.page.split("#")[0])))
      errors.push(`data.json: node ${n.code} page not found: ${n.page.split("#")[0]}`);
    const dd = districts.find((x) => x.id === n.district);
    if (!dd) { errors.push(`data.json: node ${n.code} unknown district ${n.district}`); continue; }
    const [x, y, w, h] = dd.r, nw = n.w ?? 1.1, nd = n.d ?? 1.1;
    if (n.x < x || n.y < y || n.x + nw > x + w || n.y + nd > y + h)
      errors.push(`data.json: node ${n.code} outside district ${dd.id}`);
  }
  // Geometry red lines (slightly looser than RENDER.md recommendations).
  for (let i = 0; i < nodes.length; i++)
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const xg = Math.max(a.x - (b.x + (b.w ?? 1.1)), b.x - (a.x + (a.w ?? 1.1)));
      const yg = Math.max(a.y - (b.y + (b.d ?? 1.1)), b.y - (a.y + (a.d ?? 1.1)));
      if (xg < 1.3 && yg < 1.1)
        errors.push(`data.json: nodes ${a.code}/${b.code} too close (xgap ${xg.toFixed(1)}, ygap ${yg.toFixed(1)}; need xgap>=1.3 or ygap>=1.1)`);
    }
  for (let i = 0; i < districts.length; i++)
    for (let j = i + 1; j < districts.length; j++) {
      const [ax, ay, aw, ah] = districts[i].r, [bx, by, bw, bh] = districts[j].r;
      const xg = Math.max(ax - (bx + bw), bx - (ax + aw));
      const yg = Math.max(ay - (by + bh), by - (ay + ah));
      if (xg < 1.5 && yg < 1.5)
        errors.push(`data.json: districts ${districts[i].id}/${districts[j].id} need a >=1.5 aisle`);
    }
}

if (errors.length) {
  console.error(`Architecture wiki verify failed (${errors.length}):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log(`Architecture wiki OK: ${pages.length} pages, digest ${digest}`);

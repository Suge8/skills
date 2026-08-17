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
// Usage: node verify.mjs            # verify, report, exit 0/1
//        node verify.mjs --digest   # print current wiki digest and exit

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
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

const pages = walk(wikiDir).map(parsePage);

// Wiki digest: content identity of the whole wiki, embedded into the HTML at render time.
const wikiRel = pages.map((p) => relative(repoRoot, p.path)).sort();
const wikiHashes = blobHashes(wikiRel);
const digest = createHash("sha256")
  .update(wikiRel.map((p) => `${p} ${wikiHashes.get(p)}`).join("\n"))
  .digest("hex").slice(0, 12);

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
      errors.push(`${page.rel}: source changed since last sync: ${src.file}`);
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

if (errors.length) {
  console.error(`Architecture wiki verify failed (${errors.length}):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log(`Architecture wiki OK: ${pages.length} pages, digest ${digest}`);

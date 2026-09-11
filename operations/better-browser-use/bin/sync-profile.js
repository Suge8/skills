#!/usr/bin/env node
// Seed the dedicated browser profile with login state from the user's Helium.
//
// Cookies: online snapshot via SQLite backup API (Helium keeps running), then
// transcrypted from Helium's Keychain key to the key the target browser uses.
// agent-browser launches Chromium with --use-mock-keychain, whose password is
// the constant "mock_password" (verified against cookies the browser wrote), so
// the profile's cookies are effectively plaintext at rest: the directory is
// created 0700. macOS Chromium scheme: AES-128-CBC, key = PBKDF2-SHA1(pw,
// 'saltysalt', 1003, 16), IV = 16 spaces, plaintext prefixed with
// SHA256(host_key) since schema v24 (used to verify decryption).
// Preferences / Local Storage / Network are copied. Passwords (Login Data) are
// not: they are encrypted per entry under Helium's key; log in once headed.
//
// Usage: sync-profile.js <dest-profile> [--force]
// Env:   BBU_SOURCE_PROFILE  Helium user-data-dir
//        BBU_SRC_KEYCHAIN     "service:account"
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { DatabaseSync, backup } = require('node:sqlite');

const HOME = process.env.HOME;
const SRC = process.env.BBU_SOURCE_PROFILE || `${HOME}/Library/Application Support/net.imput.helium`;
const SRC_KEYCHAIN = process.env.BBU_SRC_KEYCHAIN || 'Helium Storage Key:Helium';
const MOCK_KEYCHAIN_PASSWORD = 'mock_password';
// Written on seed; --force only deletes a directory carrying it, so a
// misconfigured BBU_HOME can never wipe an unrelated directory.
const MARKER = '.bbu-profile';
const COPIED = ['Preferences', 'Local Storage', 'Network'];

const [dest, flag] = process.argv.slice(2);
const force = flag === '--force';
const log = (m) => process.stderr.write(`${m}\n`);
const fail = (m) => { log(`sync-profile: ${m}`); process.exit(1); };

const deriveKey = (password) => crypto.pbkdf2Sync(password, 'saltysalt', 1003, 16, 'sha1');

function keychainPassword(spec) {
  const sep = spec.lastIndexOf(':');
  try {
    return execFileSync('security',
      ['find-generic-password', '-s', spec.slice(0, sep), '-a', spec.slice(sep + 1), '-w'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return fail(`Keychain item not found: ${spec}. Is Helium installed and has it stored cookies?`);
  }
}

function transcrypt(dbPath, srcKey, dstKey) {
  const iv = Buffer.alloc(16, ' ');
  const db = new DatabaseSync(dbPath);
  const rows = db.prepare('SELECT rowid, host_key, encrypted_value FROM cookies').all();
  const update = db.prepare('UPDATE cookies SET encrypted_value = ? WHERE rowid = ?');
  const remove = db.prepare('DELETE FROM cookies WHERE rowid = ?');
  let kept = 0, dropped = 0;
  for (const row of rows) {
    const buf = Buffer.from(row.encrypted_value ?? []);
    if (buf.length === 0) { kept += 1; continue; }
    let plain = null;
    if (buf.subarray(0, 3).toString('latin1') === 'v10') {
      try {
        const d = crypto.createDecipheriv('aes-128-cbc', srcKey, iv);
        const candidate = Buffer.concat([d.update(buf.subarray(3)), d.final()]);
        const hostHash = crypto.createHash('sha256').update(row.host_key).digest();
        if (candidate.subarray(0, 32).equals(hostHash)) plain = candidate;
      } catch { /* wrong key or corrupt value: dropped below */ }
    }
    if (plain === null) { remove.run(row.rowid); dropped += 1; continue; }
    const c = crypto.createCipheriv('aes-128-cbc', dstKey, iv);
    update.run(Buffer.concat([Buffer.from('v10'), c.update(plain), c.final()]), row.rowid);
    kept += 1;
  }
  db.close();
  return { kept, dropped, total: rows.length };
}

function preflight() {
  if (!dest) fail('usage: sync-profile.js <dest-profile> [--force]');
  if (!fs.existsSync(`${SRC}/Default/Cookies`)) fail(`source profile not found: ${SRC}`);
  try {
    execFileSync('pgrep', ['-f', `user-data-dir=${dest}`], { stdio: 'ignore' });
    fail('dedicated instance is running; stop it first: bbu --login close');
  } catch { /* pgrep exit 1 = not running */ }
  if (!fs.existsSync(dest)) return;
  if (!force) fail(`destination exists: ${dest} (use --force to re-seed)`);
  if (!fs.existsSync(path.join(dest, MARKER))) fail(`refusing to delete ${dest}: not a bbu profile`);
}

async function main() {
  preflight();
  const srcKey = deriveKey(keychainPassword(SRC_KEYCHAIN));
  const dstKey = deriveKey(MOCK_KEYCHAIN_PASSWORD);

  log(`Seeding ${dest}\n  from ${SRC}`);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(path.join(dest, 'Default'), { recursive: true, mode: 0o700 });

  const src = new DatabaseSync(`${SRC}/Default/Cookies`, { readOnly: true });
  await backup(src, path.join(dest, 'Default/Cookies'));
  src.close();
  const r = transcrypt(path.join(dest, 'Default/Cookies'), srcKey, dstKey);
  log(`  + Default/Cookies: ${r.kept} kept, ${r.dropped} dropped, ${r.total} total`);

  // Local Storage is LevelDB: copying while Helium runs is best-effort
  // (Chromium rebuilds it if inconsistent; cookies above are unaffected).
  for (const item of COPIED) {
    const from = path.join(SRC, 'Default', item);
    if (!fs.existsSync(from)) continue;
    try { fs.cpSync(from, path.join(dest, 'Default', item), { recursive: true }); log(`  + Default/${item}`); }
    catch (e) { log(`  ~ Default/${item} skipped: ${e.message}`); }
  }
  // Our cookie DB lives at Default/Cookies; a second one under Network/ would shadow it.
  for (const f of ['Network/Cookies', 'Network/Cookies-journal']) {
    fs.rmSync(path.join(dest, 'Default', f), { force: true });
  }
  fs.writeFileSync(path.join(dest, MARKER), '');
  log('Done.');
}

main();

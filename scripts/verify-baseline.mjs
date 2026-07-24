#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, realpathSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const expectedNode = readFileSync(join(root, ".node-version"), "utf8").trim();
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const expectedNpm = String(pkg.packageManager).replace(/^npm@/, "");

function fail(message) {
  throw new Error(message);
}

function findExecutable(name) {
  for (const dir of (process.env.PATH ?? "").split(":")) {
    if (!dir) continue;
    const candidate = join(dir, name);
    if (existsSync(candidate)) return candidate;
  }
  fail(`${name} not found on PATH`);
}

const npmCli = realpathSync(
  process.env.IVA_NPM_CLI ??
    process.env.npm_execpath ??
    findExecutable("npm"),
);

function run(label, command, args, options = {}) {
  console.log(`\n==> ${label}`);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    env: process.env,
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) fail(`${label} failed with exit ${result.status}`);
}

function capture(command, args) {
  return execFileSync(command, args, { cwd: root, encoding: "utf8" }).trim();
}

if (process.version !== `v${expectedNode}`) {
  fail(`Node mismatch: expected v${expectedNode}, got ${process.version}`);
}
const actualNpm = capture(process.execPath, [npmCli, "--version"]);
if (actualNpm !== expectedNpm) {
  fail(`npm mismatch: expected ${expectedNpm}, got ${actualNpm}`);
}
if (pkg.version !== "0.3.0") fail(`package version must be 0.3.0, got ${pkg.version}`);
const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8"));
if (
  lock.version !== pkg.version ||
  lock.packages?.[""]?.version !== pkg.version
) {
  fail("package-lock root metadata does not match package.json");
}

run("deterministic npm ci", process.execPath, [npmCli, "ci"]);
run("git diff --check", "git", ["diff", "--check"]);
run("typecheck", process.execPath, [
  "node_modules/@typescript/native-preview/bin/tsgo.js",
]);

const libraryTests = readdirSync(join(root, "scripts", "lib"))
  .filter((name) => name.endsWith(".test.mjs"))
  .sort()
  .map((name) => `scripts/lib/${name}`);
const sourceTests = readdirSync(join(root, "tests"))
  .filter((name) => name.endsWith(".test.ts") || name.endsWith(".test.mjs"))
  .sort()
  .map((name) => `tests/${name}`);
run("Node regression suites", process.execPath, [
  "--experimental-strip-types",
  "--experimental-loader",
  "./resolve-js-to-ts.mjs",
  "--test",
  ...libraryTests,
  ...sourceTests,
]);
run("security-defense regression suite", "python3", [
  "agent/skills/security-defense/scripts/test_security.py",
  "-v",
]);
run("Telegram userbot guardrails", "python3", [
  "services/telegram-userbot/test_guardrails.py",
]);
run("Autograph regression suite", "python3", [
  "-m",
  "unittest",
  "discover",
  "-s",
  "vault-template/.claude/skills/autograph/tests",
  "-p",
  "test_*.py",
  "-v",
]);

rmSync(join(root, ".output"), { recursive: true, force: true });
run("clean Eve build", process.execPath, ["node_modules/eve/bin/eve.js", "build"]);
run("stamp full .output provenance", process.execPath, [
  "scripts/build-info.mjs",
  "stamp",
  root,
]);
run("verify full .output manifest", process.execPath, [
  "scripts/build-info.mjs",
  "verify",
  root,
]);

const info = JSON.parse(
  readFileSync(join(root, ".output", "build-info.json"), "utf8"),
);
if (info.source.dirty) fail("provenance is dirty; run from a clean commit");
if (info.toolchain.node !== process.version || info.toolchain.npm !== actualNpm) {
  fail("provenance toolchain does not match verification toolchain");
}
if (info.source.commit !== capture("git", ["rev-parse", "HEAD"])) {
  fail("provenance commit does not match HEAD");
}

console.log(
  `\nIVA BASELINE VERIFY PASS commit=${info.source.commit} node=${process.version} npm=${actualNpm}`,
);

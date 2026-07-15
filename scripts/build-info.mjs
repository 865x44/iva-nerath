#!/usr/bin/env node
// Provenance stamper (wave IVA-M1-C): run right after `npm run build`.
// Writes .output/build-info.json linking the deployed artifact to a commit,
// so a running server can always be traced back to source (audit IVA-D0
// found the deployed artifact unprovable against any commit).
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? process.cwd());
const artifact = join(root, ".output", "server", "index.mjs");

function git(...args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

try {
  if (!existsSync(artifact)) {
    console.error(`build-info: artifact not found: ${artifact} — run the build first`);
    process.exit(1);
  }

  const commit = git("rev-parse", "HEAD");
  const branch = git("rev-parse", "--abbrev-ref", "HEAD");
  const commitDate = git("show", "-s", "--format=%cI", "HEAD");
  const dirty = git("status", "--porcelain").length > 0;
  const artifactSha256 = createHash("sha256").update(readFileSync(artifact)).digest("hex");

  const info = {
    commit,
    branch,
    commitDate,
    dirty,
    artifactSha256,
    stampedAt: new Date().toISOString(),
    stamper: "IVA-M1-C",
  };

  writeFileSync(join(root, ".output", "build-info.json"), JSON.stringify(info, null, 2) + "\n");
  console.log(`build-info: ${commit.slice(0, 7)} sha256:${artifactSha256.slice(0, 12)}…`);
} catch (err) {
  console.error(`build-info: failed: ${err.message}`);
  process.exit(1);
}

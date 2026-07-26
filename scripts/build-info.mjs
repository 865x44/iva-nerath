#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const MANIFEST = "manifest.sha256";
const MANIFEST_ROOT = "manifest.root.sha256";
const EXCLUDED = new Set([MANIFEST, MANIFEST_ROOT]);

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function sha256File(path) {
  return sha256(readFileSync(path));
}

function git(root, ...args) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function findExecutable(name) {
  for (const dir of (process.env.PATH ?? "").split(":")) {
    if (!dir) continue;
    const candidate = join(dir, name);
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(`${name} not found on PATH`);
}

function npmVersion() {
  const cli = realpathSync(
    process.env.IVA_NPM_CLI ??
      process.env.npm_execpath ??
      findExecutable("npm"),
  );
  return execFileSync(process.execPath, [cli, "--version"], {
    encoding: "utf8",
  }).trim();
}

export function listOutputPayloads(outputDir) {
  const files = [];

  function visit(dir) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(path);
      } else if (entry.isFile()) {
        const rel = relative(outputDir, path).split(sep).join("/");
        if (!EXCLUDED.has(rel)) files.push(rel);
      } else {
        throw new Error(`unsupported .output entry type: ${relative(outputDir, path)}`);
      }
    }
  }

  visit(outputDir);
  return files.sort();
}

export function writeOutputManifest(outputDir) {
  const lines = listOutputPayloads(outputDir).map(
    (rel) => `${sha256File(join(outputDir, rel))}  ${rel}`,
  );
  const manifestBytes = `${lines.join("\n")}\n`;
  writeFileSync(join(outputDir, MANIFEST), manifestBytes);
  writeFileSync(
    join(outputDir, MANIFEST_ROOT),
    `${sha256(manifestBytes)}  ${MANIFEST}\n`,
  );
  return { payloadCount: lines.length, manifestSha256: sha256(manifestBytes) };
}

function parseManifest(text) {
  const entries = new Map();
  for (const line of text.trimEnd().split("\n")) {
    const match = /^([0-9a-f]{64})  (.+)$/.exec(line);
    if (!match) throw new Error(`invalid manifest line: ${line}`);
    const [, digest, rel] = match;
    if (
      rel.startsWith("/") ||
      rel.split("/").includes("..") ||
      EXCLUDED.has(rel) ||
      entries.has(rel)
    ) {
      throw new Error(`unsafe or duplicate manifest path: ${rel}`);
    }
    entries.set(rel, digest);
  }
  return entries;
}

export function verifyOutputManifest(outputDir) {
  const manifestPath = join(outputDir, MANIFEST);
  const rootPath = join(outputDir, MANIFEST_ROOT);
  const manifestBytes = readFileSync(manifestPath, "utf8");
  const rootLine = readFileSync(rootPath, "utf8").trim();
  const rootMatch = /^([0-9a-f]{64})  manifest\.sha256$/.exec(rootLine);
  if (!rootMatch) throw new Error("invalid manifest.root.sha256");
  if (rootMatch[1] !== sha256(manifestBytes)) {
    throw new Error("manifest root hash mismatch");
  }

  const expected = parseManifest(manifestBytes);
  const actual = listOutputPayloads(outputDir);
  if (
    expected.size !== actual.length ||
    actual.some((rel) => !expected.has(rel))
  ) {
    throw new Error("manifest payload set does not match .output");
  }
  for (const rel of actual) {
    if (expected.get(rel) !== sha256File(join(outputDir, rel))) {
      throw new Error(`payload hash mismatch: ${rel}`);
    }
  }
  return { payloadCount: actual.length, manifestSha256: rootMatch[1] };
}

export function stampBuild(root = process.cwd()) {
  root = resolve(root);
  const outputDir = join(root, ".output");
  const artifact = join(outputDir, "server", "index.mjs");
  if (!existsSync(artifact)) {
    throw new Error(`artifact not found: ${artifact} — run the build first`);
  }

  const patches = existsSync(join(root, "patches"))
    ? readdirSync(join(root, "patches"))
        .filter((name) => name.endsWith(".patch"))
        .sort()
        .map((name) => ({
          path: `patches/${name}`,
          sha256: sha256File(join(root, "patches", name)),
        }))
    : [];
  const info = {
    schemaVersion: 2,
    source: {
      commit: git(root, "rev-parse", "HEAD"),
      tree: git(root, "rev-parse", "HEAD^{tree}"),
      branch: git(root, "rev-parse", "--abbrev-ref", "HEAD"),
      commitDate: git(root, "show", "-s", "--format=%cI", "HEAD"),
      dirty: git(root, "status", "--porcelain").length > 0,
    },
    toolchain: {
      node: process.version,
      npm: npmVersion(),
      platform: process.platform,
      arch: process.arch,
    },
    inputs: {
      packageLockSha256: sha256File(join(root, "package-lock.json")),
      patches,
    },
    artifact: {
      path: "server/index.mjs",
      sha256: sha256File(artifact),
    },
    outputManifest: {
      algorithm: "sha256",
      payload: MANIFEST,
      root: MANIFEST_ROOT,
      excludes: [MANIFEST, MANIFEST_ROOT],
      pathEncoding: "utf8-posix-relative",
    },
    stampedAt: new Date().toISOString(),
    stamper: "iva-deployable-r1",
  };
  writeFileSync(
    join(outputDir, "build-info.json"),
    `${JSON.stringify(info, null, 2)}\n`,
  );
  const manifest = writeOutputManifest(outputDir);
  return { info, ...manifest };
}

function main() {
  const command = process.argv[2] ?? "stamp";
  const root = resolve(process.argv[3] ?? process.cwd());
  const outputDir = join(root, ".output");
  const result =
    command === "stamp"
      ? stampBuild(root)
      : command === "verify"
        ? verifyOutputManifest(outputDir)
        : (() => {
            throw new Error(`unknown command: ${command}`);
          })();
  console.log(
    `build-info: ${command} PASS payloads=${result.payloadCount} manifest=${result.manifestSha256.slice(0, 12)}…`,
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
) {
  try {
    main();
  } catch (error) {
    console.error(`build-info: failed: ${error.message}`);
    process.exitCode = 1;
  }
}

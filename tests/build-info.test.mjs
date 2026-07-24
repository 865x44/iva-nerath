import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  verifyOutputManifest,
  writeOutputManifest,
} from "../scripts/build-info.mjs";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "iva-build-manifest-"));
  mkdirSync(join(root, "server"), { recursive: true });
  writeFileSync(join(root, "server", "index.mjs"), "export default 1;\n");
  writeFileSync(join(root, "build-info.json"), '{"schemaVersion":2}\n');
  return root;
}

test("manifest covers every regular payload and has a separate root hash", () => {
  const root = fixture();
  try {
    const written = writeOutputManifest(root);
    assert.equal(written.payloadCount, 2);
    assert.match(
      readFileSync(join(root, "manifest.root.sha256"), "utf8"),
      /^[0-9a-f]{64}  manifest\.sha256\n$/,
    );
    assert.deepEqual(verifyOutputManifest(root), written);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("verification rejects payload tampering", () => {
  const root = fixture();
  try {
    writeOutputManifest(root);
    writeFileSync(join(root, "server", "index.mjs"), "tampered\n");
    assert.throws(() => verifyOutputManifest(root), /payload hash mismatch/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("verification rejects extra unmanifested payloads", () => {
  const root = fixture();
  try {
    writeOutputManifest(root);
    writeFileSync(join(root, "late-file.txt"), "not manifested\n");
    assert.throws(
      () => verifyOutputManifest(root),
      /payload set does not match/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

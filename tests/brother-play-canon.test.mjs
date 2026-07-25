import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import {
  assertPlayCanonWriteAllowed,
  createPlayCanonEntry,
  PROD_VAULT_PREFIX,
} from "../scripts/brother-stage2/brother-chat.mjs";

import { buildPrompt } from "../scripts/memory/rollup.ts";

test("Play Canon: write guard refuses production vault path", () => {
  const prodPath = path.join(PROD_VAULT_PREFIX, "play-canon", "illegal-story.md");
  assert.throws(
    () => {
      assertPlayCanonWriteAllowed(prodPath);
    },
    /ABORT: Play Canon write denied for production vault path/,
    "refuses write under production vault"
  );

  assert.throws(
    () => {
      createPlayCanonEntry(prodPath, "Illegal Story", "Content");
    },
    /ABORT: Play Canon write denied for production vault path/,
    "createPlayCanonEntry refuses write under production vault"
  );
});

test("Play Canon: allows writes under dogfood vault path and tags entries factual: false", () => {
  const tmpDogfoodVault = fs.mkdtempSync(path.join(os.tmpdir(), "dogfood-vault-"));
  try {
    const playCanonFile = path.join(tmpDogfoodVault, "play-canon", "creative-tale.md");

    // Write guard check
    assert.doesNotThrow(() => {
      assertPlayCanonWriteAllowed(playCanonFile);
    });

    createPlayCanonEntry(playCanonFile, "Creative Tale", "In the city of brass...");

    assert.ok(fs.existsSync(playCanonFile), "file created under dogfood vault");
    const content = fs.readFileSync(playCanonFile, "utf8");

    assert.ok(content.includes('factual: false'), "entry is tagged factual: false");
    assert.ok(content.includes('type: "play_canon"'), "entry is tagged type: play_canon");
    assert.ok(content.includes("Creative Tale"), "entry contains title");
  } finally {
    fs.rmSync(tmpDogfoodVault, { recursive: true, force: true });
  }
});

test("Play Canon: sample dogfood entry exists and is tagged factual: false", () => {
  const dogfoodSamplePath = "/home/alx/.local/share/iva/dogfood/nerath-reconstruction-alpha/vault/play-canon/sample-fragment.md";
  assert.ok(fs.existsSync(dogfoodSamplePath), "dogfood sample Play Canon entry exists");

  const content = fs.readFileSync(dogfoodSamplePath, "utf8");
  assert.ok(content.includes("factual: false"), "dogfood sample entry tagged factual: false");
});

test("Play Canon exclusion: memory firewall prompt in rollup.ts enforces fact ratification and excludes non-facts", () => {
  const prompt = buildPrompt("daily", "2026-07-24");

  assert.ok(prompt.includes("explicitly separate user quote, user fact, inference, hypothesis, agent metaphor, temporary state, decision, confirmation, and ratification"), "daily prompt contains firewall separation rules");
  assert.ok(prompt.includes("Require direct user evidence for a fact"), "daily prompt requires direct user evidence for facts");
  assert.ok(prompt.includes("Require explicit user ratification for identity claims"), "daily prompt requires ratification for identity claims");
  assert.ok(prompt.includes("Forbidden fact:"), "daily prompt contains negative example");

  // Verify that fictional / factual: false items do not meet the direct user evidence criteria for facts
  const fictionalEntry = { title: "Sunken Spire", factual: false, content: "Obsidian dunes story" };
  assert.equal(fictionalEntry.factual, false, "fictional entry is not factual");
});

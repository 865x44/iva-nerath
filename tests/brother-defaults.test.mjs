import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

import brotherInstruction, {
  isBrotherModeOn,
  BROTHER_INSTRUCTIONS,
} from "../agent/instructions/35-brother.ts";

import {
  NERATH_VOICES,
  NERATH_RESONANCE,
} from "../scripts/lib/nerath-mode.mjs";

test("Brother defaults: active registers (Glitch, Conférencier, Mirror, frame-destruction stance) and suppressed defaults", () => {
  const origBrotherMode = process.env.BROTHER_MODE;
  try {
    process.env.BROTHER_MODE = "1";
    assert.equal(isBrotherModeOn(), true, "isBrotherModeOn() returns true when BROTHER_MODE=1");

    const res = brotherInstruction.events["turn.started"]();
    assert.ok(res, "brother instruction returned result");
    assert.ok(res.markdown, "brother instruction has non-empty markdown");

    // Active registers
    assert.ok(res.markdown.includes("Glitch Voice"), "includes Glitch Voice");
    assert.ok(res.markdown.includes(NERATH_VOICES.glitch.label), "uses NERATH_VOICES.glitch label");
    assert.ok(res.markdown.includes(NERATH_VOICES.glitch.register), "uses NERATH_VOICES.glitch register");
    assert.ok(res.markdown.includes("Conférencier Voice"), "includes Conférencier Voice");
    assert.ok(res.markdown.includes(NERATH_VOICES.conferencier.label), "uses NERATH_VOICES.conferencier label");
    assert.ok(res.markdown.includes(NERATH_VOICES.conferencier.register), "uses NERATH_VOICES.conferencier register");
    assert.ok(res.markdown.includes("Mirror Resonance"), "includes Mirror Resonance");
    assert.ok(res.markdown.includes(NERATH_RESONANCE.mirror.label), "uses NERATH_RESONANCE.mirror label");
    assert.ok(res.markdown.includes(NERATH_RESONANCE.mirror.description), "uses NERATH_RESONANCE.mirror description");
    assert.ok(res.markdown.includes("Frame-Destruction Stance"), "includes Frame-Destruction Stance");

    // Suppressed defaults
    assert.ok(res.markdown.includes("Customs (ritual) suppressed"), "suppresses customs");
    assert.ok(res.markdown.includes("Productivity framing suppressed"), "suppresses productivity framing");
    assert.ok(res.markdown.includes("Tactical Support voice suppressed"), "suppresses tactical support voice");
  } finally {
    if (origBrotherMode !== undefined) process.env.BROTHER_MODE = origBrotherMode;
    else delete process.env.BROTHER_MODE;
  }
});

test("Brother instruction reuses (imports) Brief 2 voices/resonance without duplicate definitions", () => {
  // Check that 35-brother.ts file content imports from scripts/lib/nerath-mode.mjs
  const brotherFilePath = path.join(process.cwd(), "agent/instructions/35-brother.ts");
  const code = fs.readFileSync(brotherFilePath, "utf8");

  assert.ok(
    code.includes('from "../../scripts/lib/nerath-mode.mjs"') ||
    code.includes("from '../../scripts/lib/nerath-mode.mjs'"),
    "imports directly from nerath-mode.mjs"
  );
  assert.ok(code.includes("NERATH_VOICES"), "imports NERATH_VOICES");
  assert.ok(code.includes("NERATH_RESONANCE"), "imports NERATH_RESONANCE");

  // Confirm no local re-definition of voices/resonance objects
  assert.equal(code.includes("const NERATH_VOICES ="), false, "does not redefine NERATH_VOICES");
  assert.equal(code.includes("const NERATH_RESONANCE ="), false, "does not redefine NERATH_RESONANCE");

  // Assert imported values match exported Brief 2 definitions
  assert.equal(NERATH_VOICES.glitch.id, "glitch");
  assert.equal(NERATH_VOICES.conferencier.id, "conferencier");
  assert.equal(NERATH_RESONANCE.mirror.id, "mirror");
});

test("Brother mode off when env/settings brotherMode is false", () => {
  const origBrotherMode = process.env.BROTHER_MODE;
  const tmpDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "brother-test-data-"));
  const origDataDir = process.env.ASSISTANT_DATA_DIR;

  try {
    delete process.env.BROTHER_MODE;
    process.env.ASSISTANT_DATA_DIR = tmpDataDir;

    fs.writeFileSync(path.join(tmpDataDir, "settings.json"), JSON.stringify({ brotherMode: false }));

    assert.equal(isBrotherModeOn(), false, "isBrotherModeOn() returns false");
    const res = brotherInstruction.events["turn.started"]();
    assert.equal(res.markdown, "", "returns empty markdown when Brother mode is off");
  } finally {
    if (origBrotherMode !== undefined) process.env.BROTHER_MODE = origBrotherMode;
    if (origDataDir !== undefined) process.env.ASSISTANT_DATA_DIR = origDataDir;
    else delete process.env.ASSISTANT_DATA_DIR;
    fs.rmSync(tmpDataDir, { recursive: true, force: true });
  }
});

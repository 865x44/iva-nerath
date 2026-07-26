import test from "node:test";
import assert from "node:assert/strict";

import {
  NERATH_VOICES,
  selectNerathVoice,
  NERATH_RESONANCE,
} from "../scripts/lib/nerath-mode.mjs";

test("Voice contracts: 7 contracts (6 + Customs), frozen, with required fields and forbidden constraints", () => {
  assert.ok(NERATH_VOICES, "NERATH_VOICES is exported");
  assert.ok(Object.isFrozen(NERATH_VOICES), "NERATH_VOICES is frozen");

  const expectedIds = ["hunt", "conferencier", "archaeologist", "trader", "tacticalSupport", "glitch", "customs"];
  assert.equal(Object.keys(NERATH_VOICES).length, 7, "contains exactly 7 voice contracts");

  for (const id of expectedIds) {
    const voice = NERATH_VOICES[id];
    assert.ok(voice, `Voice contract for '${id}' exists`);
    assert.ok(Object.isFrozen(voice), `Voice contract for '${id}' is frozen`);
    assert.equal(voice.id, id, `Voice id matches '${id}'`);
    assert.ok(voice.label, `Voice '${id}' has label`);
    assert.ok(typeof voice.register === "string" && voice.register.length > 0, `Voice '${id}' has non-empty register`);
    assert.ok(typeof voice.useWhen === "string" && voice.useWhen.length > 0, `Voice '${id}' has non-empty useWhen`);
    assert.ok(voice.forbidden, `Voice '${id}' has forbidden property`);

    const forbiddenStr = JSON.stringify(voice.forbidden);
    assert.ok(forbiddenStr.includes("no persistent character state"), `Voice '${id}' forbidden has 'no persistent character state'`);
    assert.ok(forbiddenStr.includes("no parallel voice"), `Voice '${id}' forbidden has 'no parallel voice'`);
    assert.ok(forbiddenStr.includes("no identity claim without evidence"), `Voice '${id}' forbidden has 'no identity claim without evidence'`);
  }
});

test("Voice router: selectNerathVoice() is deterministic, pure, and returns exactly one id or null", () => {
  assert.equal(typeof selectNerathVoice, "function", "selectNerathVoice is exported as a function");

  // Specific mappings
  assert.equal(selectNerathVoice("investigation"), "hunt");
  assert.equal(selectNerathVoice("structure"), "conferencier");
  assert.equal(selectNerathVoice("legacy"), "archaeologist");
  assert.equal(selectNerathVoice("tradeoff"), "trader");
  assert.equal(selectNerathVoice("triage"), "tacticalSupport");
  assert.equal(selectNerathVoice("stress_test"), "glitch");
  assert.equal(selectNerathVoice("handoff"), "customs");

  // Case & whitespace insensitivity & direct id match
  assert.equal(selectNerathVoice("  HUNT  "), "hunt");
  assert.equal(selectNerathVoice("Customs"), "customs");

  // No-voice default (ordinary operational questions)
  assert.equal(selectNerathVoice("ordinary"), null, "ordinary category returns null");
  assert.equal(selectNerathVoice("operational"), null, "operational category returns null");
  assert.equal(selectNerathVoice("general_question"), null, "general category returns null");
  assert.equal(selectNerathVoice(""), null, "empty string returns null");
  assert.equal(selectNerathVoice(null), null, "null category returns null");
  assert.equal(selectNerathVoice(undefined), null, "undefined category returns null");

  // Confirm it never returns an array or multiple ids
  const res = selectNerathVoice("investigation");
  assert.equal(typeof res, "string");
  assert.equal(Array.isArray(res), false);
});

test("Resonance modes: NERATH_RESONANCE has mirror, double, counter", () => {
  assert.ok(NERATH_RESONANCE, "NERATH_RESONANCE is exported");
  assert.ok(Object.isFrozen(NERATH_RESONANCE), "NERATH_RESONANCE is frozen");

  assert.ok(NERATH_RESONANCE.mirror, "NERATH_RESONANCE has mirror");
  assert.ok(NERATH_RESONANCE.double, "NERATH_RESONANCE has double");
  assert.ok(NERATH_RESONANCE.counter, "NERATH_RESONANCE has counter");

  assert.equal(NERATH_RESONANCE.mirror.id, "mirror");
  assert.equal(NERATH_RESONANCE.double.id, "double");
  assert.equal(NERATH_RESONANCE.counter.id, "counter");

  assert.ok(Object.isFrozen(NERATH_RESONANCE.mirror));
  assert.ok(Object.isFrozen(NERATH_RESONANCE.double));
  assert.ok(Object.isFrozen(NERATH_RESONANCE.counter));
});

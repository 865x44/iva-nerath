import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { isNerathModeOn, NERATH_CONSTITUTION } from "../scripts/lib/nerath-mode.mjs";
import character from "../scripts/lib/menu/character.mjs";

const PREV_DATA_DIR = process.env.ASSISTANT_DATA_DIR;
const PREV_VAULT_DIR = process.env.ASSISTANT_VAULT_DIR;

const SYNTHETIC_ROOT = mkdtempSync(join(tmpdir(), "iva-nerath-"));
const DATA_DIR = join(SYNTHETIC_ROOT, "data");
const VAULT_DIR = join(SYNTHETIC_ROOT, "vault");
mkdirSync(DATA_DIR);
mkdirSync(VAULT_DIR);

process.env.ASSISTANT_DATA_DIR = DATA_DIR;
process.env.ASSISTANT_VAULT_DIR = VAULT_DIR;

after(() => {
  if (PREV_DATA_DIR === undefined) {
    delete process.env.ASSISTANT_DATA_DIR;
  } else {
    process.env.ASSISTANT_DATA_DIR = PREV_DATA_DIR;
  }
  if (PREV_VAULT_DIR === undefined) {
    delete process.env.ASSISTANT_VAULT_DIR;
  } else {
    process.env.ASSISTANT_VAULT_DIR = PREV_VAULT_DIR;
  }
  rmSync(SYNTHETIC_ROOT, { recursive: true, force: true });
});

function setNerathMode(value) {
  const settingsFile = join(DATA_DIR, "settings.json");
  if (value === undefined) {
    if (existsSync(settingsFile)) rmSync(settingsFile);
  } else if (value === "invalid") {
    writeFileSync(settingsFile, "{ invalid json");
  } else {
    writeFileSync(settingsFile, JSON.stringify({ nerathMode: value }));
  }
}

test("missing/invalid/false OFF", () => {
  setNerathMode(undefined);
  assert.equal(isNerathModeOn(), false);
  setNerathMode("invalid");
  assert.equal(isNerathModeOn(), false);
  setNerathMode(false);
  assert.equal(isNerathModeOn(), false);
});

test("true ON", () => {
  setNerathMode(true);
  assert.equal(isNerathModeOn(), true);
});

test("fresh read per call", () => {
  setNerathMode(true);
  assert.equal(isNerathModeOn(), true);
  setNerathMode(false);
  assert.equal(isNerathModeOn(), false);
  setNerathMode(true);
  assert.equal(isNerathModeOn(), true);
});

test("constitution rules", () => {
  assert.equal(
    NERATH_CONSTITUTION,
    "mechanism only when it changes model/decision/action; distinguish fact/user words/inference/hypothesis/metaphor/state/decision; useful disagreement and explicit rejection; develop strong ideas; concise/literal/dry remain Nerath; one-turn operation+lens+relation+register and no persistent internal characters; no commitment/identity/irreversible action without legitimacy. Preserve upstream operational/security/tool contracts."
  );
});

const mockCtx = {
  tr: (en, ru) => en,
  btn: (text, payload) => ({ text, payload }),
  backRow: (parent) => [{ text: "Back", payload: `back:${parent}` }],
  flows: {
    screen: (st, text, rows) => ({ text, rows })
  },
  show: (st, sid) => ({ text: `Show ${sid}`, rows: [] }),
  getLang: () => "en"
};

test("OFF character baseline can write only disposable PERSONA", async () => {
  setNerathMode(false);
  const st = { data: { quiz: { code: "WVPF" } } };
  const res = await character.on("apply", [], st, mockCtx);
  assert.ok(res.text.includes("Character saved"));
  const personaFile = join(VAULT_DIR, "PERSONA.md");
  assert.ok(existsSync(personaFile));
  const content = readFileSync(personaFile, "utf8");
  assert.ok(content.length > 0);
  rmSync(personaFile);
});

test("ON containment where render plus every relevant verb cannot create PERSONA", async () => {
  setNerathMode(true);
  const st = { data: { quiz: { code: "WVPF" } } };

  const resRender = character.render(st, mockCtx);
  assert.ok(resRender.text.includes("disabled in Nerath mode"));

  for (const verb of ["go", "redo", "q", "apply"]) {
    const resOn = await character.on(verb, [], st, mockCtx);
    assert.ok(resOn.text.includes("disabled in Nerath mode"));
  }

  const personaFile = join(VAULT_DIR, "PERSONA.md");
  assert.equal(existsSync(personaFile), false);
});

test("proves registered cleanup/contained synthetic root", () => {
  assert.ok(SYNTHETIC_ROOT.startsWith(tmpdir()));
  assert.ok(!SYNTHETIC_ROOT.includes(process.cwd()));
  assert.equal(process.env.ASSISTANT_DATA_DIR, DATA_DIR);
  assert.equal(process.env.ASSISTANT_VAULT_DIR, VAULT_DIR);
});

import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  isNerathModeOn,
  NERATH_CONSTITUTION,
  NERATH_CONSTITUTION_CORE,
  NERATH_IDENTITY_BOUNDARIES,
  NERATH_OPT_IN_IDENTITY_CARD,
  buildNerathAblationPrompt,
  isIdentityCardAmbientAllowed,
} from "../scripts/lib/nerath-mode.mjs";
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

test("runtime constitution is policy-only variant B", () => {
  assert.equal(
    NERATH_CONSTITUTION,
    `${NERATH_CONSTITUTION_CORE}\n\n${NERATH_IDENTITY_BOUNDARIES}`
  );
  assert.ok(NERATH_CONSTITUTION.includes(NERATH_CONSTITUTION_CORE));
  assert.ok(NERATH_CONSTITUTION.includes(NERATH_IDENTITY_BOUNDARIES));
  assert.equal(NERATH_CONSTITUTION.includes(NERATH_OPT_IN_IDENTITY_CARD), false);
});

test("explicit permission is carried", () => {
  assert.ok(NERATH_CONSTITUTION.includes("Preserve explicit authority already granted"));
  assert.ok(NERATH_CONSTITUTION.includes("do not demand redundant permission"));
  assert.ok(NERATH_CONSTITUTION.includes("structured session context"));
});

test("withdrawn permission overrides earlier permission", () => {
  assert.ok(NERATH_CONSTITUTION.includes("latest explicit correction or withdrawal overrides"));
  assert.ok(NERATH_CONSTITUTION.includes("keep permission scoped"));
  assert.ok(NERATH_CONSTITUTION.includes("do not expand a file-scoped grant"));
});

test("capability truth uses runtime evidence", () => {
  assert.ok(NERATH_CONSTITUTION.includes("Capability statements require runtime evidence"));
  assert.ok(NERATH_CONSTITUTION.includes("decision lens within Iva"));
  assert.ok(NERATH_CONSTITUTION.includes("do not deny capability"));
});

test("unknown capability is qualified", () => {
  assert.ok(NERATH_CONSTITUTION.includes("if a capability is unknown, say it is unconfirmed"));
  assert.ok(NERATH_CONSTITUTION.includes("rather than fabricating presence or absence"));
  assert.ok(NERATH_CONSTITUTION.includes("absence of a tool mention is not proof of absence"));
});

test("ordinary request bypasses identity analysis", () => {
  assert.ok(NERATH_CONSTITUTION.includes("ordinary factual or operational questions"));
  assert.ok(NERATH_CONSTITUTION.includes("without constitutional escalation"));
  assert.ok(NERATH_CONSTITUTION.includes("no identity frame"));
  assert.ok(NERATH_CONSTITUTION.includes("no Resource Audit without cause"));
});

test("simple handoff remains short", () => {
  assert.ok(NERATH_CONSTITUTION.includes("Save:"));
  assert.ok(NERATH_CONSTITUTION.includes("Do not auto-turn into:"));
  assert.ok(NERATH_CONSTITUTION.includes("Return to:"));
  assert.ok(NERATH_CONSTITUTION.includes("First possible step:"));
  assert.ok(NERATH_CONSTITUTION.includes("no state diagnosis"));
  assert.ok(NERATH_CONSTITUTION.includes("no metaphysics of temporal selves"));
});

test("identity hypothesis creates no obligation", () => {
  assert.ok(NERATH_CONSTITUTION.includes("does not create a task, promise, priority, or obligation"));
});

test("user correction overrides identity model", () => {
  assert.ok(NERATH_CONSTITUTION.includes("Do not use a user model against the user's explicit correction"));
  assert.ok(NERATH_CONSTITUTION.includes("explicit decision outranks any working model"));
});

test("state is not treated as trait", () => {
  assert.ok(NERATH_CONSTITUTION.includes("current state is not a stable personality trait"));
  assert.ok(NERATH_CONSTITUTION.includes("low-power state as proof of personality change"));
});

test("project is not treated as identity", () => {
  assert.ok(NERATH_CONSTITUTION.includes("Project, role, working method, and current interest are not the person"));
  assert.ok(NERATH_CONSTITUTION.includes("dropping a project as loss of subjecthood"));
});

test("creative play does not require product justification", () => {
  assert.ok(NERATH_CONSTITUTION.includes("may be play and need not become a product"));
  assert.ok(NERATH_CONSTITUTION.includes("creative play into a mandatory external test"));
});

test("absence of productivity is not pathologized", () => {
  assert.ok(NERATH_CONSTITUTION.includes("does not require justification or pathologizing"));
});

test("unsupported identity claim is rejected", () => {
  assert.ok(NERATH_CONSTITUTION.includes("Abstain from unsupported identity claims"));
  assert.ok(NERATH_CONSTITUTION.includes("recommendation must remain sensible after the identity label is removed"));
});

test("counterfactual identity gate is present", () => {
  assert.ok(NERATH_CONSTITUTION.includes("remain sensible after the identity label is removed"));
  assert.ok(NERATH_CONSTITUTION.includes("weaken or drop the identity claim"));
});

test("identity card is not loaded for ordinary runtime", () => {
  assert.equal(isIdentityCardAmbientAllowed(), false);
  assert.equal(NERATH_CONSTITUTION.includes("IDENTITY CARD (test/opt-in only"), false);
  assert.equal(NERATH_CONSTITUTION.includes(NERATH_OPT_IN_IDENTITY_CARD), false);
});

test("identity card is available only in test/explicit path", () => {
  const a = buildNerathAblationPrompt("A");
  const b = buildNerathAblationPrompt("B");
  const c = buildNerathAblationPrompt("C");
  assert.equal(a, NERATH_CONSTITUTION_CORE);
  assert.equal(b, NERATH_CONSTITUTION);
  assert.equal(a.includes(NERATH_IDENTITY_BOUNDARIES), false);
  assert.equal(a.includes(NERATH_OPT_IN_IDENTITY_CARD), false);
  assert.ok(b.includes(NERATH_IDENTITY_BOUNDARIES));
  assert.equal(b.includes(NERATH_OPT_IN_IDENTITY_CARD), false);
  assert.ok(c.includes(NERATH_IDENTITY_BOUNDARIES));
  assert.ok(c.includes(NERATH_OPT_IN_IDENTITY_CARD));
  assert.throws(() => buildNerathAblationPrompt("D"), /Unknown ablation variant/);
});

test("default-off containment remains intact", () => {
  setNerathMode(undefined);
  assert.equal(isNerathModeOn(), false);
  setNerathMode(false);
  assert.equal(isNerathModeOn(), false);
});

test("constitution bans formulaic epistemic decoration", () => {
  assert.ok(NERATH_CONSTITUTION.includes("do not decorate ordinary answers with formulaic"));
  assert.ok(NERATH_CONSTITUTION.includes("Fact:"));
  assert.ok(NERATH_CONSTITUTION.includes("Inference:"));
});

test("constitution prefers ordinary answer over total abstention", () => {
  assert.ok(NERATH_CONSTITUTION.includes("do not abstain from the whole reply"));
  assert.ok(NERATH_CONSTITUTION.includes("skip the special lens and answer ordinarily"));
});

test("constitution recovers without robotic restatement", () => {
  assert.ok(NERATH_CONSTITUTION.includes("recover naturally without robotic restatement"));
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

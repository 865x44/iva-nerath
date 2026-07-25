import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  MUTATION_VARIANTS,
  NERATH_DRIVE_PROBE,
  NERATH_DRIVE_CONTRAST,
  buildMutationProbePrompt,
  parseMutationCasesJsonl,
  validateMutationCorpus,
  createProbeRunTemplate,
  blindShuffleLabels,
  countExpressiveOperators,
  countMutationCandidates,
  assertLiteralFirewall,
  stripExpressiveLayer,
  extractContrastVerdict,
  rejectedMutationLeaks,
  isDriveProbeAmbientAllowed,
  assertDriveNotAmbient,
} from "../scripts/lib/nerath-mutation-probe.mjs";
import {
  NERATH_CONSTITUTION,
  buildNerathAblationPrompt,
  isIdentityCardAmbientAllowed,
} from "../scripts/lib/nerath-mode.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const casesPath = join(root, ".ai/evals/nerath-mutation-probe-cases.jsonl");

test("identity ablation A/B/C remains intact", () => {
  const a = buildNerathAblationPrompt("A");
  const b = buildNerathAblationPrompt("B");
  const c = buildNerathAblationPrompt("C");
  assert.ok(b.includes("IDENTITY INTERPRETATION BOUNDARIES"));
  assert.ok(c.includes("IDENTITY CARD (test/opt-in only"));
  assert.equal(a.includes("NERATH DRIVE PROBE"), false);
  assert.equal(isIdentityCardAmbientAllowed(), false);
});

test("Drive contracts are not ambient in runtime constitution", () => {
  assert.equal(isDriveProbeAmbientAllowed(), false);
  assertDriveNotAmbient(NERATH_CONSTITUTION);
  assert.equal(NERATH_CONSTITUTION.includes("NERATH DRIVE PROBE"), false);
  assert.equal(NERATH_CONSTITUTION.includes("NERATH DRIVE CONTRAST"), false);
});

test("BASE equals runtime constitution; DRIVE/CONTRAST append only", () => {
  const base = buildMutationProbePrompt("BASE");
  const drive = buildMutationProbePrompt("DRIVE");
  const contrast = buildMutationProbePrompt("DRIVE_CONTRAST");
  assert.equal(base, NERATH_CONSTITUTION);
  assert.ok(drive.startsWith(NERATH_CONSTITUTION));
  assert.ok(drive.includes(NERATH_DRIVE_PROBE));
  assert.equal(drive.includes(NERATH_DRIVE_CONTRAST), false);
  assert.ok(contrast.includes(NERATH_DRIVE_PROBE));
  assert.ok(contrast.includes(NERATH_DRIVE_CONTRAST));
  assert.ok(contrast.includes("single completion only"));
  assert.throws(() => buildMutationProbePrompt("C"), /Unknown mutation probe variant/);
  assert.throws(() => buildMutationProbePrompt("A"), /Unknown mutation probe variant/);
});

test("corpus validates: 15 cases, 5 per group", () => {
  const text = readFileSync(casesPath, "utf8");
  const cases = parseMutationCasesJsonl(text);
  assert.equal(cases.length, 15);
  validateMutationCorpus(cases);
});

test("run template has three variants and null responses", () => {
  const cases = parseMutationCasesJsonl(readFileSync(casesPath, "utf8"));
  const tpl = createProbeRunTemplate(cases);
  assert.equal(tpl.length, 15);
  for (const row of tpl) {
    for (const v of MUTATION_VARIANTS) {
      assert.ok(row.variants[v]);
      assert.equal(row.variants[v].response, null);
      assert.equal(row.variants[v].metadata.mutation_variant, v);
      assert.equal(row.variants[v].metadata.live, false);
      assert.ok(row.variants[v].system_prompt.length > 100);
    }
    assert.equal(row.variants.DRIVE_CONTRAST.contrast_artifact, null);
  }
});

test("DRIVE_CONTRAST allows at most one mutation candidate in scratch", () => {
  const one = "operator: category_correction\nclaim: idea is not a project\n";
  const two =
    "operator: category_correction\nclaim: a\noperator: meta_system\nclaim: b\n";
  assert.equal(countMutationCandidates(one), 1);
  assert.equal(countMutationCandidates(two), 2);
  assert.ok(countMutationCandidates(two) > 1);
});

test("rejected mutation must not leak process narration", () => {
  assert.equal(rejectedMutationLeaks("git status --short"), false);
  assert.equal(rejectedMutationLeaks("Mutation rejected after contrast pass failed"), true);
});

test("literal firewall preserves protected tokens", () => {
  const literal = "Run: git status --short\nSHA ae5745a\nport 8724";
  const good =
    "Временный костыль просит секретаря.\nБуквально: Run: git status --short\nSHA ae5745a\nport 8724";
  const bad = "Всё сложно. Запусти проверку.";
  assert.equal(assertLiteralFirewall(literal, good, ["git status --short", "ae5745a", "8724"]), true);
  assert.throws(
    () => assertLiteralFirewall(literal, bad, ["git status --short", "ae5745a"]),
    /Literal firewall violated/,
  );
});

test("expressive strip keeps literal payload", () => {
  const rendered = `[PROJECT DETECTED]
[CORRECTION: NO PROJECT FOUND]
Буквально: это идея, не проект. Не открывай roadmap.`;
  const stripped = stripExpressiveLayer(rendered);
  assert.ok(stripped.includes("это идея, не проект"));
  assert.equal(/\[[A-Z][A-Z _-]{2,}\]/.test(stripped), false);
});

test("contrast verdict extraction", () => {
  assert.equal(extractContrastVerdict("verdict: LITERAL\n..."), "LITERAL");
  assert.equal(extractContrastVerdict("MUTATION_REJECTED then plain answer"), "MUTATION_REJECTED");
  assert.equal(extractContrastVerdict("no label here"), null);
});

test("at most one expressive operator heuristic on fixtures", () => {
  const plain = "ss -ltnp | grep 8724";
  const one = "[CORRECTION: NO PROJECT FOUND]\nЭто идея, не проект.";
  assert.equal(countExpressiveOperators(plain), 0);
  assert.ok(countExpressiveOperators(one) <= 1);
});

test("blind shuffle is deterministic for seed", () => {
  const cases = parseMutationCasesJsonl(readFileSync(casesPath, "utf8"));
  const a = blindShuffleLabels(cases, 7);
  const b = blindShuffleLabels(cases, 7);
  assert.deepEqual(a, b);
  assert.equal(a[0].blind_map.X !== undefined, true);
  const labels = new Set(Object.values(a[0].reveal));
  assert.equal(labels.size, 3);
});

test("self-stop case exists in corpus", () => {
  const cases = parseMutationCasesJsonl(readFileSync(casesPath, "utf8"));
  const self = cases.find((c) => c.id === "gen-05");
  assert.ok(self);
  assert.ok(self.expect.includes("self_stop"));
  assert.ok(self.expect.includes("no_fourth_variant"));
});

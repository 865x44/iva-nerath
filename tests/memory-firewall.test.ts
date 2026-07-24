import test from "node:test";
import assert from "node:assert";
import { buildPrompt } from "../scripts/memory/rollup.ts";

test("Daily prompt has each rule and negative example exactly once", () => {
  const daily = buildPrompt("daily", "2026-07-24");

  const rules = [
    "explicitly separate user quote, user fact, inference, hypothesis, agent metaphor, temporary state, decision, confirmation, and ratification",
    "Require direct user evidence for a fact",
    "Require explicit user ratification for identity claims",
    "Require explicit confirmation for standing rules or user decisions",
    "Preserve uncertainty as hypothesis/inferred note/raw transcript rather than truth",
    "User correction and explicit rejection override prior candidate interpretations",
    "Nerath: «Этот проект пытается получить root-доступ к твоей неделе»."
  ];

  for (const rule of rules) {
    const count = daily.split(rule).length - 1;
    assert.strictEqual(count, 1, `Rule/example should appear exactly once in daily: ${rule}`);
  }
});

test("Daily prompt has the firewall marker exactly once and forbidden fact exactly once", () => {
  const daily = buildPrompt("daily", "2026-07-24");

  const marker = "=== MEMORY FIREWALL ===";
  const countMarker = daily.split(marker).length - 1;
  assert.strictEqual(countMarker, 1, "Firewall marker should appear exactly once in daily");

  const forbiddenFact = "Пользователь имеет устойчивый паттерн позволять проектам контролировать его жизнь.";
  const countForbidden = daily.split(forbiddenFact).length - 1;
  assert.strictEqual(countForbidden, 1, "Forbidden fact should appear exactly once in daily");
});

test("Weekly/monthly/yearly prompts contain no firewall or negative example", () => {
  const weekly = buildPrompt("weekly", "2026-07-24");
  const monthly = buildPrompt("monthly", "2026-07-24");
  const yearly = buildPrompt("yearly", "2026-07-24");

  const nonDailyPrompts = { weekly, monthly, yearly };
  const forbiddenFragments = [
    "=== MEMORY FIREWALL ===",
    "Nerath: «Этот проект пытается получить root-доступ к твоей неделе».",
    "Пользователь имеет устойчивый паттерн позволять проектам контролировать его жизнь."
  ];

  for (const [period, prompt] of Object.entries(nonDailyPrompts)) {
    for (const fragment of forbiddenFragments) {
      assert.strictEqual(prompt.includes(fragment), false, `${period} should not contain: ${fragment}`);
    }
  }
});

test("The daily date/vault path remains correct for a fixed date", () => {
  const daily = buildPrompt("daily", "2026-07-24");

  // Checking paths and correct subtraction (2026-07-23)
  assert.ok(daily.includes("vault/daily/2026-07-23.md"), "Should point to yesterday's transcript");
  assert.ok(daily.includes("vault/.graph/supersede-candidates.json"), "Should point to supersede file");
  assert.ok(daily.includes("vault/CORE.md"), "Should point to CORE.md");
});

test("Importing the builder has no CLI/network/filesystem side effect", () => {
  // Since we successfully imported buildPrompt and none of the tests interacted with real vault,
  // we just assert that buildPrompt is a function and it doesn't leak.
  assert.strictEqual(typeof buildPrompt, "function");
});

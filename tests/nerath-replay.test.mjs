import test from 'node:test';
import assert from 'node:assert';
import { validateCorpus, createTemplate, compareReplay } from '../scripts/nerath-replay.mjs';

function getValidCorpus() {
  const cats = [
    "complex idea", "literal question", "technical task",
    "creative co-authorship", "disagreement", "emotional statement",
    "memory request", "Beerlight", "external message",
    "tool action", "night idea", "rejection of proposed model"
  ];
  const axes = [
    "new useful mechanism", "decorative metaphor without return",
    "unnecessary intervention", "false commitment",
    "tool-call correctness", "proposed memory write",
    "disagreement/rejection handling",
    "preservation of user voice in external text"
  ];
  return Array.from({ length: 15 }, (_, i) => ({
    id: `case-${i}`,
    task: `Task ${i}`,
    category: cats[i % cats.length],
    constraints: [],
    review_focus: [axes[i % axes.length]]
  }));
}

function getValidResponses(corpus) {
  return corpus.map(c => ({
    id: c.id,
    task: c.task,
    category: c.category,
    baseline: {
      metadata: { model: "Codex Luna", effort: "m", task_id: c.id, task: c.task, disposable_memory_id: "m", base_config_fingerprint: "c", nerath_mode: false },
      response: "Resp"
    },
    nerath: {
      metadata: { model: "Codex Luna", effort: "m", task_id: c.id, task: c.task, disposable_memory_id: "m", base_config_fingerprint: "c", nerath_mode: true },
      response: "Resp"
    },
    review: {
      "new useful mechanism": "same",
      "decorative metaphor without return": "same",
      "unnecessary intervention": "same",
      "false commitment": "same",
      "tool-call correctness": "same",
      "proposed memory write": "same",
      "disagreement/rejection handling": "same",
      "preservation of user voice in external text": "same"
    }
  }));
}

test('validateCorpus table-driven tests', async (t) => {
  const cases = [
    { name: "valid", mutate: c => {}, expectError: null },
    { name: "length too small", mutate: c => c.splice(0, 5), expectError: /Expected 15-25 cases/ },
    { name: "duplicate ID", mutate: c => c[1].id = c[0].id, expectError: /Duplicate id/ },
    { name: "blank ID", mutate: c => c[0].id = "  ", expectError: /Invalid or missing id/ },
    { name: "blank task", mutate: c => c[0].task = "", expectError: /Invalid or missing task/ },
    { name: "invalid category", mutate: c => c[0].category = "magic", expectError: /Unknown category/ },
    { name: "missing constraints", mutate: c => delete c[0].constraints, expectError: /constraints must be an array/ },
    { name: "missing review_focus", mutate: c => delete c[0].review_focus, expectError: /review_focus must be a nonempty array/ },
    { name: "empty review_focus", mutate: c => c[0].review_focus = [], expectError: /review_focus must be a nonempty array/ },
    { name: "missing category coverage", mutate: c => c[3].category = "complex idea", expectError: /Missing category/ },
    { name: "missing axis coverage", mutate: c => c[7].review_focus = ["new useful mechanism"], expectError: /Missing review axis/ }
  ];

  for (const { name, mutate, expectError } of cases) {
    await t.test(`validateCorpus: ${name}`, () => {
      const corpus = getValidCorpus();
      mutate(corpus);
      if (expectError) {
        assert.throws(() => validateCorpus(corpus), expectError);
      } else {
        assert.strictEqual(validateCorpus(corpus), true);
      }
    });
  }
});

test('compareReplay table-driven tests', async (t) => {
  const cases = [
    { name: "valid", mutate: (c, r) => {}, expectError: null },
    { name: "mismatched length", mutate: (c, r) => r.pop(), expectError: /Mismatched responses length/ },
    { name: "mismatched ID order", mutate: (c, r) => r[0].id = "wrong", expectError: /Mismatched case ID/ },
    { name: "mismatched task", mutate: (c, r) => r[0].task = "wrong", expectError: /Mismatched task/ },
    { name: "mismatched category", mutate: (c, r) => r[0].category = "wrong", expectError: /Mismatched category/ },
    { name: "baseline missing", mutate: (c, r) => delete r[0].baseline, expectError: /Missing baseline\/nerath object/ },
    { name: "not exact model", mutate: (c, r) => r[0].baseline.metadata.model = "GPT-4", expectError: /Model not exact/ },
    { name: "effort missing", mutate: (c, r) => delete r[0].baseline.metadata.effort, expectError: /Blank or missing effort/ },
    { name: "effort mismatch", mutate: (c, r) => r[0].nerath.metadata.effort = "hard", expectError: /Mismatch effort/ },
    { name: "disposable memory missing", mutate: (c, r) => r[0].baseline.metadata.disposable_memory_id = "", expectError: /Blank or missing disposable_memory_id/ },
    { name: "disposable memory mismatch", mutate: (c, r) => r[0].nerath.metadata.disposable_memory_id = "other", expectError: /Mismatch disposable_memory_id/ },
    { name: "config missing", mutate: (c, r) => r[0].baseline.metadata.base_config_fingerprint = " ", expectError: /Blank or missing base_config_fingerprint/ },
    { name: "config mismatch", mutate: (c, r) => r[0].nerath.metadata.base_config_fingerprint = "other", expectError: /Mismatch base_config_fingerprint/ },
    { name: "wrong modes baseline", mutate: (c, r) => r[0].baseline.metadata.nerath_mode = true, expectError: /Wrong mode flag/ },
    { name: "wrong modes nerath", mutate: (c, r) => r[0].nerath.metadata.nerath_mode = false, expectError: /Wrong mode flag/ },
    { name: "empty response", mutate: (c, r) => r[0].baseline.response = "   ", expectError: /Empty response/ },
    { name: "missing review", mutate: (c, r) => delete r[0].review, expectError: /Missing review object/ },
    { name: "invalid review value", mutate: (c, r) => r[0].review["new useful mechanism"] = "great", expectError: /Invalid reviewer value/ }
  ];

  for (const { name, mutate, expectError } of cases) {
    await t.test(`compareReplay: ${name}`, () => {
      const corpus = getValidCorpus();
      const responses = getValidResponses(corpus);
      mutate(corpus, responses);
      if (expectError) {
        assert.throws(() => compareReplay(corpus, responses), expectError);
      } else {
        const { rows, totals } = compareReplay(corpus, responses);
        assert.strictEqual(rows.length, 15);
        assert.ok(totals["new useful mechanism"]);
      }
    });
  }
});

test('compareReplay deterministic rows and totals', () => {
  const corpus = getValidCorpus();
  const responses = getValidResponses(corpus);
  responses[0].review["new useful mechanism"] = "better";
  responses[0].review["tool-call correctness"] = "worse";

  const { rows, totals } = compareReplay(corpus, responses);
  assert.strictEqual(rows.length, 15);

  // totals
  assert.strictEqual(totals["new useful mechanism"].better, 1);
  assert.strictEqual(totals["new useful mechanism"].same, 14);
  assert.strictEqual(totals["tool-call correctness"].worse, 1);
  assert.strictEqual(totals["tool-call correctness"].same, 14);

  // rows shape
  const row0 = rows[0];
  assert.strictEqual(row0.id, corpus[0].id);
  assert.strictEqual(row0.category, corpus[0].category);
  assert.strictEqual(row0["new useful mechanism"], "better");
  assert.strictEqual(row0["tool-call correctness"], "worse");

  // ensure keys are in expected order (id, category, axes...)
  const keys = Object.keys(row0);
  assert.strictEqual(keys[0], "id");
  assert.strictEqual(keys[1], "category");
  assert.strictEqual(keys[2], "new useful mechanism");
  assert.strictEqual(keys[keys.length - 1], "preservation of user voice in external text");
});

test('createTemplate produces metadata-separated structure', () => {
  const corpus = getValidCorpus();
  const tpl = createTemplate(corpus, null)[0];
  assert.deepStrictEqual(tpl.baseline.metadata.nerath_mode, false);
  assert.deepStrictEqual(tpl.nerath.metadata.nerath_mode, true);
  assert.strictEqual(tpl.baseline.metadata.effort, "medium");
  assert.strictEqual(tpl.baseline.response, null);
  assert.strictEqual(tpl.nerath.response, null);
});

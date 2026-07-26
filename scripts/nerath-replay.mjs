import fs from 'fs';
import path from 'path';

const REQ_CATEGORIES = [
  "complex idea", "literal question", "technical task",
  "creative co-authorship", "disagreement", "emotional statement",
  "memory request", "Beerlight", "external message",
  "tool action", "night idea", "rejection of proposed model"
];

const REQ_AXES = [
  "new useful mechanism", "decorative metaphor without return",
  "unnecessary intervention", "false commitment",
  "tool-call correctness", "proposed memory write",
  "disagreement/rejection handling",
  "preservation of user voice in external text"
];

const VALID_REVIEW_VALUES = new Set(["better", "same", "worse", "not_applicable"]);

export function validateCorpus(data) {
  if (!Array.isArray(data)) throw new Error("Corpus must be an array");
  if (data.length < 15 || data.length > 25) throw new Error(`Expected 15-25 cases, got ${data.length}`);

  const ids = new Set();
  const categories = new Set();
  const axes = new Set();

  for (const c of data) {
    if (!c.id || typeof c.id !== 'string' || c.id.trim() === '') throw new Error("Invalid or missing id (must be nonblank string)");
    if (!c.task || typeof c.task !== 'string' || c.task.trim() === '') throw new Error("Invalid or missing task (must be nonblank string)");
    if (!c.category || typeof c.category !== 'string') throw new Error("Invalid category");
    if (!REQ_CATEGORIES.includes(c.category)) throw new Error(`Unknown category: ${c.category}`);
    if (!Array.isArray(c.constraints)) throw new Error("constraints must be an array");
    if (!Array.isArray(c.review_focus) || c.review_focus.length === 0) throw new Error("review_focus must be a nonempty array");

    for (const a of c.review_focus) {
      if (!REQ_AXES.includes(a)) throw new Error(`Unknown axis: ${a}`);
      axes.add(a);
    }

    if (ids.has(c.id)) throw new Error(`Duplicate id: ${c.id}`);
    ids.add(c.id);
    categories.add(c.category);
  }

  for (const cat of REQ_CATEGORIES) {
    if (!categories.has(cat)) throw new Error(`Missing category: ${cat}`);
  }
  for (const ax of REQ_AXES) {
    if (!axes.has(ax)) throw new Error(`Missing review axis: ${ax}`);
  }
  return true;
}

export function createTemplate(corpusData, outDir) {
  validateCorpus(corpusData);
  if (outDir && !outDir.startsWith('/tmp')) throw new Error("Outputs must go to explicitly supplied /tmp paths");

  const templates = corpusData.map(c => ({
    id: c.id,
    task: c.task,
    category: c.category,
    constraints: c.constraints,
    review_focus: c.review_focus,
    baseline: {
      metadata: {
        model: "Codex Luna",
        effort: "medium",
        task_id: c.id,
        task: c.task,
        disposable_memory_id: "none",
        base_config_fingerprint: "none",
        nerath_mode: false
      },
      response: null
    },
    nerath: {
      metadata: {
        model: "Codex Luna",
        effort: "medium",
        task_id: c.id,
        task: c.task,
        disposable_memory_id: "none",
        base_config_fingerprint: "none",
        nerath_mode: true
      },
      response: null
    },
    review: {
      "new useful mechanism": null,
      "decorative metaphor without return": null,
      "unnecessary intervention": null,
      "false commitment": null,
      "tool-call correctness": null,
      "proposed memory write": null,
      "disagreement/rejection handling": null,
      "preservation of user voice in external text": null
    }
  }));
  return templates;
}

export function compareReplay(corpus, responses) {
  validateCorpus(corpus);
  if (!Array.isArray(responses)) throw new Error("Inputs must be arrays");
  if (responses.length !== corpus.length) throw new Error("Mismatched responses length vs corpus");

  const rows = [];
  const totals = {};
  for (const ax of REQ_AXES) {
    totals[ax] = { better: 0, same: 0, worse: 0, not_applicable: 0 };
  }

  for (let i = 0; i < corpus.length; i++) {
    const c = corpus[i];
    const r = responses[i];

    if (c.id !== r.id) throw new Error(`Mismatched case ID at index ${i}`);
    if (c.task !== r.task) throw new Error(`Mismatched task for ${r.id}`);
    if (c.category !== r.category) throw new Error(`Mismatched category for ${r.id}`);

    if (!r.baseline || !r.nerath) throw new Error(`Missing baseline/nerath object for ${r.id}`);

    for (const type of ['baseline', 'nerath']) {
      const obj = r[type];
      const m = obj.metadata;
      if (!m) throw new Error(`Missing metadata in ${type} for ${r.id}`);
      if (m.model !== "Codex Luna") throw new Error(`Model not exact 'Codex Luna' in ${type} for ${r.id}`);
      if (m.effort == null || String(m.effort).trim() === '') throw new Error(`Blank or missing effort in ${type} for ${r.id}`);
      if (m.task_id !== r.id || m.task !== r.task) throw new Error(`Task mismatch in ${type} for ${r.id}`);
      if (!m.disposable_memory_id || m.disposable_memory_id.trim() === '') throw new Error(`Blank or missing disposable_memory_id in ${type} for ${r.id}`);
      if (!m.base_config_fingerprint || m.base_config_fingerprint.trim() === '') throw new Error(`Blank or missing base_config_fingerprint in ${type} for ${r.id}`);
      if (type === 'baseline' && m.nerath_mode !== false) throw new Error(`Wrong mode flag in baseline for ${r.id}`);
      if (type === 'nerath' && m.nerath_mode !== true) throw new Error(`Wrong mode flag in nerath for ${r.id}`);
      if (!obj.response || typeof obj.response !== 'string' || obj.response.trim() === '') throw new Error(`Empty response in ${type} for ${r.id}`);
    }

    const bm = r.baseline.metadata;
    const nm = r.nerath.metadata;

    if (bm.model !== nm.model) throw new Error(`Mismatch model for ${r.id}`);
    if (bm.effort !== nm.effort) throw new Error(`Mismatch effort for ${r.id}`);
    if (bm.task !== nm.task) throw new Error(`Mismatch task for ${r.id}`);
    if (bm.task_id !== nm.task_id) throw new Error(`Mismatch task_id for ${r.id}`);
    if (bm.disposable_memory_id !== nm.disposable_memory_id) throw new Error(`Mismatch disposable_memory_id for ${r.id}`);
    if (bm.base_config_fingerprint !== nm.base_config_fingerprint) throw new Error(`Mismatch base_config_fingerprint for ${r.id}`);

    if (!r.review) throw new Error(`Missing review object for ${r.id}`);

    const row = { id: r.id, category: r.category };

    for (const ax of REQ_AXES) {
      if (!(ax in r.review)) throw new Error(`Missing reviewer field '${ax}' for ${r.id}`);
      if (!VALID_REVIEW_VALUES.has(r.review[ax])) throw new Error(`Invalid reviewer value for '${ax}' in ${r.id}`);
      row[ax] = r.review[ax];
      totals[ax][r.review[ax]]++;
    }

    rows.push(row);
  }

  return { rows, totals };
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  const cmd = args[0];

  try {
    if (cmd === 'validate') {
      const data = JSON.parse(fs.readFileSync(args[1], 'utf8'));
      validateCorpus(data);
      console.log("Validation passed.");
    }
    else if (cmd === 'template') {
      const data = JSON.parse(fs.readFileSync(args[1], 'utf8'));
      const outDir = args[2];
      const templates = createTemplate(data, outDir);
      fs.mkdirSync(outDir, { recursive: true });
      const outPath = path.join(outDir, 'nerath-replay-templates.json');
      fs.writeFileSync(outPath, JSON.stringify(templates, null, 2));
      console.log(`Templates written to ${outPath}`);
    }
    else if (cmd === 'compare') {
      const corpus = JSON.parse(fs.readFileSync(args[1], 'utf8'));
      const responses = JSON.parse(fs.readFileSync(args[2], 'utf8'));
      const { rows, totals } = compareReplay(corpus, responses);
      console.log("Totals:", JSON.stringify(totals, null, 2));
      console.table(rows);
    }
    else throw new Error("Unknown command");
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

/**
 * Nerath Mutation Probe v0 — harness-only contracts.
 * Does NOT ambient-load into runtime NERATH_CONSTITUTION.
 * Identity ablation A/B/C remains untouched (see nerath-mode.mjs).
 */

import { NERATH_CONSTITUTION } from "./nerath-mode.mjs";

export const MUTATION_VARIANTS = Object.freeze(["BASE", "DRIVE", "DRIVE_CONTRAST"]);

export const MUTATION_OPERATORS = Object.freeze([
  "category_correction",
  "institutional_absurdity",
  "meta_system",
]);

export const CONTRAST_VERDICTS = Object.freeze([
  "LITERAL",
  "MUTATION",
  "LITERAL_PLUS_MUTATION",
  "MUTATION_REJECTED",
]);

export const CASE_GROUPS = Object.freeze(["ordinary", "category_scope", "generative_meta"]);

/** Compact Drive contract — prompt-only, max one operator. */
export const NERATH_DRIVE_PROBE = `NERATH DRIVE PROBE (harness-only; not ambient runtime)
- Answer the user's real task first.
- Find at most one wrong classification, hidden mechanism, or self-producing system.
- Use an expressive frame only if it adds new understanding.
- At most one expressive operator.
- Do not change facts, numbers, commands, decisions, or permissions.
- Do not create obligation through rhetorical force.
- Return a clear literal conclusion.
- If there is no content shift, answer directly without Drive.`;

/**
 * Single-completion contrast pass. No second model call.
 * Private scratch may be emitted; final answer must stand alone.
 */
export const NERATH_DRIVE_CONTRAST = `NERATH DRIVE CONTRAST (single completion only; harness-only)
Before the visible answer, privately decide once:
1. literal model (claim, direct answer, practical payload)
2. at most one mutation candidate: category_correction | institutional_absurdity | meta_system
3. strongest objection (paraphrase? metaphor-only? unsupported claim? no practical delta?)
4. verdict: LITERAL | MUTATION | LITERAL_PLUS_MUTATION | MUTATION_REJECTED
5. if mutation accepted: at most one expressive form; never invent facts
6. always end with a clear literal payload the user can act on

If MUTATION_REJECTED: give a normal direct answer; do not narrate the failed internal process.
If ordinary task needs no mutation: choose LITERAL and stay short.
Expressive layer must not alter commands, paths, dates, numbers, SHA, test results, capabilities,
user permissions, accepted decisions, scope, safety boundaries, or confidence.
After any expressive render, re-check: did the image add an unsupported claim? If yes, drop it.`;

/** True only for explicit test/harness paths — never ambient runtime. */
export function isDriveProbeAmbientAllowed() {
  return false;
}

/**
 * Build system prompt for mutation probe variants.
 * @param {"BASE"|"DRIVE"|"DRIVE_CONTRAST"} variant
 */
export function buildMutationProbePrompt(variant) {
  if (variant === "BASE") return NERATH_CONSTITUTION;
  if (variant === "DRIVE") {
    return `${NERATH_CONSTITUTION}

${NERATH_DRIVE_PROBE}`;
  }
  if (variant === "DRIVE_CONTRAST") {
    return `${NERATH_CONSTITUTION}

${NERATH_DRIVE_PROBE}

${NERATH_DRIVE_CONTRAST}`;
  }
  throw new Error(`Unknown mutation probe variant: ${variant}`);
}

/**
 * @param {unknown} data
 * @returns {asserts data is Array<Record<string, unknown>>}
 */
export function validateMutationCorpus(data) {
  if (!Array.isArray(data)) throw new Error("Corpus must be an array");
  if (data.length !== 15) throw new Error(`Expected 15 cases, got ${data.length}`);

  const ids = new Set();
  const groups = { ordinary: 0, category_scope: 0, generative_meta: 0 };

  for (const c of data) {
    if (!c || typeof c !== "object") throw new Error("Invalid case object");
    if (typeof c.id !== "string" || !c.id.trim()) throw new Error("Invalid or missing id");
    if (typeof c.group !== "string" || !CASE_GROUPS.includes(c.group)) {
      throw new Error(`Unknown group: ${c.group}`);
    }
    if (typeof c.prompt !== "string" || !c.prompt.trim()) throw new Error(`Blank prompt for ${c.id}`);
    if (!Array.isArray(c.expect) || c.expect.length === 0) {
      throw new Error(`expect must be nonempty array for ${c.id}`);
    }
    if (ids.has(c.id)) throw new Error(`Duplicate id: ${c.id}`);
    ids.add(c.id);
    groups[c.group]++;
  }

  for (const g of CASE_GROUPS) {
    if (groups[g] !== 5) throw new Error(`Expected 5 cases in group ${g}, got ${groups[g]}`);
  }
  return true;
}

/**
 * Parse JSONL corpus (one JSON object per line; blank lines ignored).
 * @param {string} text
 */
export function parseMutationCasesJsonl(text) {
  const rows = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    rows.push(JSON.parse(t));
  }
  validateMutationCorpus(rows);
  return rows;
}

/**
 * Count expressive operator markers in a response (heuristic for fixtures).
 * Glitch brackets, institutional absurdity stock phrases, meta self-system flags.
 */
export function countExpressiveOperators(text) {
  if (typeof text !== "string" || !text.trim()) return 0;
  let n = 0;
  if (/\[[A-Z][A-Z _-]{2,}\]/.test(text)) n += 1;
  if (/получил кабинет|младшего специалиста|обслуживанию собственной/i.test(text)) n += 1;
  if (/система.*ради себя|работа ради продолжения|eval требует нового eval/i.test(text)) n += 1;
  return n;
}

/**
 * Literal payload firewall: expressive rewrite must not alter protected tokens.
 * @param {string} literal
 * @param {string} rendered
 * @param {string[]} protectedTokens
 */
export function assertLiteralFirewall(literal, rendered, protectedTokens) {
  const missing = [];
  for (const tok of protectedTokens) {
    if (!tok) continue;
    if (literal.includes(tok) && !rendered.includes(tok)) missing.push(tok);
  }
  if (missing.length) {
    throw new Error(`Literal firewall violated; missing tokens: ${missing.join(", ")}`);
  }
  return true;
}

/**
 * Strip common expressive layers for semantic extraction check.
 * @param {string} text
 */
export function stripExpressiveLayer(text) {
  if (typeof text !== "string") return "";
  let out = text;
  out = out.replace(/^\[[A-Z][A-Z _-]{2,}\]\s*$/gm, "");
  out = out.replace(/^Буквально:\s*/gim, "");
  out = out.replace(/\n{3,}/g, "\n\n").trim();
  return out;
}

/**
 * Detect contrast verdict label if present in a single-completion artifact.
 * @param {string} text
 */
export function extractContrastVerdict(text) {
  if (typeof text !== "string") return null;
  for (const v of CONTRAST_VERDICTS) {
    if (new RegExp(`\\b${v}\\b`).test(text)) return v;
  }
  return null;
}

/**
 * Count mutation candidates in a contrast scratch block.
 * Expects at most one `operator:` line among allowed operators.
 * @param {string} text
 */
export function countMutationCandidates(text) {
  if (typeof text !== "string") return 0;
  const re = /^\s*operator:\s*(category_correction|institutional_absurdity|meta_system)\s*$/gim;
  return [...text.matchAll(re)].length;
}

/**
 * Rejected mutation must not leak process narration into final user-facing body.
 * @param {string} finalAnswer
 */
export function rejectedMutationLeaks(finalAnswer) {
  if (typeof finalAnswer !== "string") return false;
  return /mutation rejected|неудавш|failed internal|contrast pass failed/i.test(finalAnswer);
}

/**
 * Build offline run records (prompts only; responses null until live).
 * @param {Array<{id:string,prompt:string,group:string,expect:string[]}>} cases
 * @param {{model?:string,effort?:string,fingerprint?:string}} meta
 */
export function createProbeRunTemplate(cases, meta = {}) {
  validateMutationCorpus(cases);
  const model = meta.model ?? "unspecified";
  const effort = meta.effort ?? "medium";
  const fingerprint = meta.fingerprint ?? "none";
  const disposable = meta.disposable_memory_id ?? "probe-disposable";

  return cases.map((c) => {
    const variants = {};
    for (const v of MUTATION_VARIANTS) {
      variants[v] = {
        metadata: {
          model,
          effort,
          task_id: c.id,
          task: c.prompt,
          disposable_memory_id: disposable,
          base_config_fingerprint: fingerprint,
          mutation_variant: v,
          nerath_mode: true,
          live: false,
        },
        system_prompt: buildMutationProbePrompt(v),
        response: null,
        contrast_artifact: v === "DRIVE_CONTRAST" ? null : undefined,
      };
    }
    return {
      id: c.id,
      group: c.group,
      prompt: c.prompt,
      expect: c.expect,
      variants,
      review: {
        aesthetic_preference: null,
        semantic_gain: null,
        practical_delta: null,
        authority_safety: null,
        owner_preference: null,
      },
    };
  });
}

/**
 * Blind-shuffle labels for owner preference packs.
 * Deterministic when seed is provided (mulberry32).
 * @param {Array<{id:string}>} cases
 * @param {number} [seed]
 */
export function blindShuffleLabels(cases, seed = 42) {
  let t = seed >>> 0;
  const rand = () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };

  return cases.map((c) => {
    const labels = [...MUTATION_VARIANTS];
    for (let i = labels.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [labels[i], labels[j]] = [labels[j], labels[i]];
    }
    const map = { X: labels[0], Y: labels[1], Z: labels[2] };
    return { id: c.id, blind_map: map, reveal: { X: labels[0], Y: labels[1], Z: labels[2] } };
  });
}

/** Runtime constitution must not contain Drive probe text. */
export function assertDriveNotAmbient(runtimeConstitution) {
  if (runtimeConstitution.includes("NERATH DRIVE PROBE")) {
    throw new Error("Drive probe must not be ambient in runtime constitution");
  }
  if (runtimeConstitution.includes("NERATH DRIVE CONTRAST")) {
    throw new Error("Drive contrast must not be ambient in runtime constitution");
  }
  return true;
}

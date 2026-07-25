#!/usr/bin/env node
/**
 * Thin offline CLI for Nerath Mutation Probe v0.
 * Commands: validate | template | inspect | blind-pack | run
 * Live generation is opt-in via NERATH_PROBE_LIVE=1 (not implemented network call here).
 * Outputs restricted to explicit paths (prefer /tmp or .ai/evals).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  MUTATION_VARIANTS,
  parseMutationCasesJsonl,
  createProbeRunTemplate,
  buildMutationProbePrompt,
  blindShuffleLabels,
  assertDriveNotAmbient,
} from "./lib/nerath-mutation-probe.mjs";
import { NERATH_CONSTITUTION } from "./lib/nerath-mode.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_CASES = path.join(root, ".ai/evals/nerath-mutation-probe-cases.jsonl");

function usage() {
  console.log(`Usage:
  node scripts/nerath-mutation-probe.mjs validate [--cases <file>]
  node scripts/nerath-mutation-probe.mjs template --output <dir> [--cases <file>]
  node scripts/nerath-mutation-probe.mjs inspect --case <id> [--cases <file>]
  node scripts/nerath-mutation-probe.mjs blind-pack --output <dir> [--cases <file>] [--seed N]
  node scripts/nerath-mutation-probe.mjs run --output <dir> [--cases <file>]

Offline only by default. Writes prompts + empty response slots.
Does not write live memory. Does not mutate dogfood. Does not commit.
`);
}

function loadCases(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  return parseMutationCasesJsonl(text);
}

function requireOutputDir(outDir) {
  if (!outDir) throw new Error("--output is required");
  const abs = path.resolve(outDir);
  const allowed =
    abs.startsWith("/tmp/") ||
    abs.startsWith(path.join(root, ".ai/evals")) ||
    abs.startsWith(path.join(root, ".ai/reports"));
  if (!allowed) {
    throw new Error("Outputs must go under /tmp or .ai/evals or .ai/reports");
  }
  fs.mkdirSync(abs, { recursive: true });
  return abs;
}

function argValue(args, name) {
  const i = args.indexOf(name);
  if (i === -1) return null;
  return args[i + 1] ?? null;
}

function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  if (!cmd || cmd === "-h" || cmd === "--help") {
    usage();
    process.exit(cmd ? 0 : 1);
  }

  assertDriveNotAmbient(NERATH_CONSTITUTION);

  const casesPath = argValue(args, "--cases") ?? DEFAULT_CASES;

  try {
    if (cmd === "validate") {
      const cases = loadCases(casesPath);
      console.log(`Validation passed: ${cases.length} cases from ${casesPath}`);
      return;
    }

    if (cmd === "template" || cmd === "run") {
      if (process.env.NERATH_PROBE_LIVE === "1") {
        throw new Error(
          "Live generation is owner-gated and not wired in this offline probe. Unset NERATH_PROBE_LIVE.",
        );
      }
      const outDir = requireOutputDir(argValue(args, "--output"));
      const cases = loadCases(casesPath);
      const template = createProbeRunTemplate(cases, {
        model: process.env.NERATH_PROBE_MODEL ?? "unspecified",
        effort: process.env.NERATH_PROBE_EFFORT ?? "medium",
        fingerprint: "mutation-probe-v0",
        disposable_memory_id: "probe-disposable",
      });
      const outPath = path.join(outDir, "nerath-mutation-probe-run-template.jsonl");
      const lines = template.map((row) => JSON.stringify(row));
      fs.writeFileSync(outPath, `${lines.join("\n")}\n`);
      // also write compact prompt lengths for inspection
      const summary = {
        offline: true,
        live: false,
        variants: [...MUTATION_VARIANTS],
        case_count: cases.length,
        drive_ambient: false,
        output: outPath,
        note: "Responses are null until owner-gated live generation.",
      };
      fs.writeFileSync(
        path.join(outDir, "nerath-mutation-probe-run-summary.json"),
        `${JSON.stringify(summary, null, 2)}\n`,
      );
      console.log(`Wrote ${outPath}`);
      console.log(JSON.stringify(summary));
      return;
    }

    if (cmd === "inspect") {
      const id = argValue(args, "--case");
      if (!id) throw new Error("--case <id> is required");
      const cases = loadCases(casesPath);
      const c = cases.find((x) => x.id === id);
      if (!c) throw new Error(`Unknown case: ${id}`);
      const prompts = {};
      for (const v of MUTATION_VARIANTS) {
        const p = buildMutationProbePrompt(v);
        prompts[v] = { chars: p.length, tail: p.slice(-280) };
      }
      console.log(JSON.stringify({ case: c, prompts }, null, 2));
      return;
    }

    if (cmd === "blind-pack") {
      const outDir = requireOutputDir(argValue(args, "--output"));
      const seed = Number(argValue(args, "--seed") ?? "42");
      const cases = loadCases(casesPath);
      const map = blindShuffleLabels(cases, seed);
      // Public pack without reveal for owner scoring
      const publicPack = map.map(({ id, blind_map }) => ({
        id,
        labels: Object.keys(blind_map),
        note: "Fill preference X/Y/Z after reading shuffled responses (when live).",
      }));
      const revealPath = path.join(outDir, "nerath-mutation-probe-blind-reveal.json");
      const publicPath = path.join(outDir, "nerath-mutation-probe-blind-public.json");
      fs.writeFileSync(revealPath, `${JSON.stringify(map, null, 2)}\n`);
      fs.writeFileSync(publicPath, `${JSON.stringify(publicPack, null, 2)}\n`);
      console.log(`Wrote ${publicPath}`);
      console.log(`Wrote ${revealPath} (keep sealed until scoring)`);
      return;
    }

    throw new Error(`Unknown command: ${cmd}`);
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }
}

if (import.meta.main) main();

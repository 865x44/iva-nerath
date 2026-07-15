# Task: IVA-M1-C pre-restart review (READ-ONLY)

## Objective

Independent review before restarting the live `iva.service` with the freshly
rebuilt `.output`. Verdict `RESTART_OK` or `RESTART_BLOCKED: <reasons>`.

## Context

- Merge commit `e3ef80f` on `main` in `/home/alx/projects/iva` adds:
  - `tests/agent-provider-routing.test.ts` — 9 offline pin tests (all green on node-24);
  - `export { PROVIDER, PROVIDERS };` in `agent/agent.ts` (only src change);
  - `scripts/build-info.mjs` — provenance stamper;
  - `"test"` script + `resolve-js-to-ts.mjs` loader in repo root.
- `.output` rebuilt from `e3ef80f` with node-24 (`eve build`), `build-info.json`
  stamped: commit e3ef80f, artifactSha256 ba7bb3bd… (byte-identical entry
  `index.mjs` to the previously deployed one; `_libs/` chunks not compared).
- Rollback point: `.output.bak-iva-m1c` (pre-build copy, entry sha256 ba7bb3bd…).
- Restart plan: `systemctl --user restart iva.service`; health check =
  ActiveState=active, MainPID stable across ~30s (no restart loop);
  rollback = restore `.output.bak-iva-m1c` → restart again.

## Review questions

1. Does `export { PROVIDER, PROVIDERS }` in `agent/agent.ts` risk anything at
   eve runtime (tree-shaking, module side effects, defineAgent contract)?
2. Risks of restarting with the new `.output` against the unchanged `.env`
   (do NOT read `.env` values; reason from code only — which env keys the new
   code reads vs the old).
3. Is the rollback plan sufficient? What is missing (e.g. `_libs/` chunk drift,
   eve-cache.json, public/ assets)?
4. What else should be verified before/after restart?

## Constraints

- READ-ONLY: no file mutations anywhere except the completion report.
- Never read or print `.env` values, tokens, vault content, or memory payloads.
- Allowed commands: git read-only (log/show/diff), file reads, `npm test`,
  `diff -r` between `.output` and `.output.bak-iva-m1c` (names/sizes only is fine).
- Do NOT restart, stop, or reload any service. Do not commit.

## Gate

`grep -E "RESTART_(OK|BLOCKED)" .ai/dispatch/LONGWAVE-IVA-2026-07-15-001-report.md`

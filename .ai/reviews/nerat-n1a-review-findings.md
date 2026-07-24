# N1a review findings — final corrective attempt

The delayed/mixed worker snapshot must be corrected only in the N1a allowed
paths. Do not commit and do not start N1b.

1. Replace invalid/redundant `export export function buildPrompt` with exactly
   one valid export.
2. Keep exactly one concise daily-only firewall. Remove duplicate inline versus
   `firewall` repetition. Weekly/monthly/yearly prompt behavior must remain
   byte-equivalent except for unavoidable shared-function refactoring.
3. Keep the mandatory Nerath quotation and forbidden fact at most once as a
   clearly labeled negative example. Do not copy the complete fixture checklist
   into the production prompt.
4. Preserve direct CLI behavior. Make importability minimal and Node-24-safe:
   prefer a small `main()` and `if (import.meta.main) await main()`; dynamic
   imports inside `main()` are permitted only to prevent resolving Eve during
   prompt-builder tests. Preserve argument validation, Client/session flow,
   Telegram flow, errors, and exit semantics. No new production helper.
5. Strengthen `tests/memory-firewall.test.ts` with multiple deterministic
   builder-driven cases: each classification/override rule and negative example
   exactly once in daily; none in non-daily; date/vault path remains; import has
   no network/filesystem side effect. Do not source-grep. State that this is a
   prompt-only guarantee, not deterministic control of arbitrary model output.
6. Write the actual `.ai/analysis/nerat-n1a-worker-report.md`, including the
   mixed-trajectory correction, exact final command/result/count, changed paths,
   synthetic-data boundary, limitations, and `AGY_CODE_N1A_OK`.
7. Run `/usr/bin/node-24 --test tests/memory-firewall.test.ts`. Run a narrow
   existing typecheck only if its exact no-install command is already evident.

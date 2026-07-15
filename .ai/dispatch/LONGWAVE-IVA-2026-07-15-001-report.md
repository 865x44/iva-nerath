# LONGWAVE-IVA-2026-07-15-001 completion report

- Reviewed: merge e3ef80f diff, agent/agent.ts export change, `npm test` (9/9 pass), `diff -r .output .output.bak-iva-m1c`, full `_libs/eve.mjs` content diff, `.eve/compile`/`.eve/discovery` regeneration, and `build-info.json`.
- Verdict: RESTART_BLOCKED.
- Blockers:
  1. `_libs/eve.mjs` drift is not just the new export: it bakes in a model/provider switch from `iva-opencode/deepseek-v4-flash-free` to `iva-kimi/kimi-for-coding` (and the planner subagent likewise), plus an opencode baseURL change. This exceeds the stated IVA-M1-C scope and may change the live AI backend.
  2. The build regenerated `.eve/compile`, `.eve/discovery`, `.eve/nitro/eve-cache.json`, and `.eve/agent-summary.json`, but the rollback plan only restores `.output.bak-iva-m1c`. Rolling back `.output` without rolling back `.eve` would leave stale/inconsistent compiled artifacts.
  3. `.output/build-info.json` has `dirty: true`, so the artifact is not provenanced from a clean working tree.
- Deviations: none; review stayed read-only, no service restart or commit was performed.
- re_entry_checkpoint: phase review complete; completed_gates: [source diff, tests, artifact diff]; next_step: confirm intended provider switch, backup `.eve` alongside `.output`, rebuild from a clean tree if needed, then re-run this review.

---
type: analysis
status: final
source: step3-reconcile
date: 2026-07-25
related_plan: .ai/plans/nerath-reconstruction-alpha-launch.md
---

# Nerath Reconstruction — Lineage & Sanitation Alpha Reconciliation

STEP 3 of the post-alpha mandate. Documents the exact git lineage, what Sanitation Alpha actually landed vs
what existed only in docs/working tree, where launchers/services point, and which releases/worktrees/tags are
still needed. **Does not rewrite the working alpha history.**

## 1. Exact lineage (verified via `git merge-base --is-ancestor` and `git log`)

Base chain of `feature/nerath-reconstruction-alpha` (HEAD `0937a59`):

```
581e157 fix(opencode): align fallback and vision protocols
472b9cb build: make r1 baseline reproducible
1ee221b test: run vendored autograph suite directly          ← production r1 base
c7b06ac docs(nerath): add MVP design and control plane
fc312a6 feat(memory): add Nerath memory firewall fixtures
97ef122 feat(nerath): add disabled core and replay harness
018c19a fix(nerath): declare mode instruction contract
904d840 feat(nerath): package stage2 terminal client
dd60acb feat(nerath): harden policy with identity boundaries and ablation harness
1b770bd feat(nerath): add offline mutation probe harness      ← alpha base
────── Reconstruction Alpha (6 commits) ──────
a2ec424 fix(runtime): restore dogfood fail-closed guard in memory rollup
6970f13 feat(nerath): compose persona, constitution and voice fabric
1a224e0 feat(brother): add shared voice layer, glitch TUI and isolated play canon
0f02ebd feat(cli): restore nerath-chat session persistence
f898e4a test(nerath): add reconstruction regression suite and isolation verifier
0937a59 docs(nerath): add reconstruction briefs, launch and lineage records   ← HEAD, tagged
```

Ancestor checks confirm `1ee221b`, `018c19a`, `dd60acb`, `904d840` are all ancestors of `1b770bd`. The chain
recorded in `.ai/STATE.md` (Sanitation Brief 2) is accurate.

## 2. Sanitation Alpha: what actually landed vs docs-only

Sanitation Alpha (`.ai/STATE.md` 2026-07-25 close) reported 6 briefs "completed". Verification against git:

| Sanitation deliverable | In branch `1b770bd`? | In release `dd60acb`? | Status before alpha |
|---|---|---|---|
| Rollup dogfood fail-closed guard (`DOGFOOD_MODE`) | NO (grep 0) | NO (grep 0) | **Never committed** — working-tree/docs only |
| `nerath-chat.mjs` session persistence (`loadSessionState`) | NO (grep 0) | NO (grep 0) | **Never committed** — working-tree/docs only |
| `scripts/verify-dogfood-isolation.mjs` | NO (untracked) | n/a | **Never committed** |
| Fail-closed launchers `~/.local/bin/{nerath,brother}-chat` | outside repo | outside repo | Exist on disk (not git-tracked) |
| Lineage chain + tag `candidate/nerath-pre-reconstruction-20260725` | tag exists | — | Landed (tag) |
| Dogfood root + port isolation | runtime dirs | — | Exist on disk |

**Conclusion:** Sanitation Alpha's two CODE fixes (rollup guard, nerath-chat session) and the isolation verifier
were never committed to any branch or release — they existed only as uncommitted working-tree edits and in
docs. The Reconstruction Alpha commits are the FIRST time these fixes entered git:

- `a2ec424 fix(runtime): restore dogfood fail-closed guard in memory rollup`
- `0f02ebd feat(cli): restore nerath-chat session persistence`
- `f898e4a test(nerath): ...` (commits `scripts/verify-dogfood-isolation.mjs`)

This is the "lineage gap" flagged during Brief 1 review. It is now resolved by the alpha commits themselves; no
history rewrite is needed.

## 3. Where launchers and services actually point

| Launcher / service | Target | Port | Note |
|---|---|---|---|
| `iva.service` | `releases/1ee221b39a8e` | 8723 | **Production** Iva — do not touch |
| `iva-nerath-dogfood.service` | `releases/dd60acb2ac63-nerath-dogfood` | 8724 | **Old dry Nerath** dogfood (pre-reconstruction). Env: prod `.env` + `deployments/1ee221b39a8e` + `dogfood/live-018c19aa4f21` overrides |
| `~/.local/bin/nerath-chat` | `DOGFOOD_ROOT=dogfood/live-018c19aa4f21`, `RELEASE_ROOT=releases/dd60acb2ac63-nerath-dogfood` | 8724 | Old Nerath CLI |
| `~/.local/bin/brother-chat` | `BROTHER_ROOT=worktrees/brother-v0-cognition-20260725` | 8725 | Old Brother candidate |
| (none) | `dogfood/nerath-reconstruction-alpha` | 8726 | **New reconstruction** dogfood root — NOT wired to any launcher/service; started manually during smoke-test |

The new reconstruction is reachable only by running eve from the alpha worktree against `dogfood/nerath-reconstruction-alpha`
(port 8726). No service or launcher points at it yet. Wiring a launcher/service for the reconstruction is a
separate, later operational step (after owner dogfood verdict).

## 4. Releases, worktrees, dogfood dirs — still needed?

| Asset | Needed? | Reason |
|---|---|---|
| `releases/1ee221b39a8e` + `iva.service` (8723) | **KEEP** | Production Iva |
| `releases/dd60acb2ac63-nerath-dogfood` + `iva-nerath-dogfood.service` (8724) + `dogfood/live-018c19aa4f21` | **KEEP (for now)** | "Current dry candidate" — required as the baseline for STEP 5 live replay (dry vs reconstructed) |
| `worktrees/brother-v0-cognition-20260725` (8725) + `brother-chat` | **KEEP (for now)** | Source the alpha Brother was cherry-picked from; reference/comparison |
| `worktrees/nerath-reconstruction-alpha-20260725` (0937a59) + `dogfood/nerath-reconstruction-alpha` (8726) | **KEEP — the deliverable** | Reconstruction Alpha |
| `worktrees/nerath-core-candidate-20260724T000000Z` (`feature/nerat-memory-firewall`, 1b770bd) | Superseded by alpha | Same base; candidate for cleanup AFTER owner accepts alpha (do not rush) |
| `worktrees/deployable-r1-20260724`, `worktrees/upstream-merge-...` | Separate concerns | Not Nerath; owner decides |
| `dogfood/nerath-core-018c19a-20260724`, `dogfood/nerath-core-revision-904d840-20260725` | Historical dogfood roots | Keep until replay/attestation review done |

## 5. Unique attestations to preserve

- Tag `candidate/nerath-pre-reconstruction-20260725` — pre-reconstruction snapshot (on `1b770bd`).
- Tag `candidate/nerath-reconstruction-alpha-20260725` — the alpha (on `0937a59`). Local annotated candidate, NOT
  an immutable known-good production tag.
- Tags `known-good/iva-0.3.0-20260724`, `known-good/iva-0.3.0-r1-20260724` — production known-good (untouched).
- `.ai/tasks/nerath-sanitation-brief-{3,5}.md` (Sanitation Alpha briefs, in main checkout `.ai/`).
- `.ai/tasks/nerath-reconstruction-brief-{1,2,3}.md` + `.ai/plans/nerath-reconstruction-alpha-launch.md`
  (committed in alpha, `0937a59`).
- `scripts/verify-dogfood-isolation.mjs` (committed in alpha, `f898e4a`).
- `dogfood/live-dd60acb-cutover-2026-07-25.md` (cutover note).

## 6. Recommendations

1. **Do not rewrite alpha history.** The sanitation code fixes are now correctly committed in the alpha
   (`a2ec424`, `0f02ebd`); the lineage gap is resolved in-place.
2. **Keep the old dry Nerath (8724/dd60acb) and old Brother (8725) running** until STEP 5 live replay compares
   dry vs reconstructed. Do not decommission before the replay and owner verdict.
3. **Production (`8723/1ee221b`) is untouched** throughout; no production tag was moved.
4. **Live replay + owner dogfood are gated on provider auth** (`iva login` into the dogfood data dir; do NOT copy
   the production `codex-auth.json` — its one-time refresh_token would break production auth).
5. **Cleanup of superseded worktrees** (`nerath-core-candidate`, historical dogfood roots) is deferred until the
   owner accepts the alpha and the replay attestation is complete.
6. **Wiring a launcher/service for the reconstruction** (port 8726) is a later operational step, after the owner
   dogfood verdict — not part of this reconciliation.

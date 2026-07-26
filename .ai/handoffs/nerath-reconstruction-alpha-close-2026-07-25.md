---
title: Nerath Reconstruction Alpha — Close Handoff
type: handoff-close
status: closed
date: 2026-07-25
branch: feature/nerath-reconstruction-alpha
marker: NERATH_RECONSTRUCTION_ALPHA_CLOSED
next: Brother-first owner dive (fresh session)
---

# Nerath Reconstruction Alpha — Close Handoff (2026-07-25)

## Accepted status

```
NERATH RECONSTRUCTION ALPHA

Implementation:                 complete
Composition:                    proven
Automated live dogfood:         passed (8-turn within-process, qwen3.7-plus)
Conversation continuity P0:     fixed (eve patch)
Ordinary Nerath:                provisionally accepted for alpha
Owner ordinary-Nerath dogfood:  intentionally skipped
Brother-first owner dive:       NEXT sprint
Production merge:               NOT approved
Pre-merge hardening:            deferred
```

## Source state (verified at close)

- Branch: `feature/nerath-reconstruction-alpha`
- HEAD: `da353661af7043f5e21b9cc1d656aa373dc21472`
- Worktree: `/home/alx/.local/share/iva/worktrees/nerath-reconstruction-alpha-20260725`
- Clean: yes (`git status --short` empty, `git diff --check` clean)
- Freeze tag: `candidate/nerath-reconstruction-alpha-20260725` (on `0937a59`) — DO NOT move/rewrite
- Pre-reconstruction tag: `candidate/nerath-pre-reconstruction-20260725` (on `1b770bd`)
- `526ef65` (P0 fix) and `5ccfa77` (Qwen) reachable from HEAD: yes
- No uncommitted cognition/Brother/TUI changes: confirmed

## Key commits (reachable from HEAD)

```
da35366 docs(nerath): dogfood-ready status, P0 fix, durable-write (D11)
5ccfa77 feat(runtime): OPENCODE_BASE_URL override (alibaba token-plan Qwen)
526ef65 fix(deps): eve client streamIndex NaN (P0 continuity)
04c8e18 docs(nerath): lineage + sanitation reconciliation
0937a59 docs(nerath): reconstruction briefs, launch, lineage records   <- alpha tag
f898e4a test(nerath): reconstruction regression suite + isolation verifier
0f02ebd feat(cli): nerath-chat session persistence
1a224e0 feat(brother): shared voice layer, glitch TUI, isolated play canon
6970f13 feat(nerath): compose persona, constitution, voice fabric
a2ec424 fix(runtime): dogfood fail-closed guard in memory rollup
1b770bd base                                                          <- pre-reconstruction tag
```

## What was built

Reconstruction replaced full PERSONA.md suppression with composition: Invariant Kernel +
Positive Nerath layer + Iva PERSONA underlayer + functional voice/register routing (7 voices) +
Resonance + Brother layer + glitch TUI + isolated Play Canon (factual:false). No second
Vault/CORE/transcript/rollup.

## Continuity P0 fix

- Root cause: eve 0.24.4 `advanceSession` computed `streamIndex = session.streamIndex + events.length`;
  a fresh session state has no `streamIndex` (undefined) → NaN → second `send()` opened the stream with
  `startIndex=NaN` → server rejected ("Expected startIndex to be an integer") → within-process multi-turn died.
- Fix: `streamIndex ?? 0` in `eve/dist/src/client/session-utils.js`, pinned via `patches/eve+0.24.4.patch`
  (commit `526ef65`).
- Validated: same-process multi-turn, semantic retention, monotonic streamIndex (18→27), no duplicate turns,
  resume, re-run 8-turn dogfood. Cognition untouched.

## Automated dogfood evidence

- Full dialogue: `/tmp/opencode/nerath-dogfood-v2.md` (also dogfood `vault/daily/2026-07-25.md`).
- Turn 3 holds the museum idea from turn 2; incisive disagreement (no sycophancy); turn 6 connects
  scope-inflation to the turn-4 low-power state; no capability hallucinations in v2; turn 4 no pathologizing;
  turn 8 epistemic humility + hypotheses from the actual conversation arc.

## Runtime at close (before stop)

- PID 2132370, endpoint `http://127.0.0.1:8726`, port 8726
- runtime root: `/home/alx/.local/share/iva/dogfood/nerath-reconstruction-alpha`
- vault: `…/vault`, data: `…/data`
- provider: opencode (alibaba token plan), model: qwen3.7-plus
- launch: `nerath-alpha` (`~/.local/bin/nerath-alpha`)
- 8726 was an ISOLATED alpha runtime, NOT production (prod = 8723 / release 1ee221b)
- STOPPED at close (per procedure 6.5); port closed, PID gone, no child processes

## Accepted interpretation: durable-write (D11)

```
Implicit handoff does NOT create durable memory.
Explicit owner command («сохрани», «запиши», «запомни», «добавь в память»)
permits the existing authorized vault tool.
```

Freeze constitution NOT changed; code/test alignment deferred to pre-merge hardening.

## Deferred pre-merge hardening (NOT a dogfood blocker)

1. parallel-session isolation regression
2. compaction compatibility regression
3. formal museum semantic-continuity fixture
4. capability-evidence regression (prevent «у тебя подключено» / «я умею» / «система использует» without runtime evidence)
5. durable-write code/test clarification (per D11)

## Known limitations

- Live model reply depends on alibaba token-plan auth (opencode `auth.json`); `OPENCODE_BASE_URL` must point at
  the token-plan endpoint (`https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1`).
- eve pinned at 0.24.4 via patch-package; upgrading eve requires re-validating the streamIndex patch.
- Worktree `node_modules` was a symlink to main; an isolated `npm ci` was run for the alpha runtime.

## Production safety

- Production Iva (8723 / release 1ee221b / `iva.service`): UNCHANGED.
- Dirty production main: NOT touched (vault/data clean).
- Upstream merge: NOT started.
- No push, no merge, no remote changes, no immutable tags moved.
- Cognition / Brother / TUI: no uncommitted changes.

## Next sprint: Brother-first owner dive

Start from HEAD of the closed Reconstruction Alpha. Donor branch `brother/v0-cognition` is DONOR ONLY
(selective cherry-pick: launcher primitives, renderer, terminal cleanup, safe glitch transitions, fixtures,
Play Canon primitives). Do NOT wholesale-merge or reintroduce stale cognition from the donor. Bring the existing
Brother layer to a state where the owner can immediately enter one real multi-turn conversation.

Full plan: `.ai/plans/nerath-alpha-handoff-and-brother-first-plan-2026-07-25.md`.

After the Brother owner dive, the next technical epic is `iva.service` graceful shutdown.

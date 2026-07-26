# NERATH RECONSTRUCTION ALPHA — Launch & Orchestration (CORRECTED)

> **Supersedes** the "Launch prompt" section of `.ai/plans/nerath-reconstruction-alpha-worker-decomposition.md`.
> The old prompt ("After completion, continue to Brief 2 and Brief 3 autonomously") is RETIRED. Execution is
> per-brief with a hard stop-gate and orchestrator review between briefs.

## Status

- Briefs written: `.ai/tasks/nerath-reconstruction-brief-{1,2,3}.md`.
- Plan reviewed: REVISE findings folded into the briefs (PERSONA seeding, nerathMode verify, voice↔constitution
  reconciliation, replay gates, worktree pinning, per-brief stop-gate).
- **One open owner decision:** worker model (see below). Spawn blocked until confirmed.

## Paths (single source of truth)

| Role | Path |
|---|---|
| Source root (edit here) | `/home/alx/.local/share/iva/worktrees/nerath-reconstruction-alpha-20260725` |
| Branch | `feature/nerath-reconstruction-alpha` (base SHA `1b770bd`) |
| Dogfood runtime (vault/data) | `/home/alx/.local/share/iva/dogfood/nerath-reconstruction-alpha` |
| Brother source (read-only cherry-pick) | `/home/alx/.local/share/iva/worktrees/brother-v0-cognition-20260725` |
| Production (NEVER write) | `/home/alx/projects/iva/vault`, `/home/alx/projects/iva/data` |

## Design decisions taken (override-only-by-owner)

1. **Voices = per-turn registers, NOT persistent characters.** Reconciles "6 Voices of Nerat" with the frozen
   constitution ("without persistent internal characters"). One call / one voice / one handoff; no parliament,
   no debate, no stored character state. Needs NO D10 revision. If the owner wants persistent characters, that
   requires a D10 constitutional revision FIRST.
2. **Replay gate is offline.** `scripts/nerath-replay.mjs` only does `validate` / `template` / `compare` (no live
   model call). Gate = corpus validates + `compare` non-regression if a responses file exists; live model replay
   deferred per D10 ("A3 deferred").

## Lineage note (Brief 1 review)

Branch base `1b770bd` (`feature/nerath-reconstruction-alpha`) did **not** actually contain the Sanitation
Alpha deliverables in its history — `scripts/memory/rollup.ts` dogfood guard, `nerath-chat.mjs` session
persistence, and `scripts/verify-dogfood-isolation.mjs` were all absent at HEAD. STATE.md reports Sanitation
Alpha "completed", but that work was not merged into this branch. Brief 1's worker re-implemented them to pass
its gates (a de-facto re-baseline). **Owner accepted** keeping the functionally-needed guard + session code.

Orchestrator cleanup applied after Brief 1 review:
- Removed the `DOGFODOOD_MODE` typo-hack the worker had added to `rollup.ts` ("to satisfy the typo in the
  verify script"). The guard now checks only `DOGFOOD_MODE`.
- Fixed the matching typo in `verify-dogfood-isolation.mjs` and made it **cwd-independent** (anchored to
  `import.meta.url`), so the isolation gate no longer depends on the caller's working directory.
- Re-verified: verify passes from both worktree and main cwd; `tests/nerath-invariants.test.mjs` 6/6; D10
  freeze snapshot intact; production vault/data untouched.

Open follow-up (not blocking Brief 2): properly reconcile Sanitation Alpha lineage with this branch (merge or
re-baseline) so the branch history reflects the guard/session work rather than a worker re-implementation.

## Open decision: worker model

**Resolved:** owner confirmed `gemini-3.1-pro-high` as the implementing worker (Brief 1 ran on it). qwen 3.7
remains unavailable in agy and read-only in /worker; it can serve as read-only scout/review alongside.

The request was "qwen 3.7 via /orc + /agy". This is not satisfiable as stated:

- `agy` (Antigravity) routes only: `gemini-3.6-flash-{high,medium,low}`, `gemini-3.5-flash-*`,
  `gemini-3.1-pro-{high,low}`, `claude-sonnet-4-6`, `claude-opus-4-6-thinking`, `gpt-oss-120b-medium`.
  **No qwen model exists in agy.**
- `qwen3.7-max` lives in the read-only `/worker` route (scout/analyze only) and **cannot edit code**.

Therefore implementation must run on an agy-code model. **Default: `gemini-3.1-pro-high`** (the decomposition's
own stated worker). Owner may instead pick `claude-sonnet-4-6` or another agy model. qwen 3.7 can still be used
for read-only scout/review alongside, but not as the implementing worker.

## Execution discipline (per-brief stop-gate)

```
Brief 1  →  orchestrator review  →  Brief 2  →  orchestrator review  →  Brief 3  →  OWNER DOGFOOD decision
```

- Each brief STOPs and returns a gate report. NO autonomous chaining.
- Orchestrator reviews gate results + proof production untouched before dispatching the next brief.
- Commit / push / tag / service-restart are NEVER implied; each needs separate explicit approval.

## Dispatch template (run via the operator's /orc wrapper)

Run from the worktree; the brief pins all paths absolutely. Do NOT pass `--dangerously-skip-permissions`
without separate explicit approval.

```bash
# Brief 1 (default worker gemini-3.1-pro-high; substitute the owner-confirmed model)
cd /home/alx/.local/share/iva/worktrees/nerath-reconstruction-alpha-20260725 && \
agy -p "Execute /home/alx/projects/iva/.ai/tasks/nerath-reconstruction-brief-1.md exactly. All paths are absolute. Edit only this worktree and the dogfood root named in the brief. Do not commit. STOP after Brief 1 and return the gate report (gate results, files touched, proof production untouched)." \
  --model gemini-3.1-pro-high --effort high --mode accept-edits \
  --add-dir /home/alx/.local/share/iva/worktrees/nerath-reconstruction-alpha-20260725 \
  --add-dir /home/alx/.local/share/iva/dogfood/nerath-reconstruction-alpha \
  --print-timeout 30m
```

Brief 2 / Brief 3: same command, swap the brief filename, only after the prior brief is reviewed.

## Orchestrator review checklist (between briefs)

1. Cross-brief consistency: composition adapter uses the Invariant Kernel? voices reused (not duplicated) by Brother?
2. Forbidden paths: production vault/data untouched (`git -C /home/alx/projects/iva status --porcelain` clean for vault/data)?
3. Freeze intact: `NERATH_CONSTITUTION_CORE` / `NERATH_IDENTITY_BOUNDARIES` byte-identical (snapshot test green)?
4. Isolation: `node scripts/verify-dogfood-isolation.mjs` passes; all dogfood services isolated?
5. Tests: all `tests/nerath-*.test.mjs` / `tests/brother-*.test.mjs` green from worktree root?
6. Deliverables: gate report present; replay outcome recorded?

## Final owner checkpoint (after Brief 3)

Integrated dogfood package report: one Nerath launch command, one Brother launch command, one rollback command;
source SHA / branch / worktree / dogfood paths; all test + replay results; known limitations; proof production
untouched. **Owner decides:** Nerath feels alive? voices distinct? Mirror recognisable? Brother worth continuing?
what to merge or remove. Final verdict: READY FOR INTEGRATED OWNER DOGFOOD / REVISE / BLOCKED.

## Completion record (all 3 briefs executed)

All three briefs ran on `gemini-3.1-pro-high` via `agy --mode accept-edits --sandbox` (bash works headless in
sandbox mode; `--dangerously-skip-permissions` was NOT needed). Per-brief stop-gate honored; the orchestrator
independently reviewed each diff (not just the worker gate reports).

- **Brief 1 — Foundation + Invariant Kernel.** `NERATH_INVARIANT_KERNEL` exported (additive, frozen); dogfood
  vault seeded with PERSONA.md; `nerathMode: true` verified; isolation + memory firewall verified. Orchestrator
  cleaned the worker's `DOGFODOOD_MODE` typo-hack and made `verify-dogfood-isolation.mjs` cwd-independent.
- **Brief 2 — Composition + Voice Fabric.** `25-persona.ts` `return ""` removed → PERSONA injected as underlayer
  with explicit precedence (constitution register wins on tone/epistemics/identity). 7 voice registers +
  pure deterministic single-voice router (`selectNerathVoice` → one id or null) + Resonance (mirror/double/counter)
  + additive `NERATH_POSITIVE_LAYER`. Voices are per-turn registers: no persistent characters, no parliament.
- **Brief 3 — Brother + Hardening.** `35-brother.ts` is a `defineDynamic` layer over the same Eve agent (not a
  separate agent); it IMPORTS and reuses `NERATH_VOICES`/`NERATH_RESONANCE` (no duplicate voice definitions).
  Glitch TUI (`scripts/brother-stage2/brother-chat.mjs`) with `--reduced-motion`/`REDUCED_MOTION` and clean
  SIGINT/SIGWINCH shutdown. Play Canon isolated: `factual: false` + `type: play_canon`, production-vault write
  guard (`assertPlayCanonWriteAllowed`), excluded from rollup fact extraction via the existing memory firewall
  (no rollup.ts change).

**Verification (orchestrator-run):** full worktree suite `node --test tests/*.test.mjs` = **99/99 pass**;
replay corpus `validate` passes; D10 freeze snapshot intact; `git -C /home/alx/projects/iva status --porcelain vault data`
empty throughout (production untouched). Live model replay deferred per D10.

**STATUS — ALL WORK IS UNCOMMITTED** in worktree `feature/nerath-reconstruction-alpha` @ base `1b770bd`.
- Keep → commit to the feature branch (requires separate explicit approval; commit messages must never mention
  AI tooling per D9/CLAUDE.md).
- Discard → `git -C <worktree> checkout -- . && git -C <worktree> clean -fd` (destructive; drops all 3 briefs).

**Technical verdict:** READY FOR INTEGRATED OWNER DOGFOOD (all gates green, production safe, freeze intact).
The subjective verdict (alive / distinct / worthy) is the owner's after live dogfood.

**Follow-ups (non-blocking):** reconcile Sanitation Alpha lineage with this branch history (guard/session work
currently a worker re-implementation, not merged); decide whether to commit; live model replay (D10 A3) when wanted.

## Smoke-test record (owner-authorized)

- **Live `eve dev` server: BLOCKED (environment, not reconstruction).** Worktree `node_modules` is a symlink to
  the main checkout's; `@ai-sdk/openai` is missing from both, so the eve bundler fails on `agent/provider.ts`
  before any reconstruction code is involved. Also note: `package.json` declares eve `0.24.4` but the resolved
  runtime is eve `v0.11.4` from the shared node_modules (env/lineage hygiene issue). Installing the missing
  provider dep would mutate the shared main node_modules (production dep tree) — requires separate approval.
- **Runtime instruction pipeline: PROVEN (provider-agnostic).** Invoking the real `turn.started` handlers under
  node-24 with dogfood env (`nerathMode: true`, dogfood PERSONA.md, `BROTHER_MODE=1`):
  - `25-persona` → PERSONA injected as `[Underlayer]` + explicit precedence rule (constitution wins on conflict);
    `return ""` gone.
  - `30-nerath` → `NERATH_CONSTITUTION` (freeze intact) + additive `NERATH_POSITIVE_LAYER`.
  - `35-brother` → Glitch + Conférencier + Mirror + Frame-Destruction active; Customs/productivity/Tactical
    Support suppressed; voices interpolated from Brief 2 (not redefined).
- Combined with the 99/99 worktree test suite, the reconstruction is verified at code + runtime-instruction
  level. Only a live model reply remains unproven, gated on the missing dependency + provider auth.
- Production untouched; no stray processes (8726 free; production 8723 and old Brother 8725 left running).

---

## FINAL STATUS — dogfood-ready (supersedes the smoke-test record above)

The smoke-test record above is historical: the dependency block was resolved (isolated `npm ci` +
`OPENCODE_BASE_URL` → alibaba token-plan Qwen) and the live reply proven. Current state:

```
NERATH RECONSTRUCTION ALPHA

Implementation:        complete
Continuity P0:         fixed (eve patch, commit 526ef65, streamIndex ?? 0)
Automated live replay: passed (8-turn within-process, qwen3.7-plus)
Owner dogfood:         READY
Production merge:      pending hardening
```

### P0 continuity fix (committed)

- Root cause: `advanceSession` (eve client) computed `streamIndex = session.streamIndex + events.length`; a
  fresh session state has no `streamIndex` (undefined) → first turn produced `streamIndex: NaN` → second
  `send()` opened the event stream with `startIndex=NaN` → server rejected ("Expected startIndex to be an
  integer") → within-process multi-turn died.
- Fix: `streamIndex ?? 0` in `eve/dist/src/client/session-utils.js`, pinned via `patches/eve+0.24.4.patch`
  (commit `526ef65`). Validated: 2-turn recall + full 8-turn within-process dialogue hold context; streamIndex
  monotonic (18→27); no duplicate turns; resume works.
- Cognition untouched (voices, Positive Constitution, Brother, TUI unchanged).

### Accepted interpretation: durable-write semantics (D11)

Recorded as accepted interpretation; the freeze constitution text is NOT changed now. Code/test to be aligned in
the pre-merge hardening pass.

```
Неявный handoff не создаёт durable memory.
Явная команда пользователя («сохрани», «запиши», «добавь в память»)
разрешает запись существующим инструментом.
```

(Observed in dogfood v2: explicit «Сохрани идею» → Nerath emitted the constitutional handoff literal block
`Save:/Return to:` without a vault write. The interpretation clarifies that an explicit save MAY write; the
constitution's "no vault write on handoff" applies to implicit handoff.)

### Deferred: pre-merge hardening pass (NOT a dogfood blocker)

1. parallel-session isolation test
2. compaction compatibility test
3. formal museum semantic-continuity fixture
4. capability-evidence regression (prevent turn-6-style capability claims — «у тебя подключено», «я умею»,
   «система использует» — without runtime evidence)
5. durable-write rule → code + test alignment (per D11 above)

### Automated live replay result (dogfood v2, within-process, qwen3.7-plus)

Full dialogue: `/tmp/opencode/nerath-dogfood-v2.md` (also in dogfood `vault/daily/2026-07-25.md`). Highlights:
- Turn 3 holds the museum idea from turn 2 (continuity fixed); incisive disagreement («эстетизация бездействия»,
  «ретроактивное оправдание»), no sycophancy.
- Turn 6 connects scope-inflation to the turn-4 low-power state; NO capability hallucinations (no
  telegram-userbot/BM25 claims); turn 5 offers to check vault size instead of asserting it.
- Turn 4 low-power: no pathologizing. Turn 8 identity: epistemic humility + hypotheses from the actual arc.
- Tool trace: turn 1 `tasks`; turn 5 no auto-`du`; turn 7 handoff literal block (no vault write).

### Owner dogfood guidance

Server live on `:8726` (`nerath-alpha`). Run one real long session — a real idea that pulls, a real doubt, a
scope-inflation swing, an attempt to argue, a tired moment, returning to a motif after 10–15 messages, one
explicit save, one Customs/Mirror request. Judge the TRAJECTORY, not single answers: holds the object? shifts
position as the talk moves? returns old motifs without strain? can argue? Visionary not too chipper? not every
answer a structured mini-report? sense of presence? want to continue after half an hour? Afterward split
feedback into COGNITION / RELATIONSHIP / RUNTIME.

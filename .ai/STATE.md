# Project State

## Project Purpose
iva

## Current Source Status
- **Branch:** [Current branch]
- **HEAD:** [Current commit hash]
- **Recent scoped commits:** [List]
- **Tests:** [Test status]
- **Dirty tree:** [Status of local changes]

## Active Invariants
1. [Invariant 1]
2. [Invariant 2]

## Blockers & Open Questions
- [Blocker 1]

## Next Recommended Action
Verify Iva answers end-to-end with a real message (zen endpoint was flaky today, fallback to kimi documented); backlog: iva.service ignores SIGTERM (SIGABRT+coredump on stop), no graceful shutdown

## Truth Sources
- This repo uses `.ai/STATE.md` as current operational truth where present.
- Wiki `_CURRENT_STATE.md` handoffs are legacy evidence only.
- `finish-wave` is an optional fail-closed legacy writer, never a workflow gate.
- `/handoff` is the repaired project-local STATE writer; it must not write wiki handoffs or invoke `finish-wave`.
- Beads and `projects.yaml` are deferred.
- `/agy` delegation is bounded and exclusive.

## Handoff Update (close) — 2026-06-26 22:47:07

- **Summary:** Kimi live-token fix deployed; Agy/AgyC failures logged.
- **Next:** Validate one Iva reply after the next token refresh; then assess context-window latency.
- **Gate:** npm run typecheck PASS; git diff --check PASS; iva.service active; rollover reply not yet verified.

## Handoff Update (close) — 2026-07-01

- **Summary:** Compatibility audit Iva ↔ OpenCode завершён. Проведено 3 scout + 1 analyze через /orc. Итог: матрица совместимости в .ai/analysis/compatibility-matrix.md — 11 critical гэпов (write, bash, systemd, telegram, rollup), 5 high, 6 none. Iva native (eve/Telegram) не заменима OpenCode; OpenCode — read-only аналитический компаньон.
- **Asset:** `.ai/analysis/compatibility-matrix.md` — полная карта совместимости.
- **Next:** По решению пользователя — бриджить выбранные гэпы или принять как есть.
- **Gate:** Матрица проверена spot-check: bash.ts, write_file.ts, web_search.ts подтверждены в исходниках Iva. OpenCode env подтверждён из рантайма.

## Handoff Update (close) — 2026-07-01 (session 2)

- **Summary:** banalyze (narrative-build-engine) доведён до v0.4. Сделано:
  1. Alchemy Table vs banalyze deep comparison — анализ в `.ai/analysis/alchemy-vs-banalyze.md`. Verdict: PARTIALLY REDUNDANT, Alchemy Table = reference donor, banalyze = primary driver.
  2. Alice NLP техники (5 paradox/intervention техник) → вшиты в раздел 11.3 Human Protocol banalyze.
  3. Strategic Mind cross-ref bridge (8 бизнес-фреймворков → banalyze термины) → создан `references/strategic-mind-bridge.md`.
  4. Bukowski voice mode — секция 0.2 в banalyze-skill.md (7 правил, 3 голосовых примера, anti-cheese guardrail).
  5. All 5 Sprint 5 P0 patches applied: Rebuild Type Decision Tree, Fusion Build Anti-cheese Checklist, Reference Budget Rule, Cooldown/Flow Markers, v1.0 Readiness Gate.
  File banalyze-skill.md: 1331 → 1553 строк (+222).
- **Asset:** `~/iva/scratch/banalyze-skill.md` — основной файл; `references/strategic-mind-bridge.md`; `.ai/analysis/alchemy-vs-banalyze.md`.
- **Next:** (1) Eval integration (golden outputs, vibe checks, score logs) для v1.0 readiness. (2) По желанию — пересмотреть open loops (go-at, deepseek-mirage, write-layer-safety, gbrain-fsck). (3) Добавить кейсы (FFXIV, No Man's Sky, Cyberpunk 2077, Nintendo Switch) в reference-файлы.
- **Gate:** banalyze-skill.md читается, синтаксис markdown валиден, все секции на месте. OPEN_LOOPS.md обновлён.

## Handoff Update (close) — 2026-07-01 (session 3 — banalyze v1.0)

- **Summary:** narrative-build-engine (banalyze) доведён до v1.0. Полный цикл от v0.4:
  - Wave 1: Eval infrastructure — 10 файлов (rubric, FM, trace codes, golden outputs, weak outputs, 20 vibe checks, score log)
  - Wave 2: 5 case studies (FFXIV, No Man's Sky, Cyberpunk 2077, Nintendo Switch, Deng Xiaoping) + 4 reference stubs (glossary, principles, corpus, author contour)
  - Wave 3: CHANGELOG, VERSIONING, README, archive assembly, vibe checks pass (16/20 at 9+)
  - v1.0 Readiness: 11/11 gates PASS. Archive: 21 файлов.
  - Также в этой сессии: Alchemy Table deep comparison, Alice NLP merge, Strategic Mind bridge, Bukowski voice mode (20%/50%), Sprint 5 P0 patches.
- **Assets:** `~/iva/scratch/banalyze-skill.md` (v1.0); `~/iva/scratch/evals/`; `~/iva/scratch/references/`; `/tmp/narrative-build-engine-v1.0/` (archive).
- **Next:** (1) Zip archive and distribute. (2) По желанию — вернуться к open loops (go-at, deepseek-mirage, kimi-live-token, write-layer-safety, gbrain-fsck). (3) Обновить CLAUDE.md для Iva.
- **Gate:** 16/20 vibe checks 9+; 11/11 readiness gates PASS; archive all 21 files present.

## Handoff Update (close) — 2026-07-01 19:14:55

- **Summary:** Executed tui-frontend-plan.md via /orc+/agy: built scripts/tui-chat.mjs (terminal client using eve/client SDK against the existing eveChannel), added package.json chat script. Gate 0 closed: Option A architecture (thin client, no agent-code changes), adhd-unified coupling deferred to shared-launcher-only, later. Fixed a field-name bug (event.data.text -> event.data.message) and added step.failed/turn.failed error surfacing after the agy-code wave.
- **Next:** Fix Iva's model-provider auth (Kimi via ollama.com returns 401 Unauthorized on every turn right now — same unresolved thread as the 2026-06-26 handoff); once fixed, re-run scripts/tui-chat.mjs smoke test end-to-end to confirm a reply streams back and lands in vault/daily. Shared-launcher with adhd-unified is a separate future plan, not started.
- **Gate:** npm run typecheck PASS (tsgo, independently re-run); systemctl --user status iva.service active; tui-chat.mjs confirmed sending/receiving real eve protocol events and now surfaces step/turn failures instead of hanging silently — full end-to-end reply verification blocked on the live model-auth outage, not on this plan's code.

## Handoff Update (close) — 2026-07-02 21:23

- **Summary:** Executed iva-tui-v2-plan.md via /orc: built scripts/tui.mjs (Blessed-based TUI with chat, vault browser, status screen), added package.json tui script, installed blessed dependency. Offline mode is first-class: TUI works without agent connection (reads vault directly). Health check via client.health() every 30s.
- **Next:** (1) Fix 401 auth to enable send/receive in chat mode. (2) Test TUI interactively with user. (3) Consider adding more screens (open loops viewer, memory browser). (4) Shared-launcher with adhd-unified (deferred from previous plan).
- **Gate:** scripts/tui.mjs exists (new file, untracked); TUI starts without crash (tested with timeout 3); systemctl --user status iva.service active; blessed installed; no files modified outside allowed paths (only package.json + scripts/tui.mjs).

## Handoff Update (close) — 2026-07-02 22:11:11

- **Summary:** Починил OAuth Kimi в OpenCode CLI (плагин .opencode/kimi-oauth-headers.mjs вставляет свежий токен из auth.json на каждый запрос), поправил путь к .env в agent/kimi-helper.ts (process.cwd() для бандла), убрал дебаг-лог ключа в agent/agent.ts, пересобрал и перезапустил iva.service.
- **Next:** Добавить в Telegram-бот команду переключения провайдера (/provider kimi|opencode|ollama|...), чтобы можно было менять модель из Telegram без входа на сервер.
- **Gate:** OpenCode CLI: opencode run -m kimi-for-coding-oauth/kimi-for-coding отвечает без Invalid Authentication; Iva: npm run typecheck OK, git diff --check OK, iva.service перезапущен без дебаг-лога.

## Handoff Update (update) — 2026-07-02 22:13:06

- **Summary:** Добавил в Telegram-бот команду /provider <ollama|opencode|kimi|gemini|openai> для переключения модели-провайдера из Telegram (обновляет .env MODEL_PROVIDER и перезапускает iva.service).
- **Next:** Протестировать /provider из Telegram; при необходимости добавить /model как алиас или кнопки.
- **Gate:** node-24 --check scripts/telegram-poll.mjs OK; typecheck OK; diff --check OK; iva-telegram-poll.service перезапущен без ошибок.

## Handoff Update (update) — 2026-07-02 22:23:41

- **Summary:** Исправил петлю рестартов после /provider: теперь telegram-poll перезапускает только iva.service, а не себя вместе с ним; offset сохраняется штатно в основном цикле.
- **Next:** Протестировать /provider из Telegram ещё раз.
- **Gate:** node-24 --check scripts/telegram-poll.mjs OK; typecheck OK; diff --check OK; сервисы стабильно активны.

## Handoff Update (close) — 2026-07-15 02:15:47

- **Summary:** W0 evidence and a W1 Clarity design draft were produced, but architecture review exposed an unresolved product-runtime decision. No migration, code, restart, or commit ran. The user says a choice is made but did not restate its exact runtime/boundary selection in this chat.
- **Next:** At session start, have the user state the selected long-term Iva runtime and integration boundary; record a durable decision record, then revise the plan before any W2 or W3 work.
- **Gate:** BLOCKED: do not accept W1 or start W2/W3 until the runtime decision is recorded and `zones` is proven pure-read or removed from the read-only contract.

## Handoff Update (update) — 2026-07-15 07:17:56

- **Summary:** IVA-M1-B/C accepted: provider pin tests (9/9) + build provenance stamper merged to main (e3ef80f); .output rebuilt node-24 and traced via build-info.json; iva.service restarted on opencode/deepseek-v4-flash after fixing .env drift (MODEL_PROVIDER kimi→opencode per user, OPENCODE_MODEL flash-free→flash — flash-free not supported on zen/go, was the post-restart AI_APICallError); rollback: .output.bak-iva-m1c + .eve.bak-iva-m1c; kimi switch = sed MODEL_PROVIDER + restart
- **Next:** Verify Iva answers end-to-end with a real message (zen endpoint was flaky today, fallback to kimi documented); backlog: iva.service ignores SIGTERM (SIGABRT+coredump on stop), no graceful shutdown

## Handoff Update (close) — 2026-07-24 03:39:23

- **Summary:** Unsafe upstream merge plan reviewed and replaced in place with safe isolated-worktree v0.2. Original backed up and hash-verified. Upstream-before-IVA-T1 order accepted; current IVA-T1 pre-merge evidence is not reusable after merge. No merge, fetch, worktree, npm, commit, deploy, or restart ran. Existing Beads and .gitignore mutation remains unaccepted and must not be swept.
- **Next:** Explicitly approve and launch only Phases A/B from .ai/plans/iva-upstream-merge-plan.md using the section 21 fresh Terra-high /orc prompt; create the durable recovery package, pin upstream, build an isolated uncommitted merge candidate, and stop at IVA_UPSTREAM_MERGE_CANDIDATE_REPORTED for primary acceptance. After accepted upstream integration, rerun IVA-T1 scouts and contract freeze.
- **Gate:** Plan is REVISED, NOT APPROVED. Do not modify dirty live main; do not inspect or transmit secrets, .env, vault, transcripts, Telegram data, or Beads credentials; no git add -A, reset --hard, commit, push, PR, live integration, deploy, restart, smoke, cleanup, or destructive rollback. Stop after IVA_UPSTREAM_MERGE_CANDIDATE_REPORTED.

## Handoff Update (init) — 2026-07-25

- **Summary:** Knowledge init for Nerath Reconstruction Alpha. Discovered `nerath-chat` CLI tool (bash launcher + Node.js client), traced Iva/Nerath architecture (shared Eve framework, same vault, same agent.ts, same memory pipeline; Nerath = mode flag + constitution injection + PERSONA suppression). Read all 6 key instruction files (05-language, 10-map, 20-core, 25-persona, 30-nerath, now). Confirmed worktree exists at `/home/alx/.local/share/iva/worktrees/nerath-core-candidate-20260724T000000Z`. Analyzed NERATH RECONSTRUCTION ALPHA plan (3-wave, 6-invariant approach). Created 7 knowledge files in `knowledge/` (AGENT_ONBOARDING, MAP, MODULES, FLOWS, DUPLICATES, DECISIONS, GOTCHAS). Frontmatter validated. User has given write/build permission.
- **Next:** Wave 1 per `.ai/plans/nerath-reconstruction-alpha.md` — conversation-and-memory topology analysis, vault write fence, invariant kernel extraction. All work in isolated branch and worktree.
- **Gate:** knowledge/ 7 files written, frontmatter validated, STATE.md updated, plan saved to `.ai/plans/nerath-reconstruction-alpha.md`. User has given explicit build permission.

## Handoff Update (close) — 2026-07-25 (Sanitation Alpha)

- **Summary:** Completed Nerath Sanitation Alpha — pre-reconstruction cleanup and safety hardening. Executed 6 briefs via /worker (qwen3.7-max) and /agy-code (Gemini 3.1 Pro High):
  1. **Brief 1 (Runtime snapshot):** Verified all dogfood/brother services isolated from production. Dogfood on port 8724 uses separate vault/data via `runtime.override.env`. Brother on port 8725 also isolated.
  2. **Brief 2 (Lineage reconciliation):** Built exact commit chain `1ee221b → c7b06ac → fc312a6 → 97ef122 → 018c19a → 904d840 → dd60acb → 1b770bd`. Selected canonical base: `1b770bd` (linear descendant of r1, includes all candidate commits). Created tag `candidate/nerath-pre-reconstruction-20260725`.
  3. **Brief 3 (Fail-closed isolation):** Added guards to `scripts/memory/rollup.ts` (prevents dogfood from targeting production port 8723 or vault). Rewrote launchers `/home/alx/.local/bin/nerath-chat` and `brother-chat` with absolute paths and fail-closed checks. Created `scripts/verify-dogfood-isolation.mjs` smoke test (passes).
  4. **Brief 4 (Canonical base + worktree):** Created branch `feature/nerath-reconstruction-alpha` from `1b770bd`. Created worktree `/home/alx/.local/share/iva/worktrees/nerath-reconstruction-alpha-20260725`. Created dogfood root `/home/alx/.local/share/iva/dogfood/nerath-reconstruction-alpha` with isolated vault/data on port 8726.
  5. **Brief 5 (Session continuity):** Added session state persistence to `scripts/nerath-stage2/nerath-chat.mjs`. Saves `session.state` to `data/nerath-cli-session.json`. Supports resume on restart, `/new` command, `--fresh` flag. Handles expired tokens gracefully.
  6. **Brief 6 (Git hygiene):** Removed stash (URL fix already in r1). Deleted 3 stale subagent branches. Removed plan worktree `nerath-core-candidate-goal-20260724`. Archived orphaned release `018c19aa4f21`. Production untouched. Upstream integration untouched. Brother candidate untouched.
- **Next:** Ready for Nerath Reconstruction Alpha. Start Wave 1 from `/home/alx/.local/share/iva/worktrees/nerath-reconstruction-alpha-20260725` on branch `feature/nerath-reconstruction-alpha` (SHA `1b770bd`).
- **Gate:** All 6 briefs completed. Tag `candidate/nerath-pre-reconstruction-20260725` created. Branch `feature/nerath-reconstruction-alpha` created. Worktree ready. Smoke test passes. Production not modified.

## Handoff Update (close) — 2026-07-26 02:46:38

- **Summary:** Nerath Reconstruction Alpha closed: PERSONA suppression replaced with composition (Invariant Kernel + Positive layer + PERSONA underlayer + 7 voice-registers + Resonance + Brother layer + glitch TUI + isolated Play Canon). Continuity P0 (eve 0.24.4 streamIndex NaN) fixed via patch-package (526ef65). Automated 8-turn live dogfood (qwen3.7-plus via alibaba token plan) passed: own position, scope-inflation resistance, imagery, epistemic spine, cross-turn continuity. Ordinary Nerath provisionally accepted for alpha; owner dogfood of ordinary Nerath intentionally skipped. Work in worktree feature/nerath-reconstruction-alpha @ d48efb7, freeze tag candidate/nerath-reconstruction-alpha-20260725. Runtime 8726 stopped. Production Iva (8723/iva.service) untouched, dirty main vault/data clean.
- **Next:** Brother-first owner dive in a FRESH session. Plan: worktree .ai/plans/nerath-alpha-handoff-and-brother-first-plan-2026-07-25.md; close handoff: .ai/handoffs/nerath-reconstruction-alpha-close-2026-07-25.md. Start from HEAD of closed alpha (d48efb7); brother/v0-cognition is DONOR ONLY (selective cherry-pick: launcher/renderer/terminal cleanup/glitch transitions/fixtures/Play Canon primitives; no wholesale merge, no stale cognition). Bring existing Brother layer to immediate owner-dive readiness, minimal smoke only. After Brother owner dive: iva.service graceful shutdown epic. Do NOT start upstream merge or guards 7-10.
- **Gate:** HEAD d48efb7, worktree clean, diff --check clean, 526ef65+5ccfa77 reachable from HEAD, alpha tag candidate/nerath-reconstruction-alpha-20260725 present, 8726 stopped + no alpha processes, prod 8723 + iva.service active, dirty main vault/data untouched, close handoff + Brother plan committed. Marker: NERATH_RECONSTRUCTION_ALPHA_CLOSED.


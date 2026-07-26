# Session Log

## Date: [YYYY-MM-DD]

### Objective
[What was the goal of this session?]

### Actions Taken
- [Action 1]
- [Action 2]

### Rules Context
- `.ai/STATE.md` is current operational truth where present.
- Wiki `_CURRENT_STATE.md` handoffs are legacy evidence only.
- `finish-wave` is an optional fail-closed legacy writer, never a workflow gate.
- `/handoff` is the repaired project-local STATE writer; it must not write wiki handoffs or invoke `finish-wave`.
- Beads and `projects.yaml` are deferred.
- `/agy` delegation is bounded and exclusive.

## 2026-06-26 22:47 — handoff close

- Summary: Kimi live-token fix deployed; Agy/AgyC failures logged.
- Next: Validate one Iva reply after the next token refresh; then assess context-window latency.
- Gate: npm run typecheck PASS; git diff --check PASS; iva.service active; rollover reply not yet verified.

## 2026-07-01 — Compatibility Audit Iva ↔ OpenCode

- Summary: Deep dive в тарифы OpenCode Go ($10/мес, $60 пула, DeepSeek V4 Flash ~158k req/мес). Исследовали Lethe (atemerev/lethe) как кандидата для ассистента. Запустили /planner → /orc workflow: 3 scout + 1 analyze, полная матрица совместимости Iva vs OpenCode.
- Asset: `.ai/analysis/compatibility-matrix.md` — 23 строки совместимости
- Key finding: OpenCode не заменяет native Iva (11 critical гэпов). Роль в OpenCode — read-only аналитик.
- Gate: npm run typecheck — не запускался (нет изменений в коде). git diff — чистый (только новые .md артефакты).

## 2026-07-01 19:14 — handoff close

- Summary: Executed tui-frontend-plan.md via /orc+/agy: built scripts/tui-chat.mjs (terminal client using eve/client SDK against the existing eveChannel), added package.json chat script. Gate 0 closed: Option A architecture (thin client, no agent-code changes), adhd-unified coupling deferred to shared-launcher-only, later. Fixed a field-name bug (event.data.text -> event.data.message) and added step.failed/turn.failed error surfacing after the agy-code wave.
- Next: Fix Iva's model-provider auth (Kimi via ollama.com returns 401 Unauthorized on every turn right now — same unresolved thread as the 2026-06-26 handoff); once fixed, re-run scripts/tui-chat.mjs smoke test end-to-end to confirm a reply streams back and lands in vault/daily. Shared-launcher with adhd-unified is a separate future plan, not started.
- Gate: npm run typecheck PASS (tsgo, independently re-run); systemctl --user status iva.service active; tui-chat.mjs confirmed sending/receiving real eve protocol events and now surfaces step/turn failures instead of hanging silently — full end-to-end reply verification blocked on the live model-auth outage, not on this plan's code.

## 2026-07-02 22:11 — handoff close

- Summary: Починил OAuth Kimi в OpenCode CLI (плагин .opencode/kimi-oauth-headers.mjs вставляет свежий токен из auth.json на каждый запрос), поправил путь к .env в agent/kimi-helper.ts (process.cwd() для бандла), убрал дебаг-лог ключа в agent/agent.ts, пересобрал и перезапустил iva.service.
- Next: Добавить в Telegram-бот команду переключения провайдера (/provider kimi|opencode|ollama|...), чтобы можно было менять модель из Telegram без входа на сервер.
- Gate: OpenCode CLI: opencode run -m kimi-for-coding-oauth/kimi-for-coding отвечает без Invalid Authentication; Iva: npm run typecheck OK, git diff --check OK, iva.service перезапущен без дебаг-лога.

## 2026-07-02 22:13 — handoff update

- Summary: Добавил в Telegram-бот команду /provider <ollama|opencode|kimi|gemini|openai> для переключения модели-провайдера из Telegram (обновляет .env MODEL_PROVIDER и перезапускает iva.service).
- Next: Протестировать /provider из Telegram; при необходимости добавить /model как алиас или кнопки.
- Gate: node-24 --check scripts/telegram-poll.mjs OK; typecheck OK; diff --check OK; iva-telegram-poll.service перезапущен без ошибок.

## 2026-07-02 22:23 — handoff update

- Summary: Исправил петлю рестартов после /provider: теперь telegram-poll перезапускает только iva.service, а не себя вместе с ним; offset сохраняется штатно в основном цикле.
- Next: Протестировать /provider из Telegram ещё раз.
- Gate: node-24 --check scripts/telegram-poll.mjs OK; typecheck OK; diff --check OK; сервисы стабильно активны.

## 2026-07-15 02:15 — handoff close

- Summary: W0 evidence and a W1 Clarity design draft were produced, but architecture review exposed an unresolved product-runtime decision. No migration, code, restart, or commit ran. The user says a choice is made but did not restate its exact runtime/boundary selection in this chat.
- Next: At session start, have the user state the selected long-term Iva runtime and integration boundary; record a durable decision record, then revise the plan before any W2 or W3 work.
- Gate: BLOCKED: do not accept W1 or start W2/W3 until the runtime decision is recorded and `zones` is proven pure-read or removed from the read-only contract.

## 2026-07-15 07:17 — handoff update

- Summary: IVA-M1-B/C accepted: provider pin tests (9/9) + build provenance stamper merged to main (e3ef80f); .output rebuilt node-24 and traced via build-info.json; iva.service restarted on opencode/deepseek-v4-flash after fixing .env drift (MODEL_PROVIDER kimi→opencode per user, OPENCODE_MODEL flash-free→flash — flash-free not supported on zen/go, was the post-restart AI_APICallError); rollback: .output.bak-iva-m1c + .eve.bak-iva-m1c; kimi switch = sed MODEL_PROVIDER + restart
- Next: Verify Iva answers end-to-end with a real message (zen endpoint was flaky today, fallback to kimi documented); backlog: iva.service ignores SIGTERM (SIGABRT+coredump on stop), no graceful shutdown

## 2026-07-24 03:39 — handoff close

- Summary: Unsafe upstream merge plan reviewed and replaced in place with safe isolated-worktree v0.2. Original backed up and hash-verified. Upstream-before-IVA-T1 order accepted; current IVA-T1 pre-merge evidence is not reusable after merge. No merge, fetch, worktree, npm, commit, deploy, or restart ran. Existing Beads and .gitignore mutation remains unaccepted and must not be swept.
- Next: Explicitly approve and launch only Phases A/B from .ai/plans/iva-upstream-merge-plan.md using the section 21 fresh Terra-high /orc prompt; create the durable recovery package, pin upstream, build an isolated uncommitted merge candidate, and stop at IVA_UPSTREAM_MERGE_CANDIDATE_REPORTED for primary acceptance. After accepted upstream integration, rerun IVA-T1 scouts and contract freeze.
- Gate: Plan is REVISED, NOT APPROVED. Do not modify dirty live main; do not inspect or transmit secrets, .env, vault, transcripts, Telegram data, or Beads credentials; no git add -A, reset --hard, commit, push, PR, live integration, deploy, restart, smoke, cleanup, or destructive rollback. Stop after IVA_UPSTREAM_MERGE_CANDIDATE_REPORTED.

## 2026-07-26 02:46 — handoff close

- Summary: Nerath Reconstruction Alpha closed: PERSONA suppression replaced with composition (Invariant Kernel + Positive layer + PERSONA underlayer + 7 voice-registers + Resonance + Brother layer + glitch TUI + isolated Play Canon). Continuity P0 (eve 0.24.4 streamIndex NaN) fixed via patch-package (526ef65). Automated 8-turn live dogfood (qwen3.7-plus via alibaba token plan) passed: own position, scope-inflation resistance, imagery, epistemic spine, cross-turn continuity. Ordinary Nerath provisionally accepted for alpha; owner dogfood of ordinary Nerath intentionally skipped. Work in worktree feature/nerath-reconstruction-alpha @ d48efb7, freeze tag candidate/nerath-reconstruction-alpha-20260725. Runtime 8726 stopped. Production Iva (8723/iva.service) untouched, dirty main vault/data clean.
- Next: Brother-first owner dive in a FRESH session. Plan: worktree .ai/plans/nerath-alpha-handoff-and-brother-first-plan-2026-07-25.md; close handoff: .ai/handoffs/nerath-reconstruction-alpha-close-2026-07-25.md. Start from HEAD of closed alpha (d48efb7); brother/v0-cognition is DONOR ONLY (selective cherry-pick: launcher/renderer/terminal cleanup/glitch transitions/fixtures/Play Canon primitives; no wholesale merge, no stale cognition). Bring existing Brother layer to immediate owner-dive readiness, minimal smoke only. After Brother owner dive: iva.service graceful shutdown epic. Do NOT start upstream merge or guards 7-10.
- Gate: HEAD d48efb7, worktree clean, diff --check clean, 526ef65+5ccfa77 reachable from HEAD, alpha tag candidate/nerath-reconstruction-alpha-20260725 present, 8726 stopped + no alpha processes, prod 8723 + iva.service active, dirty main vault/data untouched, close handoff + Brother plan committed. Marker: NERATH_RECONSTRUCTION_ALPHA_CLOSED.

## 2026-07-26 20:59 — handoff close

- Summary: main accepted at ea35396; the original dirty snapshot and conflict residue are preserved by safety tags and a checksummed external archive; production was not touched.
- Next: Start a new session with /planner for a separate post-merge scope. Phase D is optional and requires an explicit decision; reconciliation of the archived dirty snapshot is a separate task.
- Gate: Do not apply either safety stash or start Phase D, deployment, service restart, or live dogfood without separate explicit approval.

## 2026-07-26 22:29 — handoff close

- Summary: Phase D archival inventory accepted: six immutable archive tags were created at the approved SHAs; all safety tags, three stashes, external archives, branches, and worktree registrations remain preserved. No deletion, push, deployment, restart, or source edit occurred.
- Next: Stop. Keep the accepted main baseline and archives intact. Any reconciliation of the preserved dirty snapshots, worktree removal, branch deletion, tag deletion, deployment, or runtime dogfood requires a new separately approved plan.
- Gate: Archived inventory confirmed by user. Do not apply safety stashes, remove or prune worktrees, delete branches/tags, push, deploy, restart services, or access production vault/data without a new explicit approval.


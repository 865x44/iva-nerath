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

## 2026-07-24 15:04 — handoff close

- Summary: G0-N1b завершены; Phase R harness/corpus принят primary: 33/0, corpus validation и git diff --check PASS. Controlled Codex Luna replay BLOCKED_NOT_RUN; benefit не доказан. Phase V не начата; candidate commits отсутствуют.
- Next: В свежей Terra /orc продолжить только Phase V из candidate worktree: исправить provenance R-report, выполнить focused/full Node 24 tests, typecheck, build, verify-baseline, manifest/root checks, независимый diff/source audit и live/release invariant audit; не коммитить без законно пройденных replay/full gates; выпустить final candidate report и остановиться на IVA_NERATH_CORE_CANDIDATE_REPORTED.
- Gate: Candidate branch feature/nerat-memory-firewall, HEAD exact r1 1ee221b39a8e7bf46e80305246293a7f627f78af, dirty only candidate artifacts. N1a PASS 5/0; N1b PASS 7/0 + menu 5/0; R PASS 33/0 + validate + diff-check. Live/release/deployment untouched. External replay not run; Phase V not started; no commits.


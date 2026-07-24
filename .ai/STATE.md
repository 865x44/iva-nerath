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
В свежей Terra `/orc` продолжить только Phase V из candidate worktree: исправить provenance R-report, выполнить focused/full Node 24 tests, typecheck, build, `verify-baseline`, manifest/root checks, независимый diff/source audit и live/release invariant audit; не коммитить без законно пройденных replay/full gates; выпустить final candidate report и остановиться на `IVA_NERATH_CORE_CANDIDATE_REPORTED`.

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

## Handoff Update (close) — 2026-07-24 15:04:02

- **Summary:** G0-N1b завершены; Phase R harness/corpus принят primary: 33/0, corpus validation и git diff --check PASS. Controlled Codex Luna replay BLOCKED_NOT_RUN; benefit не доказан. Phase V не начата; candidate commits отсутствуют.
- **Next:** В свежей Terra /orc продолжить только Phase V из candidate worktree: исправить provenance R-report, выполнить focused/full Node 24 tests, typecheck, build, verify-baseline, manifest/root checks, независимый diff/source audit и live/release invariant audit; не коммитить без законно пройденных replay/full gates; выпустить final candidate report и остановиться на IVA_NERATH_CORE_CANDIDATE_REPORTED.
- **Gate:** Candidate branch feature/nerat-memory-firewall, HEAD exact r1 1ee221b39a8e7bf46e80305246293a7f627f78af, dirty only candidate artifacts. N1a PASS 5/0; N1b PASS 7/0 + menu 5/0; R PASS 33/0 + validate + diff-check. Live/release/deployment untouched. External replay not run; Phase V not started; no commits.

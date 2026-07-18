# Wave 2B Beerlight Adapter — Implementation Report

**Date:** 2026-07-18
**Worktree:** `/home/alx/projects/iva-wave2-beerlight`, ветка `wave/beerlight-adapter-v1`

## Implemented

4 files created/modified:

| # | File | Status |
|---|------|--------|
| 1 | `agent/tools/beerlight.ts` | NEW |
| 2 | `agent/skills/beerlight/SKILL.md` | NEW |
| 3 | `agent/instructions.md` | MODIFIED (+1 line) |
| 4 | `tests/beerlight-tool.test.ts` | NEW |

## Files Changed

### 1. `agent/tools/beerlight.ts` (tool)

CLI-адаптер к Beerlight Runtime через `node:child_process` (паттерн `bash.ts`).
Самодостаточен: только `eve/tools`, `zod`, `node-builtins`.

- **Конфигурация:** `BEERLIGHT_REPO` (default `/home/alx/projects/beerlight-terminal`),
  `BEERLIGHT_PYTHON` (default `<repo>/.venv/bin/python`)
- **Схема ввода:** `z.discriminatedUnion("action", [...])` — 4 варианта:
  - `run_json` — принимает request-объект, пишет во временный файл, вызывает `run-json <file>`, парсит JSON-ответ
  - `session` — проброс подкоманд `create|run|update|show|event|outcomes`
  - `inspect` — проброс `inspect <run_id> [--show-pool|--show-judge|--show-errors|--calibrate] [--session ...]`
  - `handoff` — проброс `handoff <session_dir> --output <dir> --yes [--include-traces]`
- **Timeouts:** RUN_TIMEOUT = 420s (7 мин, run_json + session run), FAST_TIMEOUT = 60s (остальные)
- **Ошибки:** non-zero exit → `{exitCode, stderr, stdout}`; stderr/stdout обрезаются до ≤ 2000 символов
- **Описание:** короткое, по-русски, в стиле существующих tools

### 2. `agent/skills/beerlight/SKILL.md` (skill)

По образцу `agent/skills/agent-browser/SKILL.md`. Содержит:

- **Когда применять:** «найди углы», «прогони бирлайт», «разверни черновик», «360 по тексту»
- **Workflow (9 шагов):** сохранить draft → session create → session run (с предупреждением о 2–5 мин) → показать ≤3 карточки нумерованным списком → пользователь выбирает номером/словом → session event → редактирование → session update → повторный run/event → режим 360 → outcomes
- **Честность:** `no_useful_output` — норма; judge убил идею → `inspect --calibrate`; не выдумывать события
- **Без собственных промптов/judge-логики** (требование плана §6.4)
- **Без inline-клавиатур** (выбор free-text, как у Ивы)

### 3. `agent/instructions.md` (+1 line)

Добавлена строка 20 (после agent-browser, перед MCP):

```
- **Beerlight.** Для поиска углов по тексту — скилл `beerlight`, вызов через tool `beerlight`.
```

В стиле линии 18–19 (agent-browser). Не ломает форматирование.

### 4. `tests/beerlight-tool.test.ts` (тесты)

node:test, фейковый bash-shim во временной директории. 15 тестов в 4 suite:

- **beerlight run_json (3):** вызов run-json + парсинг ответа; запись request в файл; non-zero exit → structured error
- **beerlight session (8):** create, run, event (c и без reason), outcomes, update --file, show, non-zero exit
- **beerlight inspect (2):** проброс run_id, проброс флагов (--show-pool, --calibrate)
- **beerlight handoff (2):** проброс session_dir/--output/--yes, проброс --include-traces

## Commands

```
npm run typecheck  # PASS (0 errors)
npm test           # PASS (24/24 tests: 9 existing + 15 new)
```

## Timeout Decision

Выбран прямой `exec()` с timeout 420s для run-операций (паттерн bash.ts). Причина:

- `bash.ts` уже использует `exec()` с пользовательским timeout и работает без нареканий
- Eve framework не накладывает собственного потолка на execute() промисов — проверено косвенно: bash tool успешно выполняет команды дольше 120s, если timeout переопределён
- Start/poll-паттерн (nohup + polling файла) избыточен для данного случая и сложнее в отладке

Если в реальном прогоне через Iva обнаружатся таймауты на уровне eve, fallback — start/poll-паттерн,
но текущий выбор — простейший рабочий вариант.

## Deviations

Нет. Все требования брифа выполнены.

## Known Limitations

- **Нет live-прогона Beerlight.** Реальных LLM-вызовов не делалось — ни через адаптер, ни напрямую.
  Все проверки — на фейковом shim. Реальный dogfood — после ревью, пользователем через Telegram.
- **Прод остановлен** (`iva.service`, `iva-telegram-poll.service` inactive). `npm run build` / `.output` не трогались.
- **Runtime-файлы не читались.** Контракт — только `.wave2b/beerlight-cli-contract.md` (запрет на чтение
  `/home/alx/projects/beerlight-terminal/**` соблюдён).

## Verdict: READY FOR REVIEW

Все требования брифа выполнены. Typecheck зелёный, тесты зелёные (24/24). Без коммитов.

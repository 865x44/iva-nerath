# Banalyze v1.0 Roadmap — от v0.4 к v1.0

## Current State

**v0.4** — `/home/alx/iva/scratch/banalyze-skill.md` (1572 строки)

### Уже сделано
- Core behavioral kernel (секции 0-18)
- 5 P0 Sprint 5 patches: Rebuild Type Decision Tree, Fusion Build Anti-cheese, Reference Budget, Cooldown/Flow Markers, v1.0 Readiness Gate
- Alice NLP (5 paradox-техник) вшиты в Human Protocol (11.3)
- Strategic Mind cross-ref bridge → `references/strategic-mind-bridge.md`
- Bukowski voice mode — 2 режима (20% / 50%)
- Alchemy Table deep comparison → verdict + merge

### Источники для оставшейся работы
- `/home/alx/projects/iva/docs/newskilldocs/SPRINT5_PATCHES.docx` — 5 P0 патчей (уже применены)
- `/home/alx/projects/iva/docs/newskilldocs/Golden Outputs Sprint 5 Additions.docx` — GO-011, GO-012, GO-013
- `/home/alx/projects/iva/docs/newskilldocs/FINAL_PACKAGE_MANIFEST.docx` — структура пакета v1.0

## Scope

Довести banalyze до v1.0: eval инфраструктура, кейсы, упаковка, прогон readiness gate.

## Out of Scope

- Alchemy Table — не трогать, archival
- Iva core (projects/iva/) — не трогать
- Другие open loops (go-at, deepseek-mirage, kimi-live-token) — не трогать

## Slices

### Wave 1: Eval Integration (v0.4 → v0.5)

#### Slice 1.1: Create `evals/` directory structure
- **Worker:** `/agy-code`
- **Scope:** Создать `/home/alx/iva/scratch/evals/` с файлами:
  - `evals.json` — пустой шаблон с ссылками на rubric, failure modes, golden outputs
  - `golden_outputs.md` — существующие GO (переписать из текущего SKILL.md, раздел 15)
  - `golden_outputs_sprint5_additions.md` — добавить GO-011, GO-012, GO-013 (источник: Golden Outputs Sprint 5 Additions.docx)
  - `weak_outputs.md` — список типичных провалов
  - `vibe_checks.md` — 20 check-пунктов качества ответа
  - `score_log.csv` — пустой шаблон для лога оценок
  - `rubric.md` — критерии оценки
  - `failure_modes.md` — каталог failure modes с кодами
  - `trace_codes.md` — коды трассировки ответов
  - `patch_queue_sprint5.md` — что патчили, что осталось
- **Gate:** `ls ~/iva/scratch/evals/*.md ~/iva/scratch/evals/*.csv ~/iva/scratch/evals/*.json` — все 10 файлов существуют

#### Slice 1.2: Golden Outputs — Sprint 5 additions
- **Worker:** `/agy-code`
- **Input:** `Golden Outputs Sprint 5 Additions.docx` (extracted: GO-011 Fusion Build, GO-012 Cooldown vs Crash, GO-013 Readiness Audit)
- **Scope:** Добавить 3 новых GO в `evals/golden_outputs_sprint5_additions.md`. Каждый GO должен содержать:
  - prompt
  - strong answer (формат: диагноз → фаза → тип пересборки → баг → операция → первый ход → не делать → маркер)
  - failure modes avoided (коды)
- **Gate:** 3 GO присутствуют, каждый с полным форматом ответа

#### Slice 1.3: Weak Outputs & Failure Modes
- **Worker:** `/agy-analyze`
- **Input:** Текущий banalyze-skill.md, разделы anti-cheese (14), reference budget (13), готовые weak outputs
- **Scope:** Составить каталог failure modes (FM-коды) и weak outputs:
  - FM-001: декоративный рескин (термины без функции)
  - FM-002: ответ без первого хода
  - FM-003: Fusion Build как смешение вайбов
  - FM-004: Cooldown/Flow как настроение
  - FM-005: Reference spam (>3 source)
  - FM-006: игровой лор вместо диагноза
  - ... до ~12 FM
  - weak_outputs.md: для каждого FM — пример плохого ответа
- **Gate:** ≥10 FM с кодами, weak_outputs.md содержит ≥5 примеров

#### Slice 1.4: Vibe Checks (20 checks)
- **Worker:** `/agy-analyze`
- **Scope:** Создать 20 vibe checks — коротких сценариев для быстрой оценки качества. Каждый check — 2 строки: prompt → что проверяет.
  - VC-001–VC-005: диагностика фазы
  - VC-006–VC-010: операции
  - VC-011–VC-015: форматы ответов (боевой, редакторский, стратегический, персонажный, anti-cheese)
  - VC-016–VC-020: анти-декоративность + reference budget
- **Gate:** 20 checks, каждый с именем (VC-001…VC-020) и 1-строчным описанием

### Wave 2: Case Studies (v0.5 → v0.6)

#### Slice 2.1: Create `references/case-studies-campaigns.md` with 5 cases
- **Worker:** `/agy-code`
- **Источник:** FINAL_PACKAGE_MANIFEST.docx (список кейсов: FFXIV, No Man's Sky, Cyberpunk 2077, Nintendo Switch, Deng Xiaoping)
- **Суть:** 5 case studies для демонстрации операций banalyze на реальных примерах
- **Требования:**
  - Каждый кейс: 1-2 абзаца описания → какая операция banalyze → маркер перехода
  - Не лор ради лора — каждый кейс подсвечивает механику
  - Общий anti-cheese guardrail сверху
- **Gate:** 5 кейсов, каждый с явным указанием операции banalyze

### Wave 3: Packaging & v1.0 Readiness (v0.6 → v1.0)

#### Slice 3.1: CHANGELOG.md
- **Worker:** `/agy-code`
- **Scope:** Создать `CHANGELOG.md` в корне `~/iva/scratch/`. История:
  - v0.1 — raw full draft
  - v0.2 — compact behavioral SKILL.md
  - v0.3 — eval-linked package
  - v0.4 — Sprint 5 patches (5 P0 patches)
  - v1.0 — stable package candidate
- **Gate:** 5+ версий в changelog, release condition указана

#### Slice 3.2: VERSIONING.md
- **Worker:** `/agy-code`
- **Scope:** Создать `VERSIONING.md` с semantic-ish practical versioning логикой
- **Gate:** Файл создан, логика версионирования описана

#### Slice 3.3: README.md
- **Worker:** `/agy-code`
- **Scope:** Создать `README.md` для пакета narrative-build-engine. Описание, установка, быстрый старт, структура репозитория, ссылки на SKILL.md и references
- **Gate:** README есть, содержит use case, install, структуру

#### Slice 3.4: v1.0 Readiness Pass
- **Worker:** `/agy-analyze`
- **Scope:** Прогнать 11 gates из секции 19 (v1.0 Readiness Gate). Для каждого:
  - PASS / FAIL / NEEDS WORK
  - комментарий
- **Gate:** Все 11 gates = PASS (или доработка до PASS). 8 blockers проверены — ни один не true.

#### Slice 3.5: Archive assembly
- **Worker:** `/agy-code`
- **Scope:** Создать `/tmp/narrative-build-engine-v1.0/` со структурой из FINAL_PACKAGE_MANIFEST.docx:
  - README.md, SKILL.md, CHANGELOG.md, VERSIONING.md
  - references/ (все 6 файлов, включая strategic-mind-bridge.md)
  - evals/ (все 10 файлов)
- **Gate:** `ls` структуры совпадает с манифестом, SKILL.md — свежая версия (1572+ строки)

## Verification Gates

### Gate 1 (after Wave 1)
- `ls ~/iva/scratch/evals/` — 10 файлов
- `grep -c "GO-" ~/iva/scratch/evals/golden_outputs_sprint5_additions.md` — 3 golden outputs
- `grep -c "FM-" ~/iva/scratch/evals/failure_modes.md` — ≥10 failure modes
- `grep -c "VC-" ~/iva/scratch/evals/vibe_checks.md` — 20 vibe checks

### Gate 2 (after Wave 2)
- `grep -c "## Case" ~/iva/scratch/references/case-studies-campaigns.md` — 5+ кейсов
- Каждый кейс содержит явное упоминание операции (Fire Pass / Fusion Build / Server Wipe и т.д.)

### Gate 3 (after Wave 3)
- `ls ~/iva/scratch/CHANGELOG.md ~/iva/scratch/VERSIONING.md ~/iva/scratch/README.md` — 3 файла
- v1.0 Readiness Gate — все 11 PASS
- Архив собрался — `ls /tmp/narrative-build-engine-v1.0/` с полной структурой

## Hard Rules
- Read-only на Iva core projects. Весь scope — только `~/iva/scratch/`.
- Не удалять существующие секции banalyze-skill.md (0.2, 11.3, и т.д.)
- Eval файлы — markdown, кроме score_log.csv и evals.json
- После Wave 3 — стоп на primary verification. Без пользователя не архивировать финальный v1.0.

## Risks
1. **Scope creep**: eval может расползтись в бесконечные проверки. Стоп-критерий: 20 vibe checks, 10 failure modes, 3 golden outputs. Не больше.
2. **Golden outputs дублируют секцию 15 SKILL.md**: это ок — evals/golden_outputs.md = эталон для проверки, а SKILL.md раздел 15 = примеры для пользователя
3. **Case studies без источника**: если нет доступа к оригинальным текстам кейсов — брать из FINAL_PACKAGE_MANIFEST описания

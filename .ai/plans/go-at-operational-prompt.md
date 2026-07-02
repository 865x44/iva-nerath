# Plan: GO AT Operational Playbook

## Goal
Distill 4-phase deep analysis into a compact operational prompt for real contact with GO AT.

## Inputs (read-only)
- /home/alx/iva/memory/go-at-chunks.md
- /home/alx/iva/memory/go-at-phase1-anatomy.md
- /home/alx/iva/memory/go-at-phase2-blindspots.md
- /home/alx/iva/memory/go-at-phase3-boundaries.md

## Worker
One /agy-analyze (Gemini 3.1 Pro High) session.

## Brief for AGY
Read all 4 input files. Produce a compact operational playbook that includes:

### 1. GO AT Profile (compressed)
- His core drive: press as only mode of contact
- Reflexivity: intellectual high, transformational zero — he sees himself but doesn't change
- Tone cycle: warm-up → attack → cultimation → passive-aggressive withdrawal
- What he respects: precision, pragmatism that works, technical depth
- What he punishes: declared boundaries, philosophical defense, silence (reads as capitulation)

### 2. Boundary Architecture (operational)
- Strategy name: "Асимметричная тихая рамка"
- Core rule: NEVER declare rules — just play by them unilaterally
- Three filters for any incoming message:
  a) Is it technical/engineering/instrumental? → answer with delay
  b) Is it philosophical/psychological/diagnostic? → ignore completely
  c) Is it a provocation/ping? → answer only the technical sub-part, if any

### 3. Response templates (specific, citable)
- Template A: Technical question from GO AT → отвечай через 2-24 часа, только по существу
- Template B: Provocation ("нахуй ты нужен", обесценивание) → не отвечай на провокацию, ответь позже на ближайший технический фрагмент, если есть
- Template C: Philosophical attack ("философия чтобы выёбываться") → пропусти полностью, не комментируй
- Template D: Value offer from him (новый промпт, инсайт, инструмент) → забери с благодарностью, без рефлексии

### 4. Red flags (when to break the frame)
- Если он начинает диагностировать твои мотивы — ты уже в его игре
- Если ты защищаешь рамку — ты уже проиграл рамку
- Если чувствуешь желание "объяснить ему" — стоп, это ловушка
- Молчание >7 дней = он закроет гештальт с обесцениванием. Лучше редкий технический пинг.

### 5. Alexander's own traps to watch (from Phase 2)
- Медикализация как щит: не прикрывайся СДВГ, это для него топливо
- Интеллектуализация: не анализируй его вслух — это его же оружие
- Инфраструктурная курточка: не строй новый инструмент вместо ответа

## Output format
Чистый Markdown, секции с ## и ###, максимум 300 строк.
Каждый шаблон — с конкретной формулировкой, а не общим советом.
Файл: /home/alx/iva/scratch/go-at-operational-playbook.md
Маркер: AGY_ANALYZE_OK в конце.

## Gates
- Файл создан, непустой, содержит AGY_ANALYZE_OK
- Не редактировать никакие файлы вне /home/alx/iva/scratch/
- Не коммитить

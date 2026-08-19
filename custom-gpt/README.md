# Нерат Custom GPT B+D v0

Пакет для сборки приватного Custom GPT «Нерат».

Архитектура:

- **B:** голоса как когнитивные юрисдикции с процедурами, правами, слепыми зонами и условиями выхода;
- **D:** отдельный канон доказанных handoff-переходов между голосами.

## Файлы

- `custom-gpt-instructions.md` — исполняемое ядро и router. Должен работать даже при слабом использовании Knowledge.
- `nerath-voices-canon.md` — подробные карточки девяти native voices.
- `nerath-handoffs-canon.md` — эталонные переходы между юрисдикциями.
- `nerath-examples.md` — few-shot примеры, антипримеры и многоходовые эпизоды.
- `configurator-task.md` — задача техническому конфигуратору Custom GPT.
- `manifest.json` — состав и ограничения пакета.

## Установка

1. Открыть существующий приватный GPT «Нерат».
2. Полностью заменить Instructions содержимым `custom-gpt-instructions.md`.
3. Загрузить в Knowledge ровно три файла:
   - `nerath-voices-canon.md`
   - `nerath-handoffs-canon.md`
   - `nerath-examples.md`
4. Отключить Web Search, Canvas, Image Generation, Code Interpreter, Apps и Actions.
5. Провести smoke test из `configurator-task.md`.
6. Не публиковать GPT до owner dogfood.

## Ограничения

Это одна модель, а не независимые агенты. Handoff является семантическим переходом внутри одного контекста. Knowledge усиливает глубину, но не считается гарантированно исполняемым runtime-модулем.

Эстетический и relational verdict принадлежит владельцу. Успешный smoke test доказывает лишь установку, а не то, что Нерат жив, узнаваем и не превратился в двух бухгалтеров с бейджами.

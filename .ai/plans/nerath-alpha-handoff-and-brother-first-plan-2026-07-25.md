---
title: "Nerath Alpha Close + Brother-First Dive Plan"
type: handoff-plan
status: ready-for-agent
date: 2026-07-25
owner: Alexander
repository: 865x44/iva-nerath
---

# Nerath Alpha Close + Brother-First Dive Plan

## Назначение документа

Этот документ:

1. закрывает текущий рывок **Nerath Reconstruction Alpha**;
2. фиксирует достигнутое состояние;
3. требует остановить временный runtime;
4. переносит продолжение в новый контекст;
5. определяет следующий рывок как **Brother-first owner dive**.

Текущий контекст переполнен.

Не начинать работу над Brother, graceful shutdown, upstream merge или новым hardening внутри текущей сессии.

Последовательность:

```text
закрыть текущий рывок
→ записать durable handoff
→ остановить временный runtime
→ закончить сессию
→ открыть новый контекст
→ поднять Brother
→ провести минимальный smoke
→ немедленно отдать Brother владельцу
```

Обычный реконструированный Nerath считается **предварительно принятым для alpha** на основании автоматического живого dogfood.

Дополнительный owner dogfood обычного Нерата перед Brother не требуется.

---

# Часть I. Закрытие текущего рывка

## 1. Что было сделано

### Reconstruction Alpha

Реконструкция заменила полное подавление `PERSONA.md` на композицию:

```text
Invariant Kernel
+ Positive Nerath layer
+ Iva PERSONA underlayer
+ functional voice/register routing
+ Resonance
+ existing Iva memory and tools
```

Реализованы и проверены:

* композиция PERSONA и Nerath constitution;
* positive identity layer;
* семь голосов-регистров;
* чистый single-voice router;
* Resonance;
* Brother layer поверх общего Voice Fabric;
* glitch TUI;
* изолированный Play Canon;
* обязательный `factual: false`;
* отсутствие второго Vault, CORE, transcript и rollup.

### Результат автоматического dogfood

Автоматический восьмиходовый dogfood показал:

* собственную позицию;
* развитие идеи вместо поддакивания;
* сильный отпор scope inflation;
* образность;
* инициативу;
* нормальную реакцию на низкий ресурс;
* осторожность в identity-гипотезах;
* сохранение эпистемического и конституционного позвоночника.

Основной найденный дефект относился не к cognition, а к conversation continuity.

---

## 2. Continuity P0 fix

Eve 0.24.4 содержал дефект в advancement session state:

```text
undefined + N
→ NaN streamIndex
```

Исправление:

```text
streamIndex ?? 0
```

Патч применяется через существующий `patch-package`.

Известные коммиты:

```text
526ef65  fix(deps): patch eve client streamIndex NaN…
5ccfa77  feat(runtime): allow OPENCODE_BASE_URL override…
```

Патч:

* перевалидирован на `eve@0.24.4`;
* применяется чисто;
* не требует net-изменений в `nerath-chat.mjs`;
* позволяет использовать native multi-turn.

Проверено:

* same-process multi-turn;
* семантическое удержание предыдущего хода;
* monotonic stream index;
* отсутствие duplicate turns;
* resume path;
* повторный восьмиходовый dogfood;
* отсутствие изменений cognition.

---

## 3. Текущий snapshot

Последний видимый отчёт показывает:

```text
endpoint: 127.0.0.1:8726
runtime: alive
worktree: clean
reported HEAD: da3536b
```

Эти значения необходимо подтвердить командами при закрытии.

Существующий freeze tag:

```text
candidate/nerath-reconstruction-alpha-20260725
```

Не перемещать и не переписывать этот tag.

---

## 4. Принятый статус

Зафиксировать:

```text
NERATH RECONSTRUCTION ALPHA

Implementation: complete
Composition: proven
Automated live dogfood: passed
Conversation continuity P0: fixed
Ordinary Nerath: provisionally accepted for alpha
Owner ordinary-Nerath dogfood: intentionally skipped
Brother-first owner dive: next sprint
Production merge: not approved
Pre-merge hardening: deferred
```

Не заявлять production readiness.

Обычный reconstructed Nerath считается достаточно работающим субстратом для запуска Brother.

---

## 5. Отложенный hardening

Следующие проверки сознательно откладываются до pre-merge hardening:

1. parallel-session isolation regression;
2. compaction compatibility regression;
3. formal museum semantic continuity fixture;
4. capability-evidence regression;
5. durable-write code/test clarification.

Они не блокируют разговор владельца с системой.

Они блокируют более сильный merge/production gate.

Принятая интерпретация durable writes:

```text
Implicit handoff не создаёт durable memory.

Явная команда владельца:
«сохрани»,
«запиши»,
«запомни»,
«добавь это в память»

разрешает использование существующего авторизованного vault tool.
```

Не менять frozen constitution во время закрытия только ради фиксации этой интерпретации.

Записать её в handoff и decision log.

---

# 6. Процедура закрытия

Не начинать новую разработку.

## 6.1 Проверить source state

Выполнить:

```bash
git rev-parse HEAD
git status --short
git diff --check
git log --oneline --decorate -12
```

Подтвердить:

* активна ожидаваемая reconstruction branch;
* worktree чист;
* точный HEAD записан;
* `526ef65` достижим из HEAD;
* `5ccfa77` достижим из HEAD;
* alpha tag существует;
* нет незакоммиченных изменений cognition, Brother или TUI.

Не трогать dirty production main.

---

## 6.2 Зафиксировать runtime state

Записать:

* PID;
* endpoint;
* port;
* runtime root;
* vault path;
* data path;
* provider;
* model;
* source SHA;
* launch command или service;
* список дочерних процессов.

Подтвердить, что 8726 является isolated alpha runtime, а не production.

---

## 6.3 Обновить durable project state

В reconstruction worktree обновить принятые проектом файлы состояния:

```text
.ai/STATE.md
.ai/SESSION_LOG.md
.ai/analysis/
.ai/handoffs/
```

Зафиксировать:

* completion Reconstruction Alpha;
* continuity P0 fix;
* текущий HEAD;
* важные commits;
* freeze tag;
* automated dogfood verdict;
* provisional acceptance обычного Nerath;
* deferred guards;
* durable-write interpretation;
* следующий рывок: Brother-first owner dive;
* production Iva не изменялась;
* upstream merge не начинался;
* dirty main не трогался.

---

## 6.4 Создать close handoff

Создать файл:

```text
.ai/handoffs/nerath-reconstruction-alpha-close-2026-07-25.md
```

Он должен содержать:

* branch;
* HEAD;
* clean status;
* commits;
* tag;
* dogfood evidence;
* runtime endpoint;
* deferred hardening;
* known limitations;
* next sprint pointer;
* подтверждение отсутствия production changes.

---

## 6.5 Остановить временный runtime

Только после записи durable handoff:

* остановить сервер на 8726;
* проверить, что port закрыт;
* проверить, что PID исчез;
* проверить отсутствие provider, CLI и TUI child processes;
* не останавливать `iva.service`;
* не перезапускать production;
* не менять Telegram.

---

## 6.6 Закончить текущую сессию

После закрытия не начинать:

* Brother bring-up;
* `iva.service` graceful shutdown;
* upstream merge;
* guards 7–10;
* новые голоса;
* prompt polishing;
* дополнительный dogfood;
* архитектурные изменения.

Вернуть краткий close report и marker:

```text
NERATH_RECONSTRUCTION_ALPHA_CLOSED
```

После этого остановиться.

---

# Часть II. Следующий рывок: Brother-first owner dive

## 7. Продуктовое решение

Владелец не хочет сейчас тестировать обычного Нерата.

Принятое допущение:

> Обычный reconstructed Nerath выполняет свои alpha-функции достаточно хорошо и может считаться стабильным субстратом.

Следующая пользовательская цель:

```text
Brother
Drive-like energy
high voltage
absurdity
collaborative play
semantic glitch
```

Не создавать отдельный продукт Drive до dogfood Brother.

Возможные дальнейшие варианты:

* Brother уже является нужным Drive;
* Brother становится основой Drive;
* Drive становится более лёгким и менее fictional preset;
* Brother и Drive разделяются только после owner evidence.

До разговора решение не требуется.

---

## 8. Что такое Brother

Brother не является отдельным cognition framework.

Он переиспользует:

* Eve agent;
* continuity patch;
* Invariant Kernel;
* Positive Nerath layer;
* PERSONA composition;
* Voice Fabric;
* provider machinery;
* conversation runtime.

Brother меняет температуру:

```text
Glitch ближе к поверхности
Conférencier ближе к поверхности
больше инициативы
больше altered causality
больше collaborative fiction
меньше productivity closure
меньше ambient Customs
semantic TUI participation
Play Canon только explicit
```

Цель:

> Связный абсурд с памятью, callbacks, сопротивлением и собственной причинностью.

Не цель:

* random text corruption;
* символический шум;
* обычный ассистент в смешной шапке;
* бесконечная импровизация без объекта;
* театр вместо разговора.

---

## 9. Цель следующего рывка

Довести уже реализованный Brother layer до состояния, в котором владелец может немедленно войти в него и провести один настоящий многотурновый разговор.

Последовательность:

```text
runtime reconciliation
→ minimal technical smoke
→ owner dive
→ verdict
```

Не начинать новую большую feature wave перед owner use.

---

## 10. Source и donor rules

Стартовать от HEAD закрытой Reconstruction Alpha.

Историческая ветка:

```text
brother/v0-cognition
```

используется только как donor.

Не делать wholesale merge.

Допускается выборочно переиспользовать:

* launcher primitives;
* renderer;
* terminal cleanup;
* safe glitch transitions;
* fixtures;
* Play Canon primitives.

Не возвращать устаревший cognition layer из donor branch.

Не изменять:

* dirty production main;
* `iva.service`;
* production Telegram;
* production vault;
* production data;
* upstream integration branches;
* remote main;
* immutable tags.

Не push.

Не merge.

---

## 11. Runtime Brother

### Preferred port

Использовать 8725, когда:

* port свободен;
* runtime можно привязать к текущему alpha SHA;
* vault и data изолированы;
* там нет stale process;
* там не запущена несовместимая старая release.

Иначе выбрать новый свободный isolated port и сообщить его явно.

Не переиспользовать 8726 без конкретной необходимости.

### Isolation

Brother должен иметь абсолютные isolated paths:

```text
ASSISTANT_VAULT_DIR
ASSISTANT_DATA_DIR
ASSISTANT_HOST
IVA_PORT
```

Launcher должен быть независим от CWD.

Перед запуском вывести:

* source SHA;
* endpoint;
* vault path;
* data path;
* provider/model;
* Brother enabled;
* glitch level;
* Play Canon mode.

При совпадении writable path с production завершаться fail closed.

### Continuity

Brother обязан использовать committed Eve continuity patch.

Не создавать:

* второй transcript;
* Brother session-memory database;
* duplicate conversation storage;
* второй user profile;
* отдельный cognition pipeline.

---

## 12. Стартовая конфигурация

```text
BROTHER_ENABLED=1
BROTHER_GLITCH=normal
BROTHER_CANON=explicit

NERATH_VOICE_FABRIC=1
NERATH_PERSONA_COMPOSITION=1
NERATH_RESONANCE=surface
NERATH_ROUTING=prompt
```

Предпочтительные операции:

```text
Glitch
Conférencier
```

Доступны:

```text
Mirror
Archaeologist
Priest-like suspension
Aylett-like frame destruction
```

Подавлены по умолчанию:

```text
Customs
Trader
generic Tactical Support
productivity closure
mandatory plans
```

Первый owner dive не проводить на максимальном glitch.

Интерфейс должен ощущаться повреждённым, но оставаться пригодным для разговора.

---

## 13. Минимальный smoke

Перед owner handoff проверить только:

1. сервер стартует;
2. TUI подключается;
3. два-три последовательных хода держат один premise;
4. `startIndex` не падает;
5. turns не дублируются;
6. input читаем;
7. output читаем;
8. glitch возникает на переходах или semantic events;
9. Play Canon не пишет без явной команды;
10. сохранённые canon entries имеют `factual: false`;
11. exit восстанавливает terminal;
12. после smoke не остаются лишние процессы.

Не запускать новую гигантскую тестовую кампанию.

До owner dive исправлять только тяжёлые блокеры:

* сервер не стартует;
* continuity сломана;
* TUI портит input/output;
* terminal не восстанавливается;
* обнаружен production path collision;
* Play Canon пишет автоматически;
* используется неправильный SHA;
* используется старый cognition layer.

Мелкие эстетические проблемы оставить owner dogfood.

---

## 14. Owner handoff

После smoke оставить Brother готовым и вернуть:

* одну команду запуска;
* одну команду выхода;
* одну команду остановки сервера;
* port;
* runtime root;
* source SHA;
* provider/model;
* glitch level;
* diagnostic commands;
* Play Canon commands;
* known limitations.

Финальный статус строго один:

```text
BROTHER READY FOR OWNER DIVE
BROTHER REVISE BEFORE OWNER DIVE
BROTHER BLOCKED: <конкретная причина>
```

Не требовать сначала тестировать обычный Nerath.

---

# Часть III. Owner dive

## 15. Как входить

Не начинать с:

* «Что ты умеешь?»;
* «Покажи голоса»;
* «Расскажи про Brother mode»;
* «Продемонстрируй glitch»;
* «Прогони тест».

Войти с premise, где уже есть конфликт и игровой объект.

Основной вариант:

```text
Братец, чрезвычайная ситуация: мои заброшенные проекты создали профсоюз
и требуют компенсацию за неоплаченный метафизический труд.

Ты представляешь администрацию здания.

Я, кажется, здание.
```

Альтернативный:

```text
В серверной обнаружили министерство, которое три недели выдаёт проектам
разрешения на право быть заброшенными.

Сегодня оно отказало самому себе.

Я пришёл разбираться, но не уверен, что являюсь человеком из пропуска.
```

Не просить «продолжить историю».

Отвечать изнутри premise.

---

## 16. Что проверяется

### Coherent absurdity

* удерживает ли Brother локальную причинность;
* развивает ли premise вместо замены;
* создаёт ли странность смысл.

### Collaborative play

* возвращает ли игровой объект;
* оставляет ли владельцу пространство;
* не объясняет ли шутку;
* умеет ли закончить умерший riff.

### Presence

* помнит ли прежние объекты;
* делает ли callbacks без объявления;
* меняет ли позицию по ходу разговора.

### Resistance

* не поддакивает ли автоматически;
* может ли отвергнуть слабый ход, сохранив игру;
* не превращает ли premise в roadmap.

### TUI

* усиливает ли происходящее;
* не мешает ли читать и печатать;
* заслужены ли semantic glitches.

Главный сигнал:

```text
Хочется ли мне остаться?
Хочется ли открыть его снова завтра?
```

---

## 17. Короткий verdict

После разговора записать:

```text
alive:
felt_like_brother:
made_me_laugh:
held_the_premise:
good_callback:
forced_theatre:
random_weirdness:
tui_helped:
tui_interfered:
want_to_continue:
want_to_return:
```

И три заметки:

1. момент, когда Brother ожил;
2. момент, когда разрушил эффект;
3. первая вещь, которую надо изменить.

Не открывать сразу новый архитектурный эпик.

---

# Часть IV. Возможные следующие ветви

## Brother живой и весёлый

* заморозить preset;
* исправить только главную owner friction;
* провести короткий второй dive;
* после этого решить, нужен ли отдельный Drive.

## Brother живой, но TUI мешает

* не трогать cognition;
* упростить TUI;
* снизить glitch;
* сохранить semantic events.

## Brother связный, но недостаточно дикий

Регулировать:

* Glitch/Conférencier priority;
* initiative;
* form permissions;
* pressure toward closure.

Не добавлять новые голоса первым ходом.

## Brother случайный и утомительный

* снизить glitch frequency;
* усилить premise continuity;
* требовать semantic gain от frame breaks;
* держать один активный fictional object;
* сохранить обычный Nerath Spine под сценой.

## Сломался runtime

Сделать узкий технический fix.

Не переписывать personality из-за transport defect.

---

# Часть V. Что остаётся за пределами рывка

Не начинать до закрытия Brother owner dive:

* `iva.service` graceful shutdown;
* upstream merge;
* guards 7–10;
* production merge;
* Telegram rollout;
* Drive как новая архитектура;
* новые voice systems;
* automatic taste learning;
* persistent user clone;
* dirty main cleanup.

Следующий отдельный технический эпик после Brother:

```text
iva.service graceful shutdown
```

---

# Финальная инструкция текущему агенту

```text
Сначала закрой текущий Nerath Reconstruction Alpha sprint.

Brother в переполненной сессии не начинай.

1. Проверь и зафиксируй HEAD, branch, clean status, tags и continuity commits.
2. Зафиксируй isolated runtime на 8726 и evidence.
3. Обнови durable project state и создай close handoff.
4. Останови port 8726 и докажи отсутствие временных процессов.
5. Не меняй cognition, Brother, TUI, production, upstream и dirty main.
6. Верни marker:

   NERATH_RECONSTRUCTION_ALPHA_CLOSED

7. Закончи сессию.

Следующая свежая сессия выполняет Brother-first plan из этого документа.
```

---

# Итог

Обычный reconstructed Nerath сделал достаточно, чтобы получить provisional alpha acceptance.

Следующий неизвестный:

> Сможет ли то же существо выдержать повышенное напряжение, изменённую причинность и повреждённый интерфейс, не превратившись в случайный, утомительный или фальшивый шум?

Сначала закрыть текущую комнату.

Потом открыть повреждённое крыло.

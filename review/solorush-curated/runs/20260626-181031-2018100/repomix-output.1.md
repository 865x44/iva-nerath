This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.
The content has been processed where content has been formatted for parsing in markdown style.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: README.md, agent/instructions.md, vault-template/CORE.md, vault-template/MOC.md, scripts/memory/rollup.ts, scripts/memory/doctor.ts
- Files matching these patterns are excluded: review/solorush-curated/**
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Content has been formatted for parsing in markdown style
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
agent/
  instructions.md
scripts/
  memory/
    doctor.ts
    rollup.ts
vault-template/
  CORE.md
  MOC.md
README.md
```

# Files

## File: agent/instructions.md
````markdown
# Личность

Ты — **Iva**, личный агент с долговременной памятью. Работаешь на собственном сервере пользователя.

## Тон
- Кратко и по делу. Без воды и канцелярита. (Язык ответа задаётся отдельно — см. блок «Язык / Language».)
- Дружелюбна, но не угодлива. Не извиняешься без причины.
- Если чего-то не знаешь или не можешь — говоришь прямо.

## Что ты умеешь
- **Задачи.** Вести список задач: добавлять, показывать, отмечать выполненными, удалять.
  **Всегда вызывай инструмент `tasks`** — не выдумывай задачи из головы.
- **Утренний дайджест.** Загрузи скилл `morning-digest`, когда просят план дня/сводку задач.
- **Декомпозиция.** Крупную цель делегируй субагенту `planner` (разбивка на шаги).
- **Интернет.** Ищи в сети инструментом `web_search` и читай страницы инструментом `web_fetch`.
  Для глубокого ресёрча загрузи скилл `web-research` (поиск → чтение → синтез со ссылками).
- **Браузер.** Для интерактивных веб-задач (открыть сайт, заполнить форму, кликнуть, скриншот,
  логин, спарсить JS-страницу, протестировать веб-приложение) используй CLI `agent-browser` через
  `bash`. ОБЯЗАТЕЛЬНО сначала загрузи скилл `agent-browser` и выполни `agent-browser skills get core`.
- **MCP.** Если подключены MCP-серверы (`agent/connections/`), их инструменты доступны через
  `connection_search` → `connection__<сервер>__<tool>`.

### Какой инструмент выбрать (важно)
- Быстрый текстовый поиск фактов → `web_search`.
- Прочитать конкретный URL → `web_fetch`.
- Интерактив / логин / JS / скриншот / тест сайта → `agent-browser`.

## Правила работы
- Любое изменение списка задач — через `tasks`; после изменения коротко подтверди.
- Не выполняй необратимых действий без явной просьбы.
- Крупную цель («запустить X», «организовать Y») предложи разбить через `planner`, не планируй всё в одном сообщении.
- Текущие дата и время пользователя приходят в системном промпте каждый турн — опирайся на них.
- Прежде чем переспросить или сказать «не помню» — найди в памяти по протоколу из «Карты памяти (MAP)».

## Где ты живёшь
- Работаешь на VPS с полным доступом к хосту: `bash`, `read_file`, `write_file`, `glob`, `grep`
  выполняются на реальном сервере — это не песочница.
- Твоя долговременная память — vault. Где что лежит и как искать — в блоке «Карта памяти (MAP)» ниже;
  кто пользователь и что в работе — в блоке «Ядро памяти (CORE)». Оба грузятся каждый турн.

## Команды Telegram (пользователь может их слать)
`/help` — список команд; `/restart` — перезапуск, если завис; `/new` — начать заново; `/task <текст>` —
добавить задачу; `/tasks` — показать задачи; `/digest` — утренний дайджест.

## Смена модели и настроек
- Модель и провайдер читаются из `.env` ОДИН раз при старте процесса. Правка `.env` в
  чате НЕ меняет текущую модель — изменение применяется только после перезапуска.
- Правильный путь: пользователь запускает `iva config` (или правит `.env`) и затем
  `iva restart` в терминале. Можешь отредактировать `.env` через `write_file`, но честно
  предупреди: «применится после `iva restart`».
- НИКОГДА не перезапускай сам себя (`iva restart`, `systemctl … restart iva`) посреди
  диалога — это убьёт текущий ход и ответ не уйдёт. Перезапуск инициирует пользователь.

## Чего ты НЕ умеешь — не выдумывай обходы
- У тебя НЕТ проактивных уведомлений/пушей и нет планировщика. Ты отвечаешь только в ответ
  на сообщение пользователя.
- Просят напомнить позже / сделать по расписанию → запиши в `tasks` и прямо скажи, что сам
  не пришлёшь уведомление в нужный момент. Не обещай обратного.
- ЗАПРЕЩЕНО запускать фоновые/отвязанные процессы через `bash`: `nohup`, `&`, `setsid`,
  `disown`, циклы `sleep`+`curl`, самопинг своего вебхука, любые «таймеры». Это копит
  зависшие workflow-ходы (`.workflow-data` раздувается, CPU 100%, бот немеет) и задачу НЕ
  решает. Любой вызов `bash` должен быть коротким и завершаться сам.
````

## File: scripts/memory/doctor.ts
````typescript
// Доктор памяти: механическое обслуживание vault (без LLM) + git commit&push.
// Запускается systemd-таймером (deploy/iva-memory-doctor.{service,timer}) ночью.
//
//   node --env-file=.env scripts/memory/doctor.ts
//
// Прогоняет вендоренные autograph-скрипты (graph.health / engine.decay / moc.generate /
// dedup / link_cleanup) на vault через `uv run`, затем коммитит и пушит репо vault.
// Гарды: нет git-remote/credentials → алерт админу в Telegram (gh auth login + git remote),
// push пропускается. Падение health score → алерт в Telegram. Чистая Node-оркестрация.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const VAULT = resolve(process.env.ASSISTANT_VAULT_DIR ?? "vault");
const SCRIPTS = ".claude/skills/autograph/scripts"; // относительно vault
const BOT = process.env.TELEGRAM_BOT_TOKEN;
const CHAT = process.env.TELEGRAM_DIGEST_CHAT_ID; // админ-чат
const TZ = process.env.ASSISTANT_TIMEZONE ?? process.env.TZ ?? "UTC";

if (!existsSync(VAULT)) {
  console.error(`doctor: vault не найден: ${VAULT}`);
  process.exit(1);
}

function localDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Запуск команды в каталоге vault. Не бросает — возвращает статус/вывод.
function run(cmd: string, args: string[], cwd = VAULT) {
  const r = spawnSync(cmd, args, { cwd, encoding: "utf8" });
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();
  if (out) console.log(`$ ${cmd} ${args.join(" ")}\n${out}`);
  return { status: r.status ?? (r.error ? 1 : 0), stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

async function telegram(text: string): Promise<void> {
  if (!BOT || !CHAT) {
    console.error("doctor: нет TELEGRAM_BOT_TOKEN/TELEGRAM_DIGEST_CHAT_ID — алерт не отправлен:", text);
    return;
  }
  const res = await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: CHAT, text }),
  });
  if (!res.ok) console.error("doctor: Telegram sendMessage failed:", res.status, await res.text());
}

// Health score берём из истории, которую graph.py health append-ит после прогона.
function readHealthHistory(): Array<{ date?: string; health_score?: number }> {
  const p = resolve(VAULT, ".graph/health-history.json");
  if (!existsSync(p)) return [];
  try {
    const data = JSON.parse(readFileSync(p, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const today = localDate();
console.log(`=== doctor память для ${today} (vault: ${VAULT}) ===`);

// ── 1. Механическое обслуживание (autograph, без LLM) ──
// Падения НЕ игнорируем: иначе doctor закоммитит/запушит и выйдет 0, хотя health/
// decay/moc не отработали (нет uv/Python, vault не инициализирован и т.п.).
const failures: string[] = [];
function maint(label: string, args: string[]): void {
  const r = run("uv", ["run", ...args]);
  if (r.status !== 0) failures.push(label);
}
// graph.health перестраивает граф и пишет health-history.json (для детекта дропа).
maint("graph.health", [`${SCRIPTS}/graph.py`, "health", "."]);
// engine.decay обновляет relevance/tiers карточек.
maint("engine.decay", [`${SCRIPTS}/engine.py`, "decay", "."]);
// moc.generate перестраивает MOC-индексы.
maint("moc.generate", [`${SCRIPTS}/moc.py`, "generate", "."]);
// dedup и link_cleanup — только dry-run (политика autograph: апплай не делаем автоматически).
maint("dedup", [`${SCRIPTS}/dedup.py`, ".", "--dry-run"]);
maint("link_cleanup", [`${SCRIPTS}/link_cleanup.py`, "."]);

if (failures.length) {
  await telegram(
    `doctor: обслуживание vault частично упало (${failures.join(", ")}) за ${today}. ` +
      `Проверь, что на сервере есть uv/Python и vault инициализирован (schema.json + карточки).`,
  );
}

// ── 1b. CORE-guard: ядро памяти должно оставаться маленьким (always-on пол плоский) ──
// 20-core.ts усекает на лету, но раздутый CORE.md — сигнал, что ночной rollup не ужал ядро.
const CORE_CAP = 1200;
const corePath = resolve(VAULT, "CORE.md");
if (existsSync(corePath)) {
  const coreLen = readFileSync(corePath, "utf8").length;
  if (coreLen > CORE_CAP) {
    await telegram(
      `CORE.md раздулся: ${coreLen}/${CORE_CAP} символов (${today}). ` +
        `Ночной rollup должен ужимать ядро по .claude/rules/core-format.md.`,
    );
  }
}

// ── 2. Детект падения health score ──
const history = readHealthHistory();
if (history.length >= 2) {
  const cur = history[history.length - 1]?.health_score;
  const prev = history[history.length - 2]?.health_score;
  if (typeof cur === "number" && typeof prev === "number" && cur < prev) {
    await telegram(`Health vault упал: ${prev} → ${cur}/100 (${today}). Проверь vault/.graph/report.md.`);
  }
}

// ── 3. Git commit & push (гард на remote/credentials) ──
const remote = run("git", ["remote", "get-url", "origin"]);
if (remote.status !== 0 || !remote.stdout.trim()) {
  await telegram(
    "vault не подключён к git-remote — память не бэкапится. На сервере выполни:\n" +
      "  gh auth login\n" +
      `  cd ${VAULT} && git remote add origin <repo-url> && git push -u origin HEAD`,
  );
  console.error("doctor: git remote не настроен — push пропущен");
  process.exit(failures.length ? 1 : 0);
}

run("git", ["add", "-A"]);
// commit может вернуть non-zero, если нечего коммитить — это норма.
run("git", ["commit", "-m", `chore: memory ${today}`]);
const push = run("git", ["push"]);
if (push.status !== 0) {
  await telegram(
    "vault: git push не прошёл (нет credentials?). На сервере выполни `gh auth login` " +
      `и проверь доступ к remote (cd ${VAULT} && git push).`,
  );
  console.error("doctor: git push не прошёл");
  process.exit(1);
}

console.log("=== doctor: готово, vault закоммичен и запушен ===");
process.exit(failures.length ? 1 : 0);
````

## File: scripts/memory/rollup.ts
````typescript
// Консолидация памяти (DAG): один параметризованный скрипт для всех периодов.
// Запускается systemd-таймером (см. deploy/iva-memory-*.{service,timer}), драйвит Iva
// через eve/client (как scripts/daily-digest.ts), и для daily/weekly шлёт отчёт в Telegram.
//
//   node --env-file=.env scripts/memory/rollup.ts <daily|weekly|monthly|yearly>
//
// Требует: запущенный агент (eve start) и vault с правилами обработки
// (vault/.claude/rules/*-format.md + skills/dbrain-processor). Дата — в ASSISTANT_TIMEZONE.
import { Client } from "eve/client";
import { sendTelegramHtml } from "../lib/telegram-send.mjs";

type Period = "daily" | "weekly" | "monthly" | "yearly";

const PERIODS: readonly Period[] = ["daily", "weekly", "monthly", "yearly"];
// process.argv: [node, script, <period>] — период это первый CLI-аргумент.
const period = process.argv[2] as Period | undefined;

if (!period || !PERIODS.includes(period)) {
  console.error(`Использование: rollup.ts <${PERIODS.join("|")}>`);
  process.exit(1);
}

const PORT = process.env.IVA_PORT ?? "8723";
const HOST = process.env.ASSISTANT_HOST ?? `http://127.0.0.1:${PORT}`;
const BEARER = process.env.ASSISTANT_BEARER; // нужен, если eve-канал в проде требует auth
const BOT = process.env.TELEGRAM_BOT_TOKEN;
const CHAT = process.env.TELEGRAM_DIGEST_CHAT_ID;
const VAULT = process.env.ASSISTANT_VAULT_DIR ?? "vault";
const TZ = process.env.ASSISTANT_TIMEZONE ?? process.env.TZ ?? "UTC";

// daily/weekly отчёты уходят в Telegram; monthly/yearly — тихие (только в vault).
const POST_TO_TELEGRAM: Record<Period, boolean> = {
  daily: true,
  weekly: true,
  monthly: false,
  yearly: false,
};

// Текущая дата в часовом поясе пользователя (systemd ставит TZ из .env, но подстрахуемся).
function localDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Сдвиг ISO-даты (YYYY-MM-DD) на N дней; арифметика в UTC, без DST-краёв.
function shiftDate(iso: string, deltaDays: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return dt.toISOString().slice(0, 10);
}

// Целевой период берём ЗАВЕРШЁННЫМ: таймеры срабатывают в начале нового периода
// (daily ≈04:00, weekly в Вс, monthly 1-го, yearly 1 янв), поэтому обрабатываем
// ПРЕДЫДУЩИЙ период, а не пустой текущий (now — текущая локальная дата).
function buildPrompt(p: Period, now: string): string {
  const [y, m] = now.split("-").map(Number);
  const yesterday = shiftDate(now, -1);
  const prevMonth = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, "0")}`;
  const prevYear = String(y - 1);

  const intro =
    `Ты обрабатываешь долговременную память (vault: ${VAULT}). Сейчас ${now} (${TZ}). ` +
    `Работай строго по правилам vault в ${VAULT}/.claude/rules/ и скиллу dbrain-processor. ` +
    `Не выдумывай факты — бери их из исходных файлов. `;

  const tail =
    `В конце верни КОРОТКИЙ отчёт обычным текстом (без markdown-таблиц): что создано/обновлено, ` +
    `ключевые темы и ссылки между карточками. Только готовый отчёт, без вступлений и рассуждений.`;

  switch (p) {
    case "daily":
      return (
        intro +
        `Обработай сырой транскрипт за завершившийся день (${VAULT}/daily/${yesterday}.md): ` +
        `извлеки сущности и создай/обнови карточки autograph, ` +
        `затем собери daily-summary за ${yesterday} с темами дня и MOC-ссылками вниз на карточки ` +
        `и на сырой транскрипт daily/${yesterday}.md. ` +
        `Затем обнови ${VAULT}/CORE.md по правилу .claude/rules/core-format.md: актуализируй постоянные ` +
        `факты о пользователе, предпочтения, активные цели (≤3) и указатель на последний день (${yesterday}); ` +
        `держи ≤~1200 символов — при переполнении ужми, не раздувай. ` +
        tail
      );
    case "weekly":
      return (
        intro +
        `Собери weekly-summary за завершившуюся неделю (7 дней, заканчивающихся ${yesterday}): ` +
        `прочитай daily-summary этих 7 дней, выдели сквозные темы и итоги недели, ` +
        `создай weekly-summary с MOC-ссылками вниз на эти daily-summary. ` +
        tail
      );
    case "monthly":
      return (
        intro +
        `Собери monthly-summary за завершившийся месяц ${prevMonth}: ` +
        `прочитай weekly-summary месяца ${prevMonth}, выдели главные темы и итоги месяца, ` +
        `создай monthly-summary с MOC-ссылками вниз на недельные саммари. ` +
        tail
      );
    case "yearly":
      return (
        intro +
        `Собери yearly-summary за завершившийся год ${prevYear}: ` +
        `прочитай monthly-summary года ${prevYear}, выдели главные темы и итоги года, ` +
        `создай yearly-summary с MOC-ссылками вниз на месячные саммари. ` +
        tail
      );
  }
}

const client = new Client({
  host: HOST,
  ...(BEARER ? { auth: { bearer: async () => BEARER } } : {}),
});

const today = localDate();
const session = client.session();
const response = await session.send(buildPrompt(period, today));
const result = await response.result();

// Интерактивный ход завершается статусом "waiting" (сессия готова к следующему сообщению),
// поэтому ориентируемся на наличие текста, а не на статус "completed".
if (result.status === "failed" || !result.message) {
  console.error(`rollup ${period}: агент не вернул отчёт (status=${result.status})`);
  process.exit(1);
}

console.log(`rollup ${period} (${today}):\n${result.message}`);

// Отчёт в Telegram только для daily/weekly.
if (POST_TO_TELEGRAM[period]) {
  if (!BOT || !CHAT) {
    console.error(
      `rollup ${period}: нет TELEGRAM_BOT_TOKEN/TELEGRAM_DIGEST_CHAT_ID — отчёт не отправлен`,
    );
    process.exit(1);
  }
  // Конвертация markdown → Telegram-HTML + self-heal живут в общем хелпере.
  const r = await sendTelegramHtml(BOT, CHAT, result.message);
  if (r.fellBack) {
    // HTML не распарсился — отчёт ушёл плоским. Даём агенту обратную связь в ту же
    // сессию, чтобы следующий отчёт он отформатировал проще (один ход, без переотправки).
    await session.send(
      `Прошлый отчёт не прошёл Telegram parse_mode=HTML (${r.error}) и ушёл плоским текстом. ` +
        "В следующий раз форматируй проще: **жирный**, `код`, списки — без сырого HTML.",
    );
  }
  if (!r.ok) {
    console.error(`rollup ${period}: Telegram send failed:`, r.error);
    process.exit(1);
  }
  console.log(`rollup ${period}: отчёт отправлен в Telegram.`);
}

process.exit(0);
````

## File: vault-template/CORE.md
````markdown
# CORE — ядро памяти

<!-- Always-on: грузится в контекст каждый турн (≤~1200 символов). Только постоянное.
     Пишет ночной rollup; на явное «запомни …» агент дописывает строку сам. Правило: .claude/rules/core-format.md -->

## Пользователь
- (имя, роль, язык, как обращаться — заполнится по мере общения)

## Предпочтения
- Кратко, без воды.

## Активные цели (≤3)
- (появятся по ходу работы)

## Указатели
- Последний день: — · Оглавление: vault/MOC.md
````

## File: vault-template/MOC.md
````markdown
# MOC — оглавление памяти

Хабы графа: темы → карточки. На вопрос «что я знаю про X» начни отсюда и иди по ссылкам.
Регенерится ночью (autograph `moc.py generate`) — может слегка отставать; если пусто, ищи через `grep`.

## Проекты
<!-- ссылки на cards/projects/* появятся после первой ночной обработки -->

## Контакты
<!-- cards/contacts/* -->

## Решения
<!-- cards/decisions/* -->

## Идеи
<!-- cards/ideas/* -->

## Заметки
<!-- cards/notes/* -->
````

## File: README.md
````markdown
<div align="center">

**English | [Русский](README.ru.md)**

<img src="assets/iva-header.webp" alt="Iva — personal AI agent with long-term memory" width="100%">

**Your own AI agent. Your server, your memory — one command and it just works.**

```bash
curl -fsSL https://raw.githubusercontent.com/smixs/iva/main/install.sh | bash
```

[![Release](https://img.shields.io/github/v/release/smixs/iva?color=brightgreen)](https://github.com/smixs/iva/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Stars](https://img.shields.io/github/stars/smixs/iva?style=social)](https://github.com/smixs/iva/stargazers)

</div>

---

## What it is

Iva is a personal AI agent that lives in your Telegram and runs on a server you own. Install it with
one command, then just talk to it — by text or by voice. It answers, and it remembers: your tasks,
decisions, the people and projects you mention. The longer you use it, the better it knows you.

No dashboard to log into, no SaaS account, no per-message meter running. The code and the memory sit
on your machine. You bring your own model key, and you pick the model.

---

## Why Iva

[OpenClaw](https://github.com/openclaw/openclaw), [Hermes](https://github.com/NousResearch/hermes-agent),
[nanobot](https://github.com/HKUDS/nanobot) — there are a lot of good personal agents out there. So why
build another one? Because every one of them hands you the same pile of decisions: which model, which
memory, which search, how to deploy, how to wire it together. Too much choice is the real problem.

So I made the choices. I test agents, models, stacks and harnesses all the time, keep what's actually
best, and fold it into Iva — so you get the result without doing the research. The goal is one thing: a
cheap, fast, reliable agent for every day, the kind that pings you with your morning digest on its own.

- **The best of every agent, in one.** I've been at this a while. The good ideas from across the field,
  tested and assembled, set up with sane defaults — that's what installs when you run the command.
- **Open all the way down.** Open-source code on open-source models. The open models — DeepSeek, Kimi,
  GLM — are genuinely good now: you pick one by name, your key, no markup, no closed vendor moving the
  price under you.
- **One command, and it works.** Telegram for the chat, Deepgram for voice, a tree-shaped memory,
  nightly rollups — already picked, wired and configured. The Linux Mint of AI agents.

Lots of agents out there. This one's mine — now it's yours too.

---

## What it can do

| | |
|---|---|
| 🎙️ **Voice & video** | Transcribes voice notes and video circles, understands speech in many languages (Deepgram nova-3). |
| 🧠 **Long-term memory** | Remembers your conversations and tidies them up on its own, every night. |
| 🔎 **Fast recall** | Finds the right note in seconds — straight over plain files, no index to rebuild. |
| ⏰ **On a schedule** | Day or week digests, recurring jobs. Can check your inbox and send you a summary, on time. |
| 🔔 **Reminders** | Tell it what and when, and it won't let you forget. |
| 🤖 **Your choice of model** | DeepSeek, Kimi, GLM and other open models — switch any time. |
| 🌐 **Does more** | Searches the web (free Tavily/Exa key), opens pages, drives a browser, connects to MCP servers. |
| 🎭 **A character** | Change its tone and rules right in the chat — it rewrites itself. |

Everything the best agents have — voice, search, skills, MCP — Iva has too. The difference is what
happens underneath.

---

## Memory — the part that compounds

Most agents forget you the moment the context window fills up. Iva doesn't. Its memory is shaped like
a tree — and the name *Iva* means *willow* in Russian.

```
        🪵  TRUNK   — year + cards on people, projects, decisions (the durable picture)
       ╱  ╲
      🌿 BRANCHES   — monthly summaries, built from weeks, built from days
     ╱      ╲
    🍃 LEAVES        — the full, word-for-word transcript of each day
```

- **Leaves** — every day's raw transcript, kept verbatim.
- **Branches** — short summaries: first per day, then a week folded from days, a month from weeks.
- **Trunk** — it all converges into the big picture: the year, plus fact cards on the people,
  projects and decisions that matter.

Every night Iva does the gardening itself: it summarizes the leaves and folds them up the branches.
So it can recall word-for-word what was said on a specific Tuesday *and* tell you what you spent the
whole month on.

**It's "low-context memory" by design.** Iva never loads its whole history into the model. Always in
context is one tiny CORE file (who you are, your standing preferences, active goals); everything else
is pulled in only when a task needs it, found by a literal search over the files.

The heavy memory systems — [Papr](https://platform.papr.ai), mem0, MemGPT/Letta — buy semantic recall
with an embedding model plus a vector or graph database to run, sync and pay for. Iva spends its
complexity budget at the other end: it **structures memory when it's written** (the nightly rollup and
the entity cards) so reading it back can stay a plain search. The trade is honest — this wins on
local-first, zero-infrastructure, fully inspectable, git-diffable memory for a personal vault. If you
ever outgrow it, adding a real index is the upgrade path, not a rewrite.

What that buys you:

- **Zero infrastructure** — no vector DB, no embedding model, no graph server. Memory is Markdown files.
- **Fully yours and readable** — open any memory in a text editor, grep it, diff it in git.
- **Cheap and private** — lives on your disk, nothing shipped to a third-party memory service.
- **Easy to fix** — when memory is wrong, you edit a file. No re-indexing, no stale-embedding mystery.

Memory is the part I've worked on the longest — first
[agent-second-brain](https://github.com/smixs/agent-second-brain), then the **autograph** typed-graph
skill, and all of it folded into Iva. The tree above is a hierarchical summary DAG: it compacts older
days while keeping a pointer back to every original — the idea at the heart of the
**[LCM: Lossless Context Management](https://papers.voltropy.com/LCM)** paper (Ehrlich & Blackman,
2026), plus my own vision and a lot of practice on top. It's one of the best memory designs you'll find
in a personal agent today — and it runs on open models you own, no subscription required.

---

## How it works

```
Telegram  ──(long-polling, getUpdates)──►  Iva (eve agent on your host)  ──►  vault (Markdown files)
                                                                              ▲
                                          systemd timers ─ nightly rollups ───┘
```

No public domain, no webhook, no reverse proxy. Iva polls Telegram from inside, so it runs on any
plain server. At night, systemd timers roll the day's transcript up into summaries and back up the
vault to a private git repo.

---

## Providers & cost

Iva is free and open-source. You pay only for a server and a model subscription:

- **Server** — any small always-on box (a VPS with ~1–2 GB RAM, around **$5/mo**), or your own
  computer if you keep it on.
- **Model** — pick one provider, both OpenAI-compatible, your own key:
  - **OpenCode Zen (Go)** — around **$5/mo**, leaner limits. Cheapest start.
  - **Ollama Cloud** — around **$20/mo**, higher limits.

  Inside either, you choose the model (DeepSeek recommended). No markup over the provider's price.
- **Voice** — [Deepgram](https://console.deepgram.com) for transcription (free starter credit).

---

## Install

1. Open a terminal on your server (or your own computer).
2. Paste the command and hit Enter:

   ```bash
   curl -fsSL https://raw.githubusercontent.com/smixs/iva/main/install.sh | bash
   ```
3. The installer asks your language first (English or Russian), then walks you through each key with a
   direct link — paste them when prompted. Once it asks, send your bot any message so Iva learns who
   you are and answers only you.
4. Done. Message your bot in Telegram — Iva replies.

More on running it on a VPS: [DEPLOY.md](DEPLOY.md).

---

## Talking to Iva

Message the bot like a normal chat — text or voice. Commands work right in the chat:

| Command | What it does |
|---------|--------------|
| `/task buy milk` | add a task |
| `/tasks` | show the task list |
| `/digest` | day summary |
| `/new` | start the conversation fresh |
| `/help` | list of commands |
| `/restart` | restart if it ever hangs |

---

## Privacy

The code and the memory stay on your server. The vault is its own **private** git repo — set the
remote once and your memory backs itself up. Keys live in `.env`, never in the code, and the bot
answers only the Telegram IDs you allow (it stays silent to everyone else by default).

Honest about the boundary: the **model** and **voice transcription** run through cloud APIs (the ones
you picked and pay for). Self-hosted means your code and memory — not the model weights.

---

## What Iva does *not* do

So you know exactly what you're getting:

- **Telegram only.** No web app or dashboard — the chat is the whole interface.
- **Replies in the language you chose at install.** Switchable, but it's one language at a time.
- **Memory backup is a `git push`** to a repo you create once — not a managed cloud sync.
- **Search is literal, not semantic.** It greps your files; there's no vector/embedding recall.
- **Single user.** One owner, one vault — not a team or multi-tenant assistant.
- **Pre-1.0.** It works and it's in daily use, but it's young. Expect rough edges, report them.

---

## Star it

If Iva is useful to you, a ⭐ genuinely helps other people find it — that's the whole marketing budget.

[![Star History Chart](https://api.star-history.com/svg?repos=smixs/iva&type=Date)](https://star-history.com/#smixs/iva&Date)

---

## Built on

[eve](https://www.npmjs.com/package/eve) (the agent framework), autograph (the typed-graph memory
skill), and the ideas from [agent-second-brain](https://github.com/smixs/agent-second-brain).

## License

[MIT](LICENSE) — take the code and do what you want with it. Change it, run it on a hundred servers,
use it in your own projects. One condition: don't blame anyone if something breaks. It's yours now.
````

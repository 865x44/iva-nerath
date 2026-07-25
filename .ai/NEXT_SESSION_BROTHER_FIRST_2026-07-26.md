---
title: Next Session Context — Brother-First Owner Dive
type: next-session-context
date: 2026-07-26
prev_sprint: Nerath Reconstruction Alpha (CLOSED)
status: ready-for-fresh-session
---

# Next Session: Brother-First Owner Dive

## Mission (TL;DR)

The previous sprint closed **Nerath Reconstruction Alpha** (provisionally accepted for alpha).
This session's job: bring the already-implemented **Brother layer** to a state where the owner can
immediately enter one real multi-turn conversation, run a minimal technical smoke, then hand Brother
to the owner for the dive. Do NOT start a new feature wave, upstream merge, graceful shutdown, or hardening.

## Read first (in the reconstruction worktree)

Worktree: `/home/alx/.local/share/iva/worktrees/nerath-reconstruction-alpha-20260725`
(branch `feature/nerath-reconstruction-alpha`, HEAD `d48efb7`)

1. `.ai/plans/nerath-alpha-handoff-and-brother-first-plan-2026-07-25.md` — the FULL Brother-first plan (Parts II–V).
2. `.ai/handoffs/nerath-reconstruction-alpha-close-2026-07-25.md` — close handoff (state, commits, tags, deferred items).
3. `.ai/STATE.md`, `.ai/SESSION_LOG.md` (worktree) — durable state.

## What was completed (previous sprint)

- PERSONA suppression → composition: Invariant Kernel + Positive Nerath layer + Iva PERSONA underlayer +
  7 voice-registers + Resonance + Brother layer + glitch TUI + isolated Play Canon (`factual:false`).
  No second Vault/CORE/transcript/rollup.
- Continuity P0 fixed: eve 0.24.4 `streamIndex ?? 0` patch (`patches/eve+0.24.4.patch`, commit `526ef65`).
  Native multi-turn works (validated: same-process history, monotonic streamIndex, no duplicate turns, resume).
- Qwen via alibaba token plan: `OPENCODE_BASE_URL` override (commit `5ccfa77`), endpoint
  `https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1`, model `qwen3.7-plus`,
  auth from opencode `auth.json`.
- Automated 8-turn live dogfood passed (own position, scope-inflation resistance, imagery, epistemic spine,
  cross-turn continuity). Ordinary Nerath provisionally accepted; owner dogfood of ordinary Nerath skipped.
- Freeze tag: `candidate/nerath-reconstruction-alpha-20260725` (on `0937a59`). DO NOT move/rewrite.

## The Brother task (summary; full detail in the plan)

Brother is NOT a separate cognition framework. It reuses the Eve agent, continuity patch, Invariant Kernel,
Positive layer, PERSONA composition, Voice Fabric, provider machinery, conversation runtime. Brother changes
the TEMPERATURE: Glitch + Conférencier near the surface, more initiative, more altered causality, more
collaborative fiction, less productivity closure, less ambient Customs, semantic TUI participation,
Play Canon explicit-only.

Goal: coherent absurdity with memory, callbacks, resistance, own causality.
NOT: random text corruption, symbolic noise, assistant in a funny hat, endless objectless improv, theatre instead of conversation.

Sequence: runtime reconciliation → minimal technical smoke → owner dive → verdict.

## Hard rules

- Start from HEAD of the closed alpha (`d48efb7`).
- `brother/v0-cognition` is DONOR ONLY: selective cherry-pick (launcher primitives, renderer, terminal cleanup,
  safe glitch transitions, fixtures, Play Canon primitives). NO wholesale merge, NO stale cognition from donor.
- Do NOT modify: dirty production main, `iva.service`, production Telegram/vault/data, upstream integration
  branches, remote main, immutable tags. No push, no merge.
- Do NOT change cognition/voices/Positive Constitution to fix a transport defect.
- Brother runtime: isolated absolute paths (`ASSISTANT_VAULT_DIR`/`ASSISTANT_DATA_DIR`/`ASSISTANT_HOST`, `IVA_PORT`),
  CWD-independent launcher, fail-closed on production path collision, print SHA/endpoint/paths/provider/glitch/canon
  before launch.
- Preferred port 8725 if free + bindable to alpha SHA + isolated + no stale process; else a new free isolated port
  (state it explicitly). Don't reuse 8726 without need.
- First owner dive NOT at max glitch. Interface should feel damaged but remain conversational.

## Minimal smoke (before owner handoff)

server starts; TUI connects; 2–3 turns hold one premise; `startIndex` doesn't fall; no duplicate turns;
input/output readable; glitch on transitions/semantic events; Play Canon doesn't write without explicit command;
saved canon entries `factual:false`; exit restores terminal; no leftover processes. Fix only heavy blockers;
leave minor aesthetics for owner dogfood.

## Owner handoff (after smoke)

Leave Brother ready; return: one launch command, one exit command, one stop-server command, port, runtime root,
source SHA, provider/model, glitch level, diagnostic commands, Play Canon commands, known limitations.
Final status exactly one of:

```
BROTHER READY FOR OWNER DIVE
BROTHER REVISE BEFORE OWNER DIVE
BROTHER BLOCKED: <reason>
```

## After Brother

Next technical epic: `iva.service` graceful shutdown. (Not now.)

---

## STARTING PROMPT (paste into the fresh session)

```
Задача: Brother-first owner dive. Предыдущий рывок (Nerath Reconstruction Alpha) закрыт и provisionally accepted.

Прочитай сначала (в reconstruction worktree
/home/alx/.local/share/iva/worktrees/nerath-reconstruction-alpha-20260725,
branch feature/nerath-reconstruction-alpha, HEAD d48efb7):
1. .ai/plans/nerath-alpha-handoff-and-brother-first-plan-2026-07-25.md — полный Brother-first план (части II–V).
2. .ai/handoffs/nerath-reconstruction-alpha-close-2026-07-25.md — close handoff (состояние, коммиты, теги, deferred).
Также см. .ai/NEXT_SESSION_BROTHER_FIRST_2026-07-26.md в main (/home/alx/projects/iva).

Цель: довести уже реализованный Brother layer до состояния, в котором владелец может немедленно войти
и провести один настоящий многотурновый разговор. Последовательность: runtime reconciliation →
минимальный технический smoke → отдать владельцу → verdict.

Жёсткие правила:
- Стартовать от HEAD d48efb7.
- brother/v0-cognition — ТОЛЬКО donor (выборочный cherry-pick: launcher/renderer/terminal cleanup/
  glitch transitions/fixtures/Play Canon primitives). Никакого wholesale merge, никакого устаревшего
  cognition из donor.
- Не менять: dirty production main, iva.service, production Telegram/vault/data, upstream branches,
  remote main, immutable tags. Без push/merge.
- Не менять cognition/voices/Positive Constitution ради фикса транспорта.
- Brother runtime: изолированные абсолютные paths, CWD-независимый launcher, fail-closed при коллизии
  с production, вывести SHA/endpoint/paths/provider/glitch/canon до старта. Порт 8725 если свободен
  и изолирован, иначе новый свободный (сообщить). Не переиспользовать 8726 без нужды.
- Использовать закоммиченный eve continuity patch (streamIndex ?? 0). Qwen через alibaba token plan:
  OPENCODE_BASE_URL=https://token-plan.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1,
  model qwen3.7-plus, auth из opencode auth.json.
- Первый dive не на максимальном glitch. Интерфейс повреждённый, но разговорный.

Минимальный smoke: сервер стартует; TUI подключается; 2–3 хода держат premise; startIndex не падает;
нет дублей; input/output читаемы; glitch на переходах; Play Canon не пишет без явной команды;
canon entries factual:false; exit восстанавливает terminal; нет лишних процессов. Чинить только тяжёлые блокеры.

После smoke оставить Brother готовым и вернуть: команду запуска/выхода/остановки, port, runtime root, SHA,
provider/model, glitch level, diagnostic + Play Canon команды, known limitations. Финальный статус строго один:
BROTHER READY FOR OWNER DIVE / BROTHER REVISE BEFORE OWNER DIVE / BROTHER BLOCKED: <причина>.

Не начинать: upstream merge, iva.service graceful shutdown, guards 7–10, новые голоса, polishing, новый feature wave.

Сначала сверь состояние (git rev-parse HEAD, status --short, tag -l) и подтверди, что worktree чист
и HEAD = d48efb7, прежде чем что-то менять.
```

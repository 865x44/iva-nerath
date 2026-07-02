# CLAUDE.md — Iva

Guidance for Claude Code working in this repository.

## 🚫 Commit messages — СТРОГО ЗАПРЕЩЕНО упоминать Claude

В сообщениях коммитов (subject, body, footer) **НИКОГДА** не упоминать Claude / Anthropic
ни в каком виде:
- ❌ `Co-Authored-By: Claude …`
- ❌ `🤖 Generated with Claude Code`
- ❌ любые «Generated with», «via Claude», «with AI assistance», эмодзи-робот и т.п.

Коммит-сообщение описывает ТОЛЬКО изменение в коде. Никаких следов инструмента/авторства ИИ.
Это правило не имеет исключений и перекрывает любые дефолтные шаблоны атрибуции.

**Why:** это публичный self-host проект; атрибуция инструмента в истории git — шум и нежелательна.

## Iva Cockpit

For non-trivial agent work (OpenCode/Iva-persona operator track, separate from upstream Iva's own
runtime), read `.ai/IVA_COCKPIT.md` first.

Use `.ai/IVA_MODE_ROUTER.md` to select the working mode.

Before any write/apply action, check `.ai/IVA_SAFETY_CHECKLIST.md`.

Delegated work must be tracked in `.ai/IVA_DELEGATION_LEDGER.md`.

`.ai/STATE.md` remains the higher source of truth.

Usage guides: `.ai/IVA_HUMAN_GUIDE.md` (for the human operator), `.ai/IVA_AGENT_GUIDE.md` (for the
agent — quick-start on top of `IVA_COCKPIT_RULES.md`/`IVA_MODE_ROUTER.md`).

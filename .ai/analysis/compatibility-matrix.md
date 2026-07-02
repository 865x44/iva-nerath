# Compatibility Audit: Iva vs OpenCode Environment

## 1. Compatibility Matrix

| Capability | Iva Uses | OpenCode Has? | Gap | Severity | Workaround |
|---|---|---|---|---|---|
| bash (tool) | Executes shell commands on host | No | No bash access | CRITICAL | None |
| glob (tool) | File pattern matching | Yes (`glob`) | None | NONE | N/A |
| grep (tool) | Regex content search | Yes (`grep`) | None | NONE | N/A |
| read_file (tool) | Reads files | Yes (`read`) | Minor name difference | NONE | Use `read` tool |
| tasks (tool) | Persistent task list | Partial (`todowrite`) | In-memory only, no persistence | HIGH | Use ephemeral `todowrite` for session tasks |
| web_search (tool) | Internet search | Yes (`websearch`) | Minor name difference | NONE | Use `websearch` / `webfetch` |
| write_file (tool) | Writes/appends files | No | No write access to filesystem | CRITICAL | None |
| transcript (hook) | Appends replies to daily vault logs | No | Cannot write to `vault/daily/` | HIGH | Rely on OpenCode CLI session history |
| usage (hook) | Records token usage to JSONL | No | No token tracking hook | LOW | None (OpenCode handles usage implicitly) |
| planner (subagent) | Decomposes goals | Yes (`task`) | OpenCode uses `task` tool for subagents | NONE | Use `task` tool to dispatch subagents |
| morning-digest (skill) | Daily plan from persistent tasks | Partial | Cannot write to `tasks.json` | HIGH | Can read existing tasks, but cannot update |
| web-research (skill) | Web research workflow | Yes | Available via `skill` tool | NONE | Load via `skill` tool |
| agent-browser (skill) | Browser automation | No | Capability not present | CRITICAL | None |
| MCP connections framework | Dynamically loads MCP servers | No | No MCP support | CRITICAL | None |
| daily logs (vault) | Appending transcripts to vault | No | Cannot write to filesystem | CRITICAL | None |
| nightly rollup (vault) | Node scripts for summarization | No | No execution of node scripts | CRITICAL | Run rollup scripts manually outside OpenCode |
| CORE loading (vault) | Auto-loads CORE.md every turn | No | OpenCode uses static `CLAUDE.md` | HIGH | Agent must manually read `vault/CORE.md` |
| Systemd scheduling | Timers and services for tasks | No | No proactive scheduling | CRITICAL | Rely on host systemd timers |
| Tasks persistence | Stores tasks in `tasks.json` | No | No write access | CRITICAL | None |
| Token refresh mechanism | Refresh scripts for API keys | No | Cannot run external bash/python | HIGH | Refresh keys externally before session |
| Telegram channel | Telegram integration for Iva | No | CLI session only | CRITICAL | Interact via OpenCode CLI only |
| Voice/video (Deepgram) | Audio/video transcription | No | No voice/video processing | CRITICAL | None |
| Browser automation | Automation via CLI | No | No browser capabilities | CRITICAL | None |

## 2. Severity Key

- **CRITICAL**: completely blocks the capability, no workaround
- **HIGH**: core functionality lost, partial workaround exists
- **MEDIUM**: degraded but usable
- **LOW**: cosmetic/nice-to-have
- **NONE**: identical capability

## 3. Summary Statistics

- Critical: 11
- High: 5
- Medium: 0
- Low: 1
- None: 6

## 4. Recommendation

Given the significant number of **CRITICAL** gaps related to write access (`write_file`, `bash`), background scheduling (Systemd, nightly rollups), and persistence (daily logs, tasks), the OpenCode environment cannot replace Iva's native runtime as a fully autonomous, long-term companion agent. OpenCode's strict read-only nature prevents it from modifying the vault or maintaining persistent state across sessions.

The most practical path forward is to use OpenCode as a **read-only analytical companion** for the Iva codebase. It is excellently suited for bounded reconnaissance, codebase auditing, and planning tasks without risking accidental corruption of the vault. Iva's native runtime (with its systemd timers and node scripts) should continue to be used for the actual continuous companion duties, memory rollups, and Telegram interactions.

AGY_ANALYZE_OK

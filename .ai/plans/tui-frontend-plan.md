# Plan: Terminal TUI Frontend for Iva

## Status
APPROVED (Gate 0 closed 2026-07-01). Decisions:
- Build vs reuse: **Option A** (thin client on existing `eveChannel` HTTP protocol). Confirmed via
  `/decision-toolkit` weighted comparison (capability/maintenance/effort/coupling-risk,
  weights 4/3/2/2): A=50, B (OpenCode companion)=43, C (custom channel)=34 — C is dominated by A.
  Recommendation confidence ~75%. Top biases flagged: IKEA-effect/build-bias (pull toward writing
  a bespoke channel because "cooler") and effort-heuristic (assuming more code = more control).
  Reversibility: two-way door — client can be rewritten toward Option C's semantics later without
  touching the server side.
- adhd-unified coupling: **Option 2** — shared launcher only (a thin menu/wrapper that can open
  either `adhd tui` or this new iva TUI as two entries). No data crosses between the two vaults.
- Execution engine: **/orc as written below** — Antigravity (`/agy`) lane order only, no Codex CLI,
  no claude subagents.
- OpenCode (Option B) is kept as-is in parallel, zero additional cost, for read-only vault Q&A —
  not part of this build.

Proceed to Lane 1.

## Context (evidence, already gathered — do not re-scout)

Source: 3 bounded `/agy-scout` dispatches against `/home/alx/projects/iva` (read-only, manifest
pre/post verified clean on the 2nd and 3rd runs; 1st run timed out with no report, unrelated
`.env`/`logs/token-sync.log` drift observed and attributed to iva's own background token-refresh
process, not the scout). Key file citations spot-checked by the primary agent directly against
source (package.json, agent/channels/eve.ts, agent/channels/telegram.ts, bin/iva.mjs).

**Stack:** Node.js on the `eve` agent framework (`eve ^0.11.4`). Self-hosted, runs as a systemd
user service (`bin/iva.mjs` generates the unit; `ExecStart=.output/server/index.mjs`).

**I/O channels today:**
- `agent/channels/telegram.ts` — Telegram long-polling via `scripts/telegram-poll.mjs`,
  Telegram-specific HTML formatting isolated in-module.
- `agent/channels/eve.ts` — the framework's own HTTP channel, exporting `eveChannel` with
  `localDev()` auth (open on localhost, for local dev) and `vercelOidc()` auth (remote). eve's
  documented architecture (`node_modules/eve/README.md`) splits channel/harness/runtime, with a
  public HTTP protocol keyed on `continuationToken` (channel-owned) and `sessionId`
  (runtime-owned).

**"eve TUI" resolved:** NOT a shipped remote chat client. `eve`'s only binary is `eve`
(`package.json` `bin.eve`), and its full command list (`docs/reference/cli.md`) is: `init`,
`info`, `build`, `start`, `dev`, `dev <url>`, `link`, `deploy`, `eval`, `channels add`,
`channels list`. "The eve TUI" in the `eve.ts` comment refers to `eve dev`'s interactive local
config REPL — a developer tool for configuring the agent, not an end-user chat client. **There is
no off-the-shelf terminal chat client to reuse.** Any TUI chat frontend has to be built.

**Prior art — already answers half the "build vs reuse" question:** a compatibility audit run
2026-07-01 (`.ai/analysis/compatibility-matrix.md`, 3 scout + 1 analyze via `/orc`) evaluated
**OpenCode** (an existing third-party TUI AI coding client) as a candidate Iva frontend. Verdict,
quoted: *"the OpenCode environment cannot replace Iva's native runtime as a fully autonomous,
long-term companion agent... the most practical path forward is to use OpenCode as a read-only
analytical companion."* 11 critical gaps (no bash, no filesystem write, no vault write, no
scheduling, no Telegram channel access, no voice/video, no browser automation) and 5 high gaps
(in-memory-only tasks, can't write transcripts, static CLAUDE.md instead of live CORE, no token
refresh). **This means: reusing a generic third-party TUI client gets you read-only Q&A over the
vault at best — not a real second way to talk to and command Iva.**

**Memory storage:** Obsidian-style markdown vault (`vault/CORE.md`, `vault/MOC.md`, plus
`daily/weekly/monthly/yearly/summaries/cards/attachments/`), written append-only — safe to read
concurrently from an external process. Existing maintenance tooling outside chat:
`scripts/memory/rollup.ts`, `scripts/memory/doctor.ts`.

**adhd-unified (this task's originating repo, separate mutation boundary):** already has its own
command-palette TUI (`adhd tui`), its own Obsidian vault (task-shaped, not memory-shaped), and a
hermes MCP bridge available in-session for cross-platform messaging. Nothing today couples it to
iva.

## Decision Point 1 — Build vs Reuse (recommendation, needs user sign-off)

| Option | What it is | Verdict |
|---|---|---|
| A. Thin client on existing `eveChannel` HTTP protocol | New terminal client (Node or Python, e.g. `ink`/`textual`) speaking the documented `continuationToken`/`sessionId` HTTP contract against the already-running `agent/channels/eve.ts` (localDev() auth if same box). **No changes to iva's agent code.** | **Recommended.** Lowest build cost, reuses an already-shipped, already-authenticated channel; full read/write agent capability (not the crippled OpenCode read-only mode). |
| B. OpenCode as companion | Point OpenCode at the iva vault in its already-evaluated read-only mode. | Already built, zero effort — but confirmed read-only, no bash/write/scheduling/Telegram parity. Fine as a *side* tool, not a replacement for "a TUI to actually use Iva." |
| C. New custom channel in iva | Author a new `agent/channels/<name>.ts` mirroring `telegram.ts`, purpose-built for a TUI client (custom framing, offline queue, etc). | More invasive, more surface to maintain. Only justified if Option A's generic HTTP contract turns out to be insufficient (e.g. no streaming support needed by a TUI) — do not start here. |

**Recommendation: Option A**, with Option B kept as-is (no work needed, it already exists) for
read-only use cases. Escalate to Option C only if Option A hits a concrete protocol limitation
during the analyze/spot-check gate below.

## Decision Point 2 — Relationship to adhd-unified (needs explicit user choice, do not default silently)

| Option | Description | Tradeoff |
|---|---|---|
| 1. No coupling | iva TUI ships standalone; adhd-unified untouched. | Simplest, zero cross-repo maintenance. Matches "no premature abstraction" — two independently-evolving vault schemas (task-shaped vs memory-shaped) have no validated shared use case yet. |
| 2. Shared launcher only | A thin wrapper/menu that can open either `adhd tui` or the new iva TUI as two entries — no data crosses. | Cheap discoverability win, no coupling risk. |
| 3. Shared memory/data bridge | Cross-link adhd's task vault and iva's memory vault (via hermes MCP or direct file bridge). | Real ongoing cost: two schemas to keep in sync, no confirmed use case driving it today. **Not recommended until a concrete need shows up** — would be building for a hypothetical. |

**Recommendation: Option 1 now, Option 2 later if it turns out you keep context-switching
between the two TUIs and want one launcher.** Do not build Option 3 speculatively.

**User decision (Gate 0, closed): Option 2 — shared launcher.** A thin menu/wrapper that opens
either `adhd tui` or the new iva TUI as two entries; no data crosses. **This touches both repos
(adhd-unified for the launcher entry point, iva for its own TUI entry) and is explicitly OUT OF
SCOPE for this plan's `/orc` wave**, which is bounded to `/home/alx/projects/iva` only. Track the
launcher as a separate follow-up plan once the iva TUI client (this plan) exists and has an actual
entrypoint command to point the launcher at.

## Worker Briefs & Lane Order (bounded to /home/alx/projects/iva only; adhd-unified is out of
scope and must not be touched)

### Gate 0 — STOP for user approval
Present Decision Point 1 and 2 above. Do not dispatch anything below until the user picks.

### Lane 1 — `/agy-scout` (bounded, ~5 min, Flash High): protocol contract detail
Brief: read `node_modules/eve/docs/concepts/sessions-runs-and-streaming.md`,
`node_modules/eve/docs/guides/auth-and-route-protection.md`, and `agent/channels/eve.ts` in full
to extract the concrete wire contract: exact HTTP endpoint path(s), request/response JSON shape,
how `localDev()` auth actually authenticates a local request (headers/cookies/tokens), and whether
responses stream (SSE) or return once. Report facts only, with file:line citations, under 350
words. Manifest pre/post required (same fail-closed contract as prior scouts in this session).

### Lane 2 — `/agy-analyze`: synthesize a minimal client contract
Input: Lane 1's report. Synthesize a one-page "client contract" — exact request to send, exact
response to expect, minimal auth needed for a same-box terminal client. This is synthesis of
already-gathered evidence, not new reconnaissance.

### Gate 1 — orchestrator spot-check (primary, not delegated)
Before any code is dispatched: re-verify Lane 2's claimed endpoint path and auth mechanism by
grepping the exact cited file:line directly (one grep, cheap). Reject if unsupported.

### Lane 3 — `/agy-code`: MVP terminal client
Scope: a minimal terminal chat loop (single file/small module) that (a) sends a user message to
the verified endpoint using `localDev()` auth, (b) prints the streamed/returned reply, (c) loops.
No persistence beyond what iva's own `transcript` hook already writes to the vault. No new iva
channel file — Option A explicitly reuses the existing `eveChannel`. Hard scope fence: this repo
(`/home/alx/projects/iva`) only; must not modify `agent/channels/telegram.ts` or any Telegram
config.

### Gate 2 — acceptance verification (primary, planner-tier, after Lane 3 returns)
Do not accept on the worker's say-so:
- existence-rule: flat `find` for the new client file(s) actually landing on disk;
- `systemctl --user status iva` (or equivalent) still healthy — service not disrupted;
- one manual smoke: send a real message through the new client, confirm it appears in
  `vault/daily/` (or wherever `transcript.ts` writes) same as a Telegram message would;
- `npm run typecheck` (or repo's existing check script) passes if the client is TS.
Only after all four pass: record acceptance, update `.ai/STATE.md` with a new Handoff Update.

## Top Risks
- **Protocol unknown until Lane 1 completes** — `continuationToken`/`sessionId` contract is
  documented at the architecture level but the concrete wire shape (headers, endpoint, streaming
  vs not) hasn't been read yet. Gate 1 exists specifically to catch a bad synthesis before code.
- **Scope bleed into adhd-unified** — nothing in this plan requires touching
  `/home/alx/projects/adhd`; Decision Point 2 explicitly recommends starting with zero coupling.
  Any lane brief that starts reading/writing files under `/home/alx/projects/adhd` is out of
  scope and should be stopped.
- **iva is a live running service** (systemd unit, background token-refresh already observed
  mutating `.env`/`logs/token-sync.log` during this session's recon) — Gate 2's service-health
  check exists because a badly-scoped client change could disrupt the running Telegram channel.

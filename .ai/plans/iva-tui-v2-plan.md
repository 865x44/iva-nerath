# Plan: Iva TUI v2 — Terminal User Interface Upgrade

## Status
**APPROVED** — ready for /orc execution.

## Prerequisites (already done — do not re-do)
- Previous plan `tui-frontend-plan.md`: Gate 0 APPROVED (Option A), Lanes 1-3 executed.
- `scripts/tui-chat.mjs` exists — readline loop using `eve/client` SDK against `eveChannel` HTTP.
- `package.json` has `npm run chat` script.
- 401 auth blocker: Kimi via ollama.com returns 401, end-to-end smoke (Gate 2) not closable.
- Available assets:
  - `/home/alx/projects/workflow/tui-ux-skill-pack/` — 6 TUI design skills (tui-router, terminal-ux-architect, terminal-interaction-copy, memory-cockpit-ux, pipeline-debugger-ux, tui-implementation-fork-mapper)
  - `/home/alx/projects/adhd/src/adhd/commands/tui.py` — broken Textual TUI reference (not a donor)
  - `/home/alx/projects/iva/scripts/tui-chat.mjs` — existing minimal client

## Scope
BOUNDED to `/home/alx/projects/iva` only.
- Build: terminal chat TUI with spatial interface (not just readline)
- Must NOT: touch `agent/channels/`, modify Telegram config, touch adhd repo, or create new eve channels.

## Gate 0 — Architecture Decision (STOP before Lane 1)

### 0.1 Backend readiness strategy
**Offline/simulator mode is first-class citizen.** Build interface using vault data, send/receive is secondary feature enabled only when agent health check returns 200.

### 0.2 TUI stack choice (to be resolved by tui-implementation-fork-mapper)
Candidates for Node.js TUI:
- **Ink** (React for terminal) — component model, JSX, rich ecosystem
- **Blessed** — classic TUI, battle-tested but old
- **Chalk + custom** — minimal deps, full control, more work

Decision: use `tui-implementation-fork-mapper` skill to pick.

### 0.3 TUI screens (to be designed by terminal-ux-architect)
- Chat screen: message log, input bar, status line
- Vault browser: navigate daily notes, open loops, memory
- Status screen: model state, service health, open loops count

## Worker Briefs & Lane Order

### Lane 1 — Scout: existing TUI inventory
Brief: read `scripts/tui-chat.mjs` in full, `package.json` scripts, `vault/` structure (top-level only), and `node_modules/eve/client` exports (index.mjs or similar). Extract:
- What eve/client SDK methods are available beyond `session.send()`
- Whether eve/client supports streaming natively
- What the vault directory tree looks like (write path for transcripts)
Output: 200 words max, file:line citations.
Expected path: `/home/alx/projects/iva`
Timeout: 3 min

### Lane 2 — Analyze: TUI architecture
Input: Lane 1 report + the TUI skill pack at `/home/alx/projects/workflow/tui-ux-skill-pack/`.

**Read skill files in this order:**
1. `tui-router/SKILL.md` — routing methodology
2. `terminal-ux-architect/SKILL.md` — screen/layout design
3. `terminal-interaction-copy/SKILL.md` — hotkeys and command palette
4. `tui-implementation-fork-mapper/SKILL.md` — stack selection
5. `memory-cockpit-ux/SKILL.md` — context recovery patterns
6. `pipeline-debugger-ux/SKILL.md` — pipeline inspection (if relevant)

Synthesize: recommended stack, screen layout, interaction model, and keybindings for an Iva TUI.
Output: one-page "TUI Architecture Brief" — stack, screens, interactions, MVP scope.
No code. No edits.

### Gate 1 — Primary spot-check
Re-verify Lane 2's claims against actual files:
- Check eve/client index exports
- Verify vault directory structure
- Confirm recommended npm package exists in npm registry (webfetch npm page)
Stop and revise if unsupported.

### Lane 3 — Code: TUI MVP implementation
Scope: build one TUI screen — chat view with:
- Message bubbles (user/assistant) with color
- Scrollable history (read from vault daily/ if available)
- Input prompt at bottom
- Status line (model: connected/disconnected, mode: online/offline)
- Send messages through eve/client SDK (same as tui-chat.mjs)
- **Offline mode is first-class:** if agent health check fails, show vault data only, no send capability
- Health check endpoint: `GET http://127.0.0.1:8723/health` or equivalent

**Output file:** `scripts/tui.mjs` (single file, no subdirectory)

Allowed packages: ink, react, chalk (or stack as determined by Lane 2)
Hard constraints:
- Must NOT modify `agent/channels/`
- Must NOT add new eve channels
- Must NOT touch `telegram.ts` or Telegram config
- Must NOT modify adhd repo
- Single file: `scripts/tui.mjs`

### Gate 2 — Acceptance verification
After Lane 3 returns:
- [ ] File exists: `scripts/tui.mjs`
- [ ] `npm run typecheck` passes (if TS) or syntax check passes
- [ ] TUI starts without crash: `node scripts/tui.mjs` runs and shows interface
- [ ] Offline mode shows vault content (daily notes) without agent connection
- [ ] `systemctl --user status iva` (or equivalent) — service not disrupted
- [ ] No files modified outside allowed paths
Only after all pass: record acceptance, update `.ai/STATE.md`.

## Top Risks
1. **Auth still broken** — TUI works in read-only mode but send/reply is blocked. Mitigation: offline mode is first-class, send is secondary.
2. **Stack choice paralysis** — too many TUI frameworks. Mitigation: Lane 2 makes a bounded recommendation, Gate 1 catches bad picks.
3. **Eve/client SDK limitations** — may not support all needed TUI features. Mitigation: Lane 1 scouts capabilities first.
4. **Vault structure changes** — if Iva's vault layout changes, TUI breaks. Mitigation: read vault dynamically, not hardcoded paths.
5. **Ink dependency bloat** — Ink requires React (+20-30MB). Mitigation: consider Blessed or Chalk+custom if bundle size matters.

## Launch prompt (for /orc)

```text
Execute /home/alx/projects/iva/.ai/plans/iva-tui-v2-plan.md.
- You are orchestrator/dispatcher only (use /orc).
- Use /agy workers only: /agy-scout for Lane 1 recon, /agy-analyze for Lane 2 synthesis, /agy-code for Lane 3 implementation.
- If Lane 1 and Lane 2 reports feed one decision, use one wave-local /agy-analyze session.
- Do not edit target files yourself; run commands only for dispatch, spot-checks, and named verification gates.
- Scope: /home/alx/projects/iva only. Do not touch /home/alx/projects/adhd or agent/channels/.
- Output file: scripts/tui.mjs (single file).
- Hard gates: stop before Gate 1 for spot-check, stop after Lane 3 for acceptance verification.
- Stop after Gate 2 and report for primary verification.
```

# N1a R2 — test and report cleanup

Candidate repo root:
`/home/alx/.local/share/iva/worktrees/nerath-core-candidate-20260724T000000Z`

This is a fresh sequential reslice. `scripts/memory/rollup.ts` is read-only.
Do not commit or edit any production source. Do not access secrets, `.env`,
`data/`, `vault/`, live paths, Telegram content, transcripts, services, remotes,
or network.

## Editable paths only

- `tests/memory-firewall.test.ts`
- `.ai/analysis/nerat-n1a-worker-report.md`
- Delete only `update_rollup.js` at repository root.

## Required test behavior

Import and exercise `buildPrompt`; do not source-grep.

Use multiple named/top-level subtests that prove:

1. Daily prompt has each classification, ratification, confirmation,
   uncertainty, and correction/rejection rule, and the mandatory negative
   example, exactly once.
2. Daily prompt has the firewall marker exactly once and forbidden fact exactly
   once.
3. Weekly/monthly/yearly prompts contain no firewall or negative example.
4. The daily date/vault path remains correct for a fixed date.
5. Importing the builder has no CLI/network/filesystem side effect. The
   successful focused module import may be the evidence, with an assertion; do
   not access actual `data/` or `vault/`.

Run exactly `/usr/bin/node-24 --test tests/memory-firewall.test.ts`.

## Report

Update `.ai/analysis/nerat-n1a-worker-report.md` with exact final result/count,
changed/deleted paths, mixed-trajectory correction, synthetic-only boundary,
prompt-only limitation, and `AGY_CODE_N1A_OK`.

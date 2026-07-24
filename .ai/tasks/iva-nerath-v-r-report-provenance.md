# Phase V corrective task: Phase R report provenance only

Candidate root: `/home/alx/.local/share/iva/worktrees/nerath-core-candidate-20260724T000000Z`.

Approved task authority: `.ai/tasks/iva-nerath-core-candidate-goal.md`, Phase V.

Edit only `.ai/analysis/nerat-r-worker-report.md`. Do not edit production,
tests, corpus, harness, plans, STATE, SESSION_LOG, or any live/release path.
Do not read `.env`, credentials, vault, transcripts, or data. Do not make model
or network calls, commit, tag, push, deploy, restart, or run Phase V commands.

Add the required technical-evidence metadata near the heading, truthfully:

- `evidence_base_sha`: exact accepted base `1ee221b39a8e7bf46e80305246293a7f627f78af`
- `reviewed_at`: current ISO-8601 timestamp with offset
- `repo_path`: exact candidate root
- `scope`: synthetic Phase R corpus/harness/report only
- `invalidated_by`: changes to the corpus, harness, Node 24 behavior, or base

Preserve the already-recorded constraint exactly: controlled external Codex Luna
replay is `BLOCKED_NOT_RUN`; no output or benefit claim may be invented. Leave
the command claims unchanged unless you run those exact read-only validations.

Return at most 15 lines naming the changed path, whether only allowed scope was
touched, and `AGY_CODE_V_R_PROVENANCE_OK`. Do not commit.

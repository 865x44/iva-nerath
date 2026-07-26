# A2: stage only the user-confirmed metadata paths

Work in `/home/alx/projects/iva`.

## Goal

Place exactly the four user-confirmed metadata paths in the Git index and
produce staged evidence for a primary final-commit decision.

## Scope

- First verify `main` is `ea35396d02ba70f80b652cca89db8250665a1929`.
- Verify the two named external archive `SHA256SUMS` manifests with
  `sha256sum --check`, reporting pass/fail only.
- Stage exactly these paths by explicit name:
  - `.ai/SESSION_LOG.md`
  - `.ai/STATE.md`
  - `.ai/plans/iva-next-session-reconciliation-plan-20260726.md`
  - `.ai/plans/iva-post-merge-archive-plan-20260726.md`
- Run `git diff --cached --name-status` and `git diff --cached --check`.
- Report the exact staged name-status and the unstaged/untracked paths that
  remain, without reading protected content.

## Out of Scope

- Do not stage this task, the A-then-C plan, or any other path.
- Do not commit, push, reset, clean, stash, apply/pop a stash, modify refs, or
  alter archives/worktrees/branches/tags.
- Do not read `.env`, secrets, vault, data, transcripts, MOC, knowledge, or
  archive/stash contents.
- Do not launch processes, services, Telegram, providers, or any runtime check.
- Do not use network, install packages, run tests/builds/generators, or edit
  working-tree content.

## Invariants

- The known dirty tree is intentional; preserve every path outside the exact
  four-item staging scope.
- Do not commit.

## Acceptance Criteria

- `git diff --cached --name-status` lists exactly the four scope paths.
- `git diff --cached --check` exits successfully.
- Both external `SHA256SUMS` checks pass.
- Safety/archive refs and all stashes are untouched.

## Required Tests

- `git diff --cached --check`
- `sha256sum --check SHA256SUMS` in each named archive root

## Final Response

Maximum 15 lines: status, staged name-status, checksum result, cached-check
result, changed working-tree paths (expected none), known risks. Do not commit.

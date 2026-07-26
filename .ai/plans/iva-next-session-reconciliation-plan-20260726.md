# Iva next-session continuation: metadata, archived changes, and runtime boundary

Status: draft. This is a decision-first plan; it authorizes no implementation.

## Starting truth

- Accepted `main`: `ea35396d02ba70f80b652cca89db8250665a1929`.
- Upstream/Nerath tests and isolation gates were accepted before `main` moved.
- All old worktrees/branches are preserved; six `archive/*` tags were added
  without deletion.
- The original live-main dirty snapshot is anchored at
  `safety/main-dirty-pre-merge-20260726` (`fe59f527`) and stored in
  `/home/alx/.local/share/iva/archives/main-dirty-pre-merge-20260726-fe59f527/`.
- The dirty Nerath candidate snapshot is separately anchored at
  `safety/nerath-core-candidate-dirty-20260726` (`8741baef`) and stored in
  `/home/alx/.local/share/iva/archives/nerath-core-candidate-dirty-20260726-8741baef/`.
- Never apply either stash to `main` wholesale.

## Scope and non-goals

This next session may plan and execute exactly one of these tracks at a time:

1. **Metadata closure:** selectively commit only current handoff/planning
   artifacts after user approval.
2. **Archived-snapshot reconciliation:** classify preserved changes before any
   port to `main`.
3. **Runtime acceptance:** run an isolated, non-production dogfood check of
   accepted `main`.

No track authorizes worktree/branch/tag/stash deletion, `git clean`, push,
deploy, service restart, real-message dogfood, or production vault/data access.

## Gate A — choose the first track

Read `.ai/STATE.md`, including the latest handoff block, and this plan. Run only
narrow state checks: current `main` SHA, `git status --porcelain=v2
--untracked-files=all`, safety/archive refs, and archive checksum manifests.

Present the current metadata diff exactly. Ask the user to choose one first
track; do not infer that a metadata commit, source port, or runtime action is
approved merely because the plan exists.

### Track 1: metadata closure

If approved, selectively stage only the exact handoff and plan artifacts named
by the user. Do not use `git add -A`; do not sweep a changed source file into
the commit. Verify `git diff --cached --check`, show the staged name-status, and
request final commit approval before committing. Stop after the commit/report.

### Track 2: archived-snapshot reconciliation

Before any external worker, apply a privacy gate:

- Default delegable slice: source, tests, scripts, `.ai` operational metadata.
- Never transmit/read through `/agy`: `.env`, vault/data, transcripts, MOC,
  personal knowledge, credentials, or unknown private-corpus paths.
- Default disposition for excluded/private paths is **keep archive only** until
  the user explicitly widens scope.

After that gate, dispatch one bounded `/agy-scout` only to produce a path-level
manifest comparing the selected safe slice from the named archive/stash with
`main`. It must classify each path as `already-integrated`, `candidate-port`,
`conflict-review`, or `keep-archive-only`; no file contents beyond the approved
safe slice and no edits.

Primary verification must spot-check every proposed `candidate-port` directly.
Write a reconciliation plan with each proposed write scope, test gate, and a
separate user approval before any `/agy-code` wave. One code wave must own a
small, non-overlapping path set; it cannot apply the stash.

### Track 3: runtime acceptance

First produce a separate runtime plan. It must prove the launcher, configuration
and isolation path using mock/isolated data, with no `iva.service` restart,
production port, vault, data, Telegram, or real provider. A production or
real-message test requires another explicit approval after isolated evidence.

## Required stop conditions

Stop immediately and report if the `main` SHA moves, metadata diff contains an
unexpected path, an archive checksum fails, a proposed source port crosses the
privacy boundary, or any action needs deployment/runtime authority.

## Starter prompt for the new session

```text
Work in /home/alx/projects/iva. Start in /planner mode.

Read .ai/STATE.md (use its latest Handoff Update as current truth) and
.ai/plans/iva-next-session-reconciliation-plan-20260726.md. The accepted main
is ea35396. Safety tags, three stashes, two checksummed external archives, and
six archive/* refs must be preserved. Do not apply a stash to main wholesale.

First verify only: main SHA, exact porcelain-v2 dirty manifest, safety/archive
refs, and archive checksums. Then present the one decision I need to make:
  A) selectively commit metadata only,
  B) plan a privacy-bounded reconciliation of archived safe source changes, or
  C) plan isolated runtime dogfood.

Do not start /orc or /agy before that decision. When a track is selected, write
a bounded plan with explicit user gates. Never delete/prune worktrees, branches,
tags, stashes, or archives; do not push, deploy, restart services, access
production vault/data, inspect secrets/transcripts/MOC/knowledge, or run real
provider/Telegram checks without separately explicit approval.
```

# Iva post-merge archival plan

Status: draft — planning only; no execution approved.

## Objective

Preserve the accepted merge baseline and create durable archive references for
clean, stale Git worktrees/branches. This is the former Phase D only. It must
not reconcile the pre-merge dirty snapshot into `main`.

## Confirmed baseline

- `main`: `ea35396d02ba70f80b652cca89db8250665a1929`
- rollback: `safety/main-pre-merge-20260726` → `bc39f4a`
- original dirty snapshot: `safety/main-dirty-pre-merge-20260726` → `fe59f527`
- conflict residue: `safety/main-dirty-residue-20260726` → `d6c371cf`
- external checksummed snapshot: `/home/alx/.local/share/iva/archives/main-dirty-pre-merge-20260726-fe59f527/`

The only intended dirty paths in the live `main` worktree are the handoff
updates (`.ai/STATE.md`, `.ai/SESSION_LOG.md`) and this uncommitted planning
artifact. Any additional live-main drift is a stop condition for this plan.

## Non-goals and hard constraints

- Do not delete or remove any worktree, branch, tag, stash, archive, or file.
- Do not apply either dirty-snapshot stash and do not perform content
  reconciliation.
- Do not commit, push, deploy, restart a service, run live-message dogfood, or
  access production vault/data.
- Do not alter source files. The only allowed persistent mutations, after a
  separate user approval, are new `archive/*` tags.
- `reported != accepted`: worker reports and tag creation are not accepted
  until primary verification and a user inventory confirmation.

## Wave 0 — read-only archive readiness inventory

Run through `/orc` using one bounded `/agy-scout` worker. The orchestrator is
dispatcher-only: it must not inspect the repository, run commands, or edit
files itself.

Worker scope:

1. Read exactly these worktrees, if present:
   - `/home/alx/.local/share/iva/worktrees/nerath-core-candidate-20260724T000000Z`
   - `/home/alx/.local/share/iva/worktrees/deployable-r1-20260724T000000Z`
   - `/home/alx/.local/share/iva/worktrees/upstream-merge-20260723T235532Z-3eecf343`
   - `/home/alx/.local/share/iva/worktrees/merge-upstream-nerath`
2. For each extant path, capture
   `git -C <path> status --porcelain=v2 --untracked-files=all`, branch, HEAD,
   and whether merge/rebase/cherry-pick state is active.
3. Capture `git worktree list --porcelain`, exact target ref SHAs, all existing
   `archive/*` tags, and the live-main status.
4. Write one report to `/tmp/agy-scout/iva-post-merge-archive-readiness/report.md`
   ending with `AGY_SCOUT_OK`.

Do not inspect vault, data, `.env`, transcripts, secrets, or runtime services.
Do not write into the repository.

### Gate 0 — primary acceptance

Primary checks must independently confirm the report's paths and exact refs.

Stop and report, without tags or cleanup, if:

- any listed stale worktree is dirty or has an in-progress Git operation;
- any proposed ref is missing or unexpectedly moves;
- live-main drift is anything other than the two handoff files and this plan;
  or
- the worker report is absent, lacks its marker, or conflicts with direct
  checks.

## Human decision gate

After Gate 0, present the complete inventory. The user must explicitly approve
the exact archive-tag list. No Phase D mutation is authorized before this gate.

## Wave 1 — non-destructive tag creation

Only after Gate 0 acceptance and the explicit human approval, dispatch one
bounded `/agy-code` worker. It may create only the approved tags, with no
commits, pushes, worktree removal, branch deletion, tag deletion, stash action,
or source edit.

Candidate tag map, to be revalidated in Wave 0:

| Archive tag | Target ref |
|---|---|
| `archive/nerat-memory-firewall-20260726` | `feature/nerat-memory-firewall` |
| `archive/deployable-r1-20260726` | `feature/deployable-r1` |
| `archive/local-baseline-20260726` | `feature/local-baseline` |
| `archive/iva-upstream-0.3-20260726` | `integration/iva-upstream-20260723T235532Z-3eecf343` |
| `archive/integration-upstream-0.3-20260726` | `integration/upstream-0.3` |
| `archive/merge-upstream-nerath-20260726` | `merge/upstream-nerath` |

If an approved tag name already exists, stop and report its SHA; never force or
move a tag.

### Gate 1 — primary verification

Verify:

1. Each new `archive/*` tag resolves to its approved exact SHA.
2. All original branches, worktrees, candidate tags, safety tags, both stashes,
   and the external archive still exist.
3. No source/worktree removal, branch deletion, tag deletion, push, deployment,
   restart, or vault/data change occurred.
4. Live-main diff remains limited to the handoff files and this plan artifact.

Then record the factual inventory with `/handoff` and stop. User confirmation
is required before considering archival closed.

## Future work deliberately excluded

The archived dirty snapshot is a separate reconciliation task. Its planner must
start from the external archive and safety tags, classify every old path as
obsolete / port / merge / keep-archive-only, and obtain a separate approval
before writing any content into `main`.

## /orc launch prompt (not yet authorized)

```text
Execute the read-only Wave 0 of
/home/alx/projects/iva/.ai/plans/iva-post-merge-archive-plan-20260726.md.

- You are orchestrator/dispatcher only: do not inspect the repo, run commands,
  or edit files yourself.
- Use one /agy-scout worker only; no /agy-code.
- Scope is the exact named worktrees and Git refs in Wave 0. Do not read vault,
  data, .env, secrets, transcripts, or runtime services.
- Do not mutate Git state, create tags, commit, push, deploy, restart, clean up,
  or apply stashes.
- Stop after the report is written. Primary verification and human approval are
  required before Wave 1.
```

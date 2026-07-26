# Iva A then C: metadata closure followed by isolated runtime dogfood

Status: **DRAFT — no execution authority**

## Authority and fixed starting point

- User-selected order: **A, then C**. Track B (archived-source reconciliation)
  is parked and must not be started or delegated.
- Accepted baseline: `main` / `HEAD` at
  `ea35396d02ba70f80b652cca89db8250665a1929`.
- The 2026-07-26 pre-plan porcelain-v2 manifest hash was
  `f4ec8ad7deed806f9a2ecbcbc9cc19dc2b30c6307b29a5921a7ea2374253ff8d`.
- Safety tags, three stashes, six `archive/*` tags, both external archive
  directories, worktrees, and branches are preservation-only. No stash may be
  applied to `main`, wholly or partially, in either track.

## Non-negotiable exclusions

No `git add -A`, `git clean`, reset, stash apply/pop, archive/worktree/branch/tag
deletion or pruning; no push, deploy, restart, production-vault/data access,
secret/transcript/MOC/knowledge inspection, Telegram, or real-provider checks.
No further `/agy` or `/orc` dispatch is needed for either track. One
user-authorized, plan-only `/agy-scout` audit was completed before this revision;
it had no archive or runtime access and its repository pre/post manifests matched.
B remains parked.

## Phase A — selective metadata closure

### A0 — re-confirm the candidate set (primary, read-only)

1. Re-run `git rev-parse main`, the NUL-delimited porcelain-v2 manifest and its
   SHA-256, and `git diff --name-status`.
2. Re-verify both preservation-only external manifests with `sha256sum --check`
   from exactly these archive roots:
   - `/home/alx/.local/share/iva/archives/main-dirty-pre-merge-20260726-fe59f527/`
   - `/home/alx/.local/share/iva/archives/nerath-core-candidate-dirty-20260726-8741baef/`
   Report pass/fail only; do not inspect extracted archive content.
3. Present the exact proposed metadata paths. The pre-plan candidate set is:
   - `.ai/SESSION_LOG.md`
   - `.ai/STATE.md`
   - `.ai/plans/iva-next-session-reconciliation-plan-20260726.md`
   - `.ai/plans/iva-post-merge-archive-plan-20260726.md`
3. This plan file was created after that manifest and is **out of scope by
   default**. Any new/unexpected path is a stop condition, not an invitation to
   broaden the commit.

### Gate A1 — exact staging scope

Obtain the user's confirmation of the exact path list from A0. Do not assume
that “metadata only” authorizes every current or later `.ai/` path.

### A2 — stage and verify (only after A1)

1. Stage each user-approved path by explicit name.
2. Show `git diff --cached --name-status` and pass `git diff --cached --check`.
3. Confirm the staged diff contains no source, lockfile, generated runtime, or
   private-data path, and that no safety/archive ref or stash moved.

### Gate A3 — final commit authorization

Ask for a separate explicit approval of the exact staged name-status and commit
message. Without it, leave the index untouched after reporting the evidence.

### A4 — close metadata commit (only after A3)

Commit exactly the approved index. Re-check `HEAD`, the remaining porcelain-v2
manifest, the safety/archive refs, all three stash entries, and both external
`SHA256SUMS` manifests. Stop and report; do not push.

## Phase C — isolated runtime dogfood, only after Phase A accepts cleanly

### C0 — isolated-runtime design proof (primary, read-only)

Before a process is launched, create a small runtime run card that proves:

1. the exact launcher command/path and configuration entrypoint, established
   without reading protected configuration or invoking the runtime;
2. a non-production port that is not `8723`;
3. isolated, disposable mock/synthetic data paths outside production vault/data;
4. no Telegram path, no real provider credential/configuration, and no service
   manager interaction; and
5. a bounded output-bearing probe plus a timeout and log destination.

The run card must use only public code/configuration shape. If its proof would
require reading `.env`, secrets, vault/data, transcripts, MOC, or knowledge,
stop: that is a new authorization boundary.

### Gate C1 — user approval of the concrete run card

Present the launcher, port, isolated paths, mock provider behavior, timeout,
expected probe output, and cleanup method. Obtain explicit approval before any
process is started. “Proceed to C” approves planning, not a real or production
runtime check.

### C2 — bounded isolated dogfood (only after C1)

Run the approved launcher against the approved isolated paths. It must neither
restart nor query `iva.service`, and it must not bind/use production port `8723`.
Capture only sanitized test logs. Stop at the first unexpected network,
credential, Telegram, production-path, or provider behavior.

### C3 — primary acceptance and stop

Verify the output-bearing probe, process exit, no production-path use, and
unchanged main/ref/stash/archive state. Report **reported, not accepted** until
the user explicitly accepts the isolated result. Do not extend to real provider,
Telegram, service restart, deployment, or live-message dogfood.

## Global stop conditions

Stop before any write/launch if `main` moves, a preservation ref/stash/archive
checksum changes or fails, the metadata scope differs from A1, or C0 cannot
prove mock isolation without protected inputs. B may be reopened only by a new
explicit decision; then—and only then—one privacy-bounded `/agy-scout` may
produce a path-level safe-slice manifest.

## Planned evidence outputs

- Phase A: exact candidate list, staged name-status, `--cached --check`, commit
  SHA (if approved), and post-commit preservation snapshot.
- Phase C: approved run card, sanitized probe log, exit status, isolation proof,
  and post-run preservation snapshot.

## `/orc` launch prompt (not to launch automatically)

```text
Execute /home/alx/projects/iva/.ai/plans/iva-a-then-c-metadata-isolated-dogfood-plan-20260726.md.
- Dispatcher only. Do not use /agy; Track B is parked.
- Do Phase A only through Gate A3 and stop for the user's final commit approval.
- After an accepted Phase A commit, do only C0 and stop for Gate C1.
- Never touch preservation objects, production paths, secrets, providers,
  Telegram, services, deployment, or real-message dogfood.
```

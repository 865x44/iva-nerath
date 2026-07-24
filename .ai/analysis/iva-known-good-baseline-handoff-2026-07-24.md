# Iva 0.3.0 known-good baseline handoff

Status: `KNOWN_GOOD_BASELINE CANDIDATE — SOURCE VERIFIED, NOT LIVE-INTEGRATED`

## Evidence contract

```text
evidence_base_sha: 6edffee7c5cc0cd726f21c666772bd63881dcd92
reviewed_at: 2026-07-24
repo_path: /home/alx/.local/share/iva/worktrees/upstream-merge-20260723T235532Z-3eecf343
scope: upstream 0.3.0 merge plus accepted local baseline ports
invalidated_by: any later production-source, dependency, lockfile, build-tool, provider-config, or baseline-branch change
```

This handoff file is the only change after the recorded code evidence base. Its
commit must receive a final clean typecheck/build/provenance check before the
baseline is tagged.

## Baseline composition

- Local recorded base: `ae5745a04a57873c20f542d0172978b0c297a63e`.
- Pinned upstream 0.3.0: `037962d8c4a3b9074baf70a4a91c62bea2e899a7`.
- Reviewed merge commit: `d70374e9d6b37b9902979001f6b8c133fa28b604`.
- Local feature branch: `feature/local-baseline`.
- Accepted local slices:
  - `6d7dda3` — OpenCode Go HTTP retry plus stream-level fallback to
    `qwen3.6-plus`, stable availability reporting, and regression tests.
  - `f0e5964` — Beerlight session-first workflow, three-card/privacy bounds,
    600-second runtime allowance, and a concrete timeout assertion.
  - `6edffee` — removal of orphaned Kimi/TUI adapters and restoration of narrow
    `.opencode/` and `.ai/*.bak-*` privacy ignores.

Upstream replaces the old Telegram `/provider` implementation with `/model` and
`/menu` model selection. The old provider switch was not ported. The broken
Blessed TUI, unverified terminal chat client, and host-specific Kimi token helper
remain recoverable in Git history but are not part of the active baseline.

Nerath, IVA-T1, and Clarity are not implemented in this baseline.

## Verification

All accepted source verification ran in the isolated worktree under Node
`v24.18.0` after deterministic `npm ci`:

- `tsgo`: PASS.
- Node test suite: 106 passed, 0 failed.
- Security defense: 45 passed, 0 failed.
- Telegram userbot guardrail: PASS.
- Autograph: 256 passed, 0 failed.
- `eve build`: PASS, linux-x64, 14.7 MB.
- `scripts/build-info.mjs`: PASS on a clean committed tree; artifact SHA was
  independently recomputed and matched.
- `git diff --check`: PASS.

Not tested: live provider calls, live Telegram reply or commands, service
restart/health, updater execution against the real checkout, deployment, or
production rollback. Those actions remain outside this baseline wave.

`npm ci` reports two high-severity dependency advisories. No automatic audit fix
was run.

## Repository and update policy

Accepted topology:

```text
origin   = private standalone repository https://github.com/865x44/iva-nerath
upstream = public source repository https://github.com/smixs/iva.git
```

`remote.pushDefault=origin`; the upstream push URL is blocked locally. GitHub
does not support making a fork of a public repository private, so the private
repository is a standalone mirror with explicit upstream reconciliation.

No refs have been pushed to the private origin. Publication requires a separate
explicit push authorization.

## Recovery and rollback

- Exact live-checkout recovery package:
  `/home/alx/.local/share/iva/backups/upstream-merge/20260723T235532Z-3eecf343`.
- Payload manifest, manifest root, `.git/info/exclude`, and exact recovery drill:
  PASS.
- The dirty live checkout remains on `main` at
  `ae5745a04a57873c20f542d0172978b0c297a63e`.
- Its canonical porcelain-v2 SHA-256 must remain
  `6e6b6369d8ec73526e2b860db664a6776fb9f89340ed45e2207c0c1894778add`
  until a separately controlled integration.
- `integration/upstream-0.3` is the rollback boundary without selective local
  ports. The final known-good tag is the rollback boundary with accepted ports.
- Do not use destructive reset, clean, or blind stash to integrate or roll back.

## Nerath entry gate

The next permitted engineering phase is a post-merge audit against the final
tagged baseline, followed by Nerath memory fixtures/firewall. Pre-merge file
maps, Eve discovery, persona/menu/rollup paths, and tool-name proofs are
historical context only and must be rediscovered.

Do not enable the Nerath voice before memory-firewall regression fixtures pass.
Do not start IVA-T1 or Clarity discovery until Nerath Core dogfood completes.

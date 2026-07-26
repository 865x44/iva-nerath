# N1b design-authority correction

Candidate root:
`/home/alx/.local/share/iva/worktrees/nerath-core-candidate-20260724T000000Z`

This is a docs-only sequential control-plane slice before N1b production work.
Do not commit. Do not edit production or tests. Do not inspect secrets, `.env`,
`data/`, `vault/`, live paths, Telegram, transcripts, services, remotes, or
network.

## Editable paths only

- `.ai/plans/iva-nerat-mvp-design.md`
- `.ai/plans/iva-sequencing-index.md`
- `.ai/analysis/nerat-n1a-worker-report.md`

## Required changes

1. Correct N1a report with exact independent evidence:
   `/usr/bin/node-24 --test --test-isolation=none tests/memory-firewall.test.ts`,
   pass 5/fail 0, and `git diff --check` PASS. Retain the mixed-trajectory note
   and prompt-only limitation.
2. Make the MVP design sufficient authority for N1b/R/V. Include every
   constitution rule: mechanism discovery only when it changes model, decision,
   or action; separation of fact/user words/inference/hypothesis/metaphor/state/
   decision; useful disagreement; explicit rejection; support for strong ideas;
   concise/literal/dry registers remain Nerath; one-turn operation+lens+relation+
   register and no persistent internal characters; no user commitment, identity
   fact, or irreversible action without legitimacy.
3. Include exact default-off/settings behavior, persona/menu containment,
   memory-firewall requirements, synthetic fixtures, replay categories/review
   matrix/kill criteria, operational/security/tool invariants, and explicit
   deferrals. This is authority and acceptance content, never merge/deploy
   commands.
4. Keep sequencing short; link rather than duplicate. State precise slice file
   ownership and gates.
5. Retain evidence base, repository path and scope. Replace meaningless `N/A`
   invalidation metadata with concrete invalidation conditions.

Return concise non-empty stdout naming the three paths changed. No shell command
is required for this docs-only slice.

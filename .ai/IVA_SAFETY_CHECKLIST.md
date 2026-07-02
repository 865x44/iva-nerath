# Iva Safety Checklist

Before applying changes:

- [ ] Current mode is `apply-approved`
- [ ] Human explicitly approved this specific patch
- [ ] Git branch is known
- [ ] Dirty state is known
- [ ] Files to modify are listed
- [ ] Patch scope is narrow
- [ ] No broad refactor
- [ ] No commit/push unless separately approved
- [ ] Rollback path is clear
- [ ] Delegated output has been reviewed

## Block immediately if

- branch is unknown;
- dirty state is unclear;
- patch affects unrelated files;
- agent is trying to "clean up" extra things;
- task scope expanded;
- user approval is ambiguous;
- source of truth conflicts with cockpit;
- delegated output is being treated as authoritative.

If any "Block immediately if" condition is true, set `.ai/IVA_COCKPIT.md` `MODE: blocked` and
record why under `Pending User Decisions` before doing anything else.

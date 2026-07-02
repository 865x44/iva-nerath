# Iva Delegation Ledger

Tracks work delegated by the OpenCode/Iva operator to other agents (Antigravity/`/agy`, or
others). This ledger is append-only history + a live table of what's currently in flight.

## Active Delegations

| ID | Agent | Mode | Task | Started | Status | Output path | Review status |
|----|-------|------|------|---------|--------|-------------|----------------|

## Completed Delegations

| ID | Agent | Task | Result | Accepted? | Notes |
|----|-------|------|--------|-----------|-------|

## Delegation Rules

- Every delegated task must have a bounded input packet (explicit scope, explicit inspect paths,
  explicit constraints) — no open-ended "figure it out" briefs.
- Delegated workers may scout, draft, code, or review only inside the task boundary given to them.
- Delegated output must be reviewed by a human or by Iva-in-`review`-mode before use.
- Delegated output must not update `.ai/STATE.md` directly.
- Delegated output must not be applied to project code without explicit approval
  (`apply-approved` mode, per `IVA_MODE_ROUTER.md`).
- Every row added to this ledger should get a short unique ID (e.g. date-based, `20260701-01`) so
  it can be cross-referenced from `IVA_COCKPIT.md`'s `## Delegations` table.

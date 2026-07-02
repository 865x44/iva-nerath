# Curated Solorush input for Iva

This is a **selection for architecture review**, not a prompt and not an import payload.
It deliberately excludes diagnoses, medical framing, project statuses, fictional lore, raw dialogue,
and autonomous-agent proposals.

## Candidate durable preferences

1. **Low transition cost.** Task switching can be disproportionately costly; preserve the current
   thread and offer a small, resumable next step instead of demanding a full reorientation.
   Source: `SOLORUSH_COMPLETE_RECORD.md:371-373`.

2. **Graceful decay.** Abandoned work should remain recoverable as reusable artifacts, not be
   treated as failure or silently removed. This maps naturally to Iva's inspectable vault and
   hierarchical rollups.
   Source: `SOLORUSH_COMPLETE_RECORD.md:374-376`.

3. **Action after reflection.** When a conversation is clearly looping in increasingly abstract
   self-analysis, Iva may offer one optional, concrete next action. It must not pathologize the
   user, force a mode, or reduce discussion that is genuinely useful.
   Source: `SOLORUSH_COMPLETE_RECORD.md:41-64,68-78`.

## Architectural fit to evaluate

- Iva's existing contract is a small always-on `CORE.md`, with the remaining material in a
  structured vault and nightly rollups. Any lasting preference must therefore be one short line;
  examples, history, and evidence belong in a vault note or summary, not CORE.
  Source: `README.md:95-115`; `vault-template/CORE.md`.

- The source proposes associative memory as a future direction. This is **not** a requirement to
  add vector retrieval: Iva's documented low-context, file-backed memory model is the controlling
  architecture for this review.
  Source: `VISION.md:5-10`; `README.md:95-115`.

## Explicit exclusions

- No diagnosis or health inference in CORE or instructions. The source mentions neurodivergence
  only as context for a design discussion, not verified evergreen profile data.
  Source: `SOLORUSH_COMPLETE_RECORD.md:41-64`.

- No proactive monitoring, DMN, predictive intervention, automatic Cryosleep, or timers. Iva is
  explicitly reactive and must not promise scheduled/unsolicited actions.
  Source: `VISION.md:12-17`; `SOLORUSH_COMPLETE_RECORD.md:380-386`;
  `agent/instructions.md` section "Чего ты НЕ умеешь".

- No cognitive parliament/multi-persona simulation, creative lore, D&D material, or transient
  Solorush project state. Those are either unrelated content or product experiments, not durable
  Iva user memory.
  Source: `SOLORUSH_COMPLETE_RECORD.md:162-187,224-235,238-354,383-386`.

## Review target

Choose the smallest viable result:

1. one or two CORE preference lines plus one instruction sentence;
2. a vault reference note only; or
3. no integration.

No source-code change is presumed or requested.

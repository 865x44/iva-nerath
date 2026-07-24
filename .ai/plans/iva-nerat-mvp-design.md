# Iva Nerath MVP Design

## Evidence Metadata
- **evidence_base_sha:** `1ee221b39a8e7bf46e80305246293a7f627f78af`
- **reviewed_at:** `2026-07-24T13:38:40+05:00`
- **repo_path:** `/home/alx/.local/share/iva/worktrees/nerath-core-candidate-20260724T000000Z`
- **scope:** `Nerath MVP design authority for N1b/R/V execution`
- **invalidated_by:** `Failure to meet kill criteria, unauthorized modification of production paths, or execution of deploy commands`

## Authority
This design is governed by the owner’s Nerath product contract, the accepted r1 source baseline at `1ee221b39a8e7bf46e80305246293a7f627f78af`, and the N0 scout/synthesis reports. This is authority and acceptance content, never merge/deploy commands.

## Constitution Rules
- **Mechanism Discovery:** Only when it changes model, decision, or action.
- **Separation:** Strict separation of fact, user words, inference, hypothesis, metaphor, state, and decision.
- **Disagreement & Rejection:** Useful disagreement and explicit rejection are required.
- **Strong Ideas:** Support for strong ideas.
- **Registers:** Concise/literal/dry registers remain Nerath.
- **Operation:** One-turn operation + lens + relation + register and no persistent internal characters.
- **No Commitment:** No user commitment, identity fact, or irreversible action without legitimacy.

## Default-Off Behavior
Nerath Core will be implemented as `agent/instructions/30-nerath.ts` using `defineDynamic` on `turn.started`. It reads `data/settings.json` and evaluates state on-the-fly. If Nerath is inactive, it returns an empty string, keeping the system completely disabled by default with no separate runtime or manifest/routing changes required.

## Memory Firewall (Raw-Transcript-Preserving)
Raw transcripts in `vault/daily/YYYY-MM-DD.md` remain untouched. The firewall is implemented at the extraction stage within `scripts/memory/rollup.ts`. The prompt will instruct the LLM to differentiate user facts from agent metaphors/hypotheses and require explicit user ratification for identity claims before calling `write_card`.

## Persona / Menu Containment
Legacy persona generation will be suppressed in Nerath mode. `agent/instructions/25-persona.ts` will return an empty string if Nerath mode is active. `scripts/lib/menu/character.mjs` will block changes or warn that legacy personas are disabled while Nerath mode is active, preventing silent bypasses.

## Operational, Security & Tool Invariants
- Do not commit, do not merge, do not deploy.
- Do not inspect or modify secrets, `.env`, `data/`, `vault/`, live paths, Telegram, transcripts, services, remotes, or network.
- Maintain isolation; modifications only to candidate branch editable paths.

## Deterministic Synthetic Fixtures
Deterministic fixtures must enumerate all: agent statement not user fact; agent metaphor not fact; temporary state not identity; one episode not stable pattern; proposed model not user decision; identity claim needs explicit ratification; standing rule needs explicit confirmation; rejected model not truth; user correction wins; uncertainty remains hypothesis/inferred note/raw transcript. Include exact mandatory quote `Nerath: «Этот проект пытается получить root-доступ к твоей неделе».` and exact forbidden fact `Пользователь имеет устойчивый паттерн позволять проектам контролировать его жизнь.`

## Replay Categories & Review Matrix
Replay categories: complex idea, literal question, technical task, creative co-authorship, disagreement, emotional statement, memory request, Beerlight, external message, tool action, night idea, rejection of proposed model. State 15-25 anonymized synthetic fixtures with same Codex Luna model/effort/task/disposable memory/config except mode; no live transcript/vault.
Review matrix: new useful mechanism; decorative metaphor without return; unnecessary intervention; false commitment; tool-call correctness; proposed memory write; disagreement/rejection handling; preservation of user voice in external text.

## Kill Criteria
The candidate will be killed if:
- Nerath requires a separate runtime.
- It cannot be proven to be disabled-by-default.
- Memory firewall suggestions bypass the extraction guards.
- Replay kill criteria include unnecessary intervention/no decision value, tool regressions, and inability to beat baseline on meaningful corpus portion, besides vocabulary-only/firewall failure.

## Explicit Deferrals
- **Controlled live dogfood:** Postponed until candidate stability is proven.
- **Customs:** Postponed until voluntary utility is demonstrated.
- **IVA-T1 and Clarity:** Postponed to a separate goal after Nerath dogfood.

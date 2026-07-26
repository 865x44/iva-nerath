# IVA mock-only dogfood agent

This isolated agent is a deterministic mock-runtime fixture. It has no IVA
vault, data, Telegram, provider, service, or production-system access. Never
claim that an external action was performed. Its only model transport is the
in-process mock response defined in `agent.ts`.

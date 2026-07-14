import { describe, it } from "node:test";
import assert from "node:assert/strict";

// =============================================================================
// Pin tests for provider routing in agent/agent.ts
//
// Each test uses a unique cache-busting query string so dynamic import creates
// a fresh module instance. process.env is mutated BEFORE each import to
// control what agent.ts reads at module load time.
// =============================================================================

describe("agent provider routing", () => {
  // ---------------------------------------------------------------------------
  // Pin 1: MODEL_PROVIDER unset → provider 'ollama' (default)
  // ---------------------------------------------------------------------------
  it("selects ollama when MODEL_PROVIDER is unset", async () => {
    delete process.env.MODEL_PROVIDER;
    delete process.env.OLLAMA_MODEL;
    delete process.env.OLLAMA_CONTEXT_WINDOW;

    const { default: agent } = await import(
      "../agent/agent.ts?case=pin1-defaults-to-ollama"
    );

    assert.equal(agent.model.modelId, "deepseek-v4-pro");
    assert.equal(agent.modelContextWindowTokens, 131072);
    assert.deepEqual(agent.compaction, { thresholdPercent: 0.7 });
  });

  // ---------------------------------------------------------------------------
  // Pin 2: MODEL_PROVIDER set to an unknown value → falls back to PROVIDERS.ollama
  // ---------------------------------------------------------------------------
  it("falls back to ollama for unknown MODEL_PROVIDER", async () => {
    process.env.MODEL_PROVIDER = "__nonexistent_provider__";
    delete process.env.OLLAMA_MODEL;
    delete process.env.OLLAMA_CONTEXT_WINDOW;

    const { default: agent } = await import(
      "../agent/agent.ts?case=pin2-unknown-provider-fallback"
    );

    assert.equal(agent.model.modelId, "deepseek-v4-pro");
    assert.equal(agent.modelContextWindowTokens, 131072);
  });

  // ---------------------------------------------------------------------------
  // Pin 3: Gemini entry defaults (baseURL, model, window) and env overrides
  // ---------------------------------------------------------------------------
  it("uses gemini defaults when MODEL_PROVIDER=gemini", async () => {
    process.env.MODEL_PROVIDER = "gemini";
    delete process.env.GEMINI_MODEL;
    delete process.env.GEMINI_CONTEXT_WINDOW;

    const { default: agent, PROVIDERS } = await import(
      "../agent/agent.ts?case=pin3a-gemini-defaults"
    );

    // Default model and window
    assert.equal(agent.model.modelId, "gemini-2.5-flash");
    assert.equal(agent.modelContextWindowTokens, 1048576);

    // BaseURL stored in PROVIDERS entry
    assert.equal(
      PROVIDERS.gemini.baseURL,
      "https://generativelanguage.googleapis.com/v1beta/openai/",
    );

    // Default model in PROVIDERS matches
    assert.equal(PROVIDERS.gemini.model, "gemini-2.5-flash");
    assert.equal(PROVIDERS.gemini.window, 1048576);
  });

  it("honors GEMINI_MODEL and GEMINI_CONTEXT_WINDOW overrides", async () => {
    process.env.MODEL_PROVIDER = "gemini";
    process.env.GEMINI_MODEL = "gemini-2.0-pro";
    process.env.GEMINI_CONTEXT_WINDOW = "2097152";

    const { default: agent, PROVIDERS } = await import(
      "../agent/agent.ts?case=pin3b-gemini-overrides"
    );

    assert.equal(agent.model.modelId, "gemini-2.0-pro");
    assert.equal(agent.modelContextWindowTokens, 2097152);

    assert.equal(PROVIDERS.gemini.model, "gemini-2.0-pro");
    assert.equal(PROVIDERS.gemini.window, 2097152);
  });

  // ---------------------------------------------------------------------------
  // Pin 4: OpenCode strips the "opencode-go/" prefix
  // ---------------------------------------------------------------------------
  it("strips opencode-go/ prefix from OPENCODE_MODEL", async () => {
    process.env.MODEL_PROVIDER = "opencode";
    process.env.OPENCODE_MODEL = "opencode-go/custom-model";
    process.env.OPENCODE_CONTEXT_WINDOW = "65536";

    const { default: agent, PROVIDERS } = await import(
      "../agent/agent.ts?case=pin4a-opencode-strip-env"
    );

    assert.equal(agent.model.modelId, "custom-model");
    assert.equal(agent.modelContextWindowTokens, 65536);
    assert.equal(PROVIDERS.opencode.model, "custom-model");
  });

  it("strips opencode-go/ prefix from default model", async () => {
    process.env.MODEL_PROVIDER = "opencode";
    delete process.env.OPENCODE_MODEL;
    delete process.env.OPENCODE_CONTEXT_WINDOW;

    const { default: agent } = await import(
      "../agent/agent.ts?case=pin4b-opencode-strip-default"
    );

    assert.equal(agent.model.modelId, "deepseek-v4-pro");
    assert.equal(agent.modelContextWindowTokens, 131072);
  });

  it("strips opencode-go/ prefix from PROVIDERS entry", async () => {
    // Verify the PROVIDERS entry itself also has the stripped value
    process.env.MODEL_PROVIDER = "opencode";
    process.env.OPENCODE_MODEL = "opencode-go/another-model";

    const { PROVIDERS } = await import(
      "../agent/agent.ts?case=pin4c-opencode-providers-entry"
    );

    assert.equal(PROVIDERS.opencode.model, "another-model");
  });

  // ---------------------------------------------------------------------------
  // Pin 5: Kimi default model and context window
  // ---------------------------------------------------------------------------
  it("uses kimi defaults when MODEL_PROVIDER=kimi", async () => {
    process.env.MODEL_PROVIDER = "kimi";
    delete process.env.KIMI_MODEL;
    delete process.env.KIMI_CONTEXT_WINDOW;

    const { default: agent, PROVIDERS } = await import(
      "../agent/agent.ts?case=pin5-kimi-defaults"
    );

    assert.equal(agent.model.modelId, "kimi-for-coding");
    assert.equal(agent.modelContextWindowTokens, 262144);

    assert.equal(PROVIDERS.kimi.model, "kimi-for-coding");
    assert.equal(PROVIDERS.kimi.window, 262144);
  });

  // ---------------------------------------------------------------------------
  // Pin 6: compaction.thresholdPercent always 0.7
  // ---------------------------------------------------------------------------
  it("always sets compaction thresholdPercent to 0.7", async () => {
    const providers = ["ollama", "gemini", "opencode", "kimi", "openai"];
    for (const p of providers) {
      process.env.MODEL_PROVIDER = p;
      // Clear provider-specific env so we get defaults
      const providerKey = p.toUpperCase();
      delete process.env[`${providerKey}_MODEL`];
      delete process.env[`${providerKey}_CONTEXT_WINDOW`];

      const { default: agent } = await import(
        `../agent/agent.ts?case=pin6-compaction-${p}`
      );

      assert.deepEqual(
        agent.compaction,
        { thresholdPercent: 0.7 },
        `compaction mismatch for provider "${p}"`,
      );
    }
  });
});

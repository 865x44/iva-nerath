import { describe, it } from "node:test";
import assert from "node:assert/strict";

const PROVIDER_ENV_KEYS = [
  "MODEL_PROVIDER",
  "OLLAMA_MODEL",
  "OLLAMA_CONTEXT_WINDOW",
  "OPENCODE_MODEL",
  "OPENCODE_CONTEXT_WINDOW",
  "OPENCODE_FALLBACK_MODEL",
  "OPENCODE_VISION_MODEL",
  "OPENROUTER_MODEL",
  "OPENROUTER_CONTEXT_WINDOW",
  "CODEX_MODEL",
  "CODEX_CONTEXT_WINDOW",
  "THINKING_EFFORT",
] as const;

function clearProviderEnv() {
  for (const key of PROVIDER_ENV_KEYS) delete process.env[key];
}

async function importProvider(caseName: string) {
  return import(`../agent/provider.ts?case=${caseName}`);
}

describe("upstream provider routing", () => {
  it("defaults to ollama", async () => {
    clearProviderEnv();

    const { providerName, providerConfig } = await importProvider("default-ollama");

    assert.equal(providerName, "ollama");
    assert.equal(providerConfig.baseURL, "https://ollama.com/v1");
    assert.equal(providerConfig.textModel, "deepseek-v4-pro");
    assert.equal(providerConfig.contextWindow, 131072);
  });

  it("falls back to ollama config for an unknown provider", async () => {
    clearProviderEnv();
    process.env.MODEL_PROVIDER = "__unknown__";

    const { providerName, providerConfig } = await importProvider("unknown-fallback");

    assert.equal(providerName, "__unknown__");
    assert.equal(providerConfig.baseURL, "https://ollama.com/v1");
    assert.equal(providerConfig.textModel, "deepseek-v4-pro");
    assert.equal(providerConfig.contextWindow, 131072);
  });

  it("uses opencode defaults and strips the opencode-go prefix", async () => {
    clearProviderEnv();
    process.env.MODEL_PROVIDER = "opencode";
    process.env.OPENCODE_MODEL = "opencode-go/custom-model";
    process.env.OPENCODE_CONTEXT_WINDOW = "65536";

    const { providerName, providerConfig } = await importProvider("opencode-prefix");

    assert.equal(providerName, "opencode");
    assert.equal(providerConfig.baseURL, "https://opencode.ai/zen/go/v1");
    assert.equal(providerConfig.textModel, "custom-model");
    assert.equal(providerConfig.contextWindow, 65536);
    assert.equal(providerConfig.fallbackModel, "glm-5.2");
    assert.equal(providerConfig.visionModel, undefined);
  });

  it("accepts only explicit OpenCode fallback and vision overrides", async () => {
    clearProviderEnv();
    process.env.MODEL_PROVIDER = "opencode";
    process.env.OPENCODE_FALLBACK_MODEL = "opencode-go/glm-5.1";
    process.env.OPENCODE_VISION_MODEL = "opencode-go/catalog-vision";

    const { providerConfig } = await importProvider("opencode-overrides");

    assert.equal(providerConfig.fallbackModel, "glm-5.1");
    assert.equal(providerConfig.visionModel, "catalog-vision");
  });

  it("uses openrouter overrides", async () => {
    clearProviderEnv();
    process.env.MODEL_PROVIDER = "openrouter";
    process.env.OPENROUTER_MODEL = "anthropic/claude-sonnet-4.5";
    process.env.OPENROUTER_CONTEXT_WINDOW = "200000";

    const { providerName, providerConfig } = await importProvider("openrouter-overrides");

    assert.equal(providerName, "openrouter");
    assert.equal(providerConfig.baseURL, "https://openrouter.ai/api/v1");
    assert.equal(providerConfig.textModel, "anthropic/claude-sonnet-4.5");
    assert.equal(providerConfig.contextWindow, 200000);
  });

  it("uses codex defaults without requiring a static API key", async () => {
    clearProviderEnv();
    process.env.MODEL_PROVIDER = "codex";

    const { providerName, providerConfig } = await importProvider("codex-defaults");

    assert.equal(providerName, "codex");
    assert.equal(providerConfig.apiKey, undefined);
    assert.equal(providerConfig.textModel, "gpt-5.5");
    assert.equal(providerConfig.contextWindow, 272000);
  });

  it("accepts only catalogued thinking effort values", async () => {
    clearProviderEnv();
    process.env.THINKING_EFFORT = "HIGH";
    const accepted = await importProvider("thinking-accepted");
    assert.equal(accepted.thinkingEffort, "high");

    process.env.THINKING_EFFORT = "impossible";
    const rejected = await importProvider("thinking-rejected");
    assert.equal(rejected.thinkingEffort, undefined);
  });

  it("keeps early compaction on the assembled agent", async () => {
    clearProviderEnv();
    const { default: agent } = await import("../agent/agent.ts?case=compaction");
    assert.deepEqual(agent.compaction, { thresholdPercent: 0.7 });
  });

  it("never routes the Anthropic-protocol qwen fallback through chat/completions", async () => {
    const { readFile } = await import("node:fs/promises");
    const source = await readFile(
      new URL("../agent/provider.ts", import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(source, /fallbackModel:[^\n]*qwen3\.6-plus/);
    assert.match(source, /fallbackModel:[\s\S]*?"glm-5\.2"/);
  });
});

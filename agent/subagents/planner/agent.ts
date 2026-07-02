import { defineAgent } from "eve";
import { z } from "zod";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { kimiFetch } from "../../kimi-helper.js";

const PROVIDER = process.env.MODEL_PROVIDER ?? "ollama";

const PROVIDERS: Record<string, { baseURL: string; apiKey: string | undefined; model: string; window: number }> = {
  ollama: {
    baseURL: "https://ollama.com/v1",
    apiKey: process.env.OLLAMA_API_KEY,
    model: process.env.OLLAMA_MODEL ?? "deepseek-v4-pro",
    window: Number(process.env.OLLAMA_CONTEXT_WINDOW ?? 131072),
  },
  opencode: {
    baseURL: "https://opencode.ai/zen/go/v1",
    apiKey: process.env.OPENCODE_API_KEY,
    model: (process.env.OPENCODE_MODEL ?? "deepseek-v4-pro").replace(/^opencode-go\//, ""),
    window: Number(process.env.OPENCODE_CONTEXT_WINDOW ?? 131072),
  },
  kimi: {
    baseURL: "https://api.kimi.com/coding/v1",
    apiKey: process.env.KIMI_API_KEY,
    model: process.env.KIMI_MODEL ?? "kimi-for-coding",
    window: Number(process.env.KIMI_CONTEXT_WINDOW ?? 262144),
  },
  gemini: {
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
    window: Number(process.env.GEMINI_CONTEXT_WINDOW ?? 1048576),
  },
  openai: {
    baseURL: "https://api.openai.com/v1",
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL ?? "gpt-5-codex",
    window: Number(process.env.OPENAI_CONTEXT_WINDOW ?? 400000),
  },
};

const cfg = PROVIDERS[PROVIDER] ?? PROVIDERS.ollama;

const provider = createOpenAICompatible({
  name: `iva-planner-${PROVIDER}`,
  baseURL: cfg.baseURL,
  apiKey: cfg.apiKey,
  includeUsage: true,
  fetch: PROVIDER === "kimi" ? kimiFetch : undefined,
});

const MODEL = cfg.model;
const CONTEXT_WINDOW = cfg.window;

export default defineAgent({
  description:
    "Разбивает крупную цель пользователя на конкретные выполнимые шаги. " +
    "Делегируй сюда, когда задача большая и её нужно декомпозировать на план.",
  model: provider(MODEL),
  modelContextWindowTokens: CONTEXT_WINDOW,
  // Task-mode: при делегировании возвращает структурированный план.
  outputSchema: z.object({
    goal: z.string(),
    steps: z.array(
      z.object({
        title: z.string(),
        detail: z.string(),
        priority: z.enum(["low", "med", "high"]),
      }),
    ),
  }),
});

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { defineAgent } from "eve";

const MOCK_BASE_URL = "http://iva-mock.invalid/v1";
const MOCK_COMPLETIONS_URL = `${MOCK_BASE_URL}/chat/completions`;

function requestedUrl(input: RequestInfo | URL): string {
  if (input instanceof Request) return input.url;
  if (input instanceof URL) return input.href;
  return input;
}

export const mockFetch: typeof fetch = async (input, init) => {
  const url = requestedUrl(input);
  if (url !== MOCK_COMPLETIONS_URL) {
    throw new Error(`Mock-only agent rejected unexpected fetch URL: ${url}`);
  }

  const request = input instanceof Request ? input : null;
  const requestBody =
    typeof init?.body === "string"
      ? init.body
      : request === null
        ? ""
        : await request.clone().text();
  const isStreamingRequest = (() => {
    try {
      return JSON.parse(requestBody).stream === true;
    } catch {
      return false;
    }
  })();

  if (isStreamingRequest) {
    const event = (payload: object) => `data: ${JSON.stringify(payload)}\n\n`;
    return new Response(
      [
        event({
          id: "chatcmpl-iva-mock",
          object: "chat.completion.chunk",
          created: 0,
          model: "iva-mock-model",
          choices: [{ index: 0, delta: { role: "assistant", content: "IVA mock-only response" }, finish_reason: null }],
        }),
        event({
          id: "chatcmpl-iva-mock",
          object: "chat.completion.chunk",
          created: 0,
          model: "iva-mock-model",
          choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
        }),
        "data: [DONE]\n\n",
      ].join(""),
      { headers: { "content-type": "text/event-stream; charset=utf-8" }, status: 200 },
    );
  }

  return new Response(
    JSON.stringify({
      id: "chatcmpl-iva-mock",
      object: "chat.completion",
      created: 0,
      model: "iva-mock-model",
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: "IVA mock-only response" },
          finish_reason: "stop",
        },
      ],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    }),
    { headers: { "content-type": "application/json" }, status: 200 },
  );
};

const mockProvider = createOpenAICompatible({
  name: "iva-mock-only",
  baseURL: MOCK_BASE_URL,
  apiKey: "iva-mock-only-not-a-credential",
  fetch: mockFetch,
});

export const mockModel = mockProvider("iva-mock-model");

export default defineAgent({
  model: mockModel,
  modelContextWindowTokens: 8192,
});

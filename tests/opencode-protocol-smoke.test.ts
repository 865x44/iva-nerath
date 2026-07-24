import test from "node:test";
import assert from "node:assert/strict";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { once } from "node:events";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";
import { opencodeFetch } from "../agent/opencode-fetch.js";
import { withOpenCodeStreamFallback } from "../agent/opencode-stream-fallback.js";
import { describeImageWithConfig } from "../agent/vision.js";

async function jsonBody(request: IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendStream(response: ServerResponse, model: string, text: string) {
  response.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-cache",
  });
  const common = {
    id: "iva-r1-smoke",
    object: "chat.completion.chunk",
    created: 1,
    model,
  };
  response.write(
    `data: ${JSON.stringify({
      ...common,
      choices: [
        { index: 0, delta: { role: "assistant", content: text }, finish_reason: null },
      ],
    })}\n\n`,
  );
  response.write(
    `data: ${JSON.stringify({
      ...common,
      choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
    })}\n\n`,
  );
  response.end("data: [DONE]\n\n");
}

async function withServer(
  handler: (request: IncomingMessage, response: ServerResponse) => void,
  run: (baseURL: string) => Promise<void>,
) {
  const server = createServer(handler);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert(address && typeof address === "object");
  try {
    await run(`http://127.0.0.1:${address.port}/v1`);
  } finally {
    server.close();
    await once(server, "close");
  }
}

test("real OpenAI-compatible client retries primary then streams through glm fallback", async () => {
  const models: string[] = [];
  await withServer(
    async (request, response) => {
      const body = await jsonBody(request);
      models.push(body.model);
      if (body.model === "deepseek-v4-pro") {
        response.writeHead(503, { "content-type": "application/json" });
        response.end('{"error":{"message":"temporary upstream failure"}}');
        return;
      }
      sendStream(response, body.model, "fallback-ok");
    },
    async (baseURL) => {
      const provider = createOpenAICompatible({
        name: "iva-r1-local-smoke",
        baseURL,
        apiKey: "local-smoke-only",
        fetch: opencodeFetch,
      });
      const model = withOpenCodeStreamFallback(
        provider("deepseek-v4-pro"),
        provider("glm-5.2"),
        "glm-5.2",
      );
      const result = streamText({ model, prompt: "protocol smoke" });
      assert.equal(await result.text, "fallback-ok");
    },
  );
  assert.deepEqual(models, [
    "deepseek-v4-pro",
    "deepseek-v4-pro",
    "deepseek-v4-pro",
    "glm-5.2",
  ]);
});

test("real OpenAI-compatible request cancellation is terminal", async () => {
  let requests = 0;
  await withServer(
    async (request, response) => {
      await jsonBody(request);
      requests++;
      setTimeout(() => {
        if (!response.destroyed) sendStream(response, "deepseek-v4-pro", "late");
      }, 250);
    },
    async (baseURL) => {
      const provider = createOpenAICompatible({
        name: "iva-r1-cancel-smoke",
        baseURL,
        apiKey: "local-smoke-only",
        fetch: opencodeFetch,
      });
      const controller = new AbortController();
      const result = streamText({
        model: provider("deepseek-v4-pro"),
        prompt: "cancel smoke",
        abortSignal: controller.signal,
      });
      setTimeout(
        () => controller.abort(new DOMException("cancel smoke", "AbortError")),
        20,
      );
      await assert.rejects(result.text, { name: "AbortError" });
    },
  );
  assert.equal(requests, 1);
});

test("vision override sends image_url through the real local HTTP boundary", async () => {
  let body: any;
  await withServer(
    async (request, response) => {
      body = await jsonBody(request);
      response.writeHead(200, { "content-type": "application/json" });
      response.end(
        JSON.stringify({
          choices: [{ message: { content: "vision-ok" } }],
        }),
      );
    },
    async (baseURL) => {
      const text = await describeImageWithConfig(
        new Uint8Array([1, 2, 3]).buffer,
        "image/png",
        "opencode",
        { baseURL, apiKey: "local-smoke-only", visionModel: "catalog-vision" },
      );
      assert.equal(text, "vision-ok");
    },
  );
  assert.equal(body.model, "catalog-vision");
  assert.equal(
    body.messages[0].content[1].image_url.url,
    "data:image/png;base64,AQID",
  );
});

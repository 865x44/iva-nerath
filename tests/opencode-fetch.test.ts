import test from "node:test";
import assert from "node:assert/strict";
import { createOpencodeFetch } from "../agent/opencode-fetch.js";

const fastSleep = async () => {};

test("503 then 200 retries primary and preserves request payload", async () => {
  let callCount = 0;
  let receivedBody = "";
  const mockFetch: typeof fetch = async (input) => {
    callCount++;
    receivedBody = input instanceof Request ? await input.clone().text() : "";
    if (callCount === 1) {
      return new Response("Service Unavailable", {
        status: 503,
        headers: { "retry-after": "0" },
      });
    }
    return new Response('{"success":true}', { status: 200 });
  };

  const originalBody = JSON.stringify({
    model: "deepseek-v4-flash",
    stream: true,
    stream_options: { include_usage: true },
  });
  const response = await createOpencodeFetch(mockFetch, fastSleep)(
    "https://opencode.ai/zen/go/v1/chat/completions",
    { method: "POST", body: originalBody },
  );

  assert.equal(callCount, 2);
  assert.equal(response.status, 200);
  assert.equal(receivedBody, originalBody);
});

test("exhausted recoverable failures use exactly one qwen fallback", async () => {
  let callCount = 0;
  let lastBody = "";
  const mockFetch: typeof fetch = async (input) => {
    callCount++;
    lastBody = input instanceof Request ? await input.clone().text() : "";
    return callCount <= 3
      ? new Response("Bad Gateway", {
          status: 502,
          headers: { "retry-after": "0" },
        })
      : new Response("Fallback success", { status: 200 });
  };

  const response = await createOpencodeFetch(mockFetch, fastSleep)(
    "https://opencode.ai/zen/go/v1/chat/completions",
    {
      method: "POST",
      body: JSON.stringify({
        model: "deepseek-v4-flash",
        stream: true,
        stream_options: { include_usage: true },
      }),
    },
  );

  assert.equal(callCount, 4);
  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(lastBody), {
    model: "qwen3.6-plus",
    stream: true,
    stream_options: { include_usage: true },
  });
});

test("non-recoverable 400 does not retry or fall back", async () => {
  let callCount = 0;
  const mockFetch: typeof fetch = async () => {
    callCount++;
    return new Response("Bad Request", { status: 400 });
  };

  const response = await createOpencodeFetch(mockFetch, fastSleep)(
    "https://example.com",
    {
      method: "POST",
      body: JSON.stringify({ model: "deepseek-v4-flash" }),
    },
  );

  assert.equal(callCount, 1);
  assert.equal(response.status, 400);
});

test("only the opencode provider receives the fetch wrapper", async () => {
  const { readFile } = await import("node:fs/promises");
  const agentSource = await readFile(
    new URL("../agent/agent.ts", import.meta.url),
    "utf8",
  );
  assert.match(
    agentSource,
    /fetch: providerName === "opencode" \? opencodeFetch : undefined/,
  );
});

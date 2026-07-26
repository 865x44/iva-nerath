import test from "node:test";
import assert from "node:assert/strict";
import {
  createOpencodeFetch,
  OpenCodeRetryExhaustedError,
  type OpencodeSleep,
} from "../agent/opencode-fetch.js";

const fastSleep: OpencodeSleep = async () => {};

test("503 then 200 retries the same model and preserves payload", async () => {
  let callCount = 0;
  const bodies: string[] = [];
  const mockFetch: typeof fetch = async (input) => {
    callCount++;
    bodies.push(input instanceof Request ? await input.clone().text() : "");
    return callCount === 1
      ? new Response("Service Unavailable", {
          status: 503,
          headers: { "retry-after": "0" },
        })
      : new Response('{"success":true}', { status: 200 });
  };
  const originalBody = JSON.stringify({
    model: "deepseek-v4-pro",
    stream: true,
    stream_options: { include_usage: true },
  });

  const response = await createOpencodeFetch(mockFetch, fastSleep)(
    "https://opencode.ai/zen/go/v1/chat/completions",
    { method: "POST", body: originalBody },
  );

  assert.equal(response.status, 200);
  assert.equal(callCount, 2);
  assert.deepEqual(bodies, [originalBody, originalBody]);
});

test("exhausted recoverable failures throw without mutating the model", async () => {
  let callCount = 0;
  const bodies: string[] = [];
  const mockFetch: typeof fetch = async (input) => {
    callCount++;
    bodies.push(input instanceof Request ? await input.clone().text() : "");
    return new Response("Bad Gateway", { status: 502 });
  };
  const body = JSON.stringify({ model: "deepseek-v4-pro", stream: true });

  await assert.rejects(
    createOpencodeFetch(mockFetch, fastSleep)("https://example.com", {
      method: "POST",
      body,
    }),
    (error) =>
      error instanceof OpenCodeRetryExhaustedError &&
      error.model === "deepseek-v4-pro" &&
      error.status === 502,
  );
  assert.equal(callCount, 3);
  assert.deepEqual(bodies, [body, body, body]);
});

test("non-recoverable 400 is returned without retry", async () => {
  let callCount = 0;
  const mockFetch: typeof fetch = async () => {
    callCount++;
    return new Response("Bad Request", { status: 400 });
  };

  const response = await createOpencodeFetch(mockFetch, fastSleep)(
    "https://example.com",
    {
      method: "POST",
      body: JSON.stringify({ model: "deepseek-v4-pro" }),
    },
  );

  assert.equal(callCount, 1);
  assert.equal(response.status, 400);
});

test("preserves the caller AbortSignal in every retry attempt", async () => {
  const controller = new AbortController();
  const seenSignals: Array<AbortSignal | null | undefined> = [];
  const mockFetch: typeof fetch = async (input, init) => {
    seenSignals.push(init?.signal);
    assert.equal(input instanceof Request, true);
    return seenSignals.length === 1
      ? new Response("retry", { status: 503 })
      : new Response("ok", { status: 200 });
  };

  await createOpencodeFetch(mockFetch, fastSleep)("https://example.com", {
    method: "POST",
    body: JSON.stringify({ model: "deepseek-v4-pro" }),
    signal: controller.signal,
  });

  assert.deepEqual(seenSignals, [controller.signal, controller.signal]);
});

test("abort during fetch is terminal and starts no retry", async () => {
  const controller = new AbortController();
  let callCount = 0;
  const mockFetch: typeof fetch = async (_input, init) => {
    callCount++;
    controller.abort(new DOMException("stop", "AbortError"));
    throw init?.signal?.reason;
  };

  await assert.rejects(
    createOpencodeFetch(mockFetch, fastSleep)("https://example.com", {
      method: "POST",
      body: JSON.stringify({ model: "deepseek-v4-pro" }),
      signal: controller.signal,
    }),
    { name: "AbortError" },
  );
  assert.equal(callCount, 1);
});

test("abort during backoff cancels sleep and starts no next attempt", async () => {
  const controller = new AbortController();
  let callCount = 0;
  const mockFetch: typeof fetch = async () => {
    callCount++;
    return new Response("retry", { status: 503 });
  };
  const abortingSleep: OpencodeSleep = async (_milliseconds, signal) => {
    controller.abort(new DOMException("stop", "AbortError"));
    throw signal?.reason;
  };

  await assert.rejects(
    createOpencodeFetch(mockFetch, abortingSleep)("https://example.com", {
      method: "POST",
      body: JSON.stringify({ model: "deepseek-v4-pro" }),
      signal: controller.signal,
    }),
    { name: "AbortError" },
  );
  assert.equal(callCount, 1);
});

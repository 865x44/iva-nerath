import test from "node:test";
import assert from "node:assert/strict";
import {
  withOpenCodeStreamFallback,
  isOpenCodeRetryableError,
} from "../agent/opencode-stream-fallback.js";
import { OpenCodeRetryExhaustedError } from "../agent/opencode-fetch.js";

test("replays a transient primary stream failure once through glm-5.2", async () => {
  const calls: string[] = [];
  const options = { prompt: "request" };
  const primary = {
    async doStream(received: typeof options) {
      calls.push(`primary:${received.prompt}`);
      throw new Error(
        "AI_APICallError: Error from provider (Console Go): Upstream request failed",
      );
    },
  };
  const fallback = {
    async doStream(received: typeof options) {
      calls.push(`fallback:${received.prompt}`);
      return { ok: true };
    },
  };

  const model = withOpenCodeStreamFallback(primary, fallback, "glm-5.2");
  assert.deepEqual(await model.doStream(options), { ok: true });
  assert.deepEqual(calls, ["primary:request", "fallback:request"]);
});

test("retry exhaustion is a fallback signal", () => {
  assert.equal(
    isOpenCodeRetryableError(
      new OpenCodeRetryExhaustedError("deepseek-v4-pro", { status: 503 }),
    ),
    true,
  );
});

test("does not hide unrelated primary errors", async () => {
  let fallbackCalls = 0;
  const primary = {
    async doStream() {
      throw new Error("invalid request");
    },
  };
  const fallback = {
    async doStream() {
      fallbackCalls++;
      return { ok: true };
    },
  };

  await assert.rejects(
    withOpenCodeStreamFallback(primary, fallback).doStream({}),
    /invalid request/,
  );
  assert.equal(fallbackCalls, 0);
});

test("an already-aborted call never starts primary or fallback", async () => {
  const controller = new AbortController();
  controller.abort(new DOMException("stop", "AbortError"));
  let primaryCalls = 0;
  let fallbackCalls = 0;
  const primary = {
    async doStream() {
      primaryCalls++;
      return { ok: true };
    },
  };
  const fallback = {
    async doStream() {
      fallbackCalls++;
      return { ok: true };
    },
  };

  await assert.rejects(
    withOpenCodeStreamFallback(primary, fallback).doStream({
      abortSignal: controller.signal,
    }),
    { name: "AbortError" },
  );
  assert.equal(primaryCalls, 0);
  assert.equal(fallbackCalls, 0);
});

test("abort after primary failure prevents fallback", async () => {
  const controller = new AbortController();
  let fallbackCalls = 0;
  const primary = {
    async doStream() {
      controller.abort(new DOMException("stop", "AbortError"));
      throw new OpenCodeRetryExhaustedError("deepseek-v4-pro", {
        status: 503,
      });
    },
  };
  const fallback = {
    async doStream() {
      fallbackCalls++;
      return { ok: true };
    },
  };

  await assert.rejects(
    withOpenCodeStreamFallback(primary, fallback).doStream({
      abortSignal: controller.signal,
    }),
    { name: "AbortError" },
  );
  assert.equal(fallbackCalls, 0);
});

test("abort inside fallback is not wrapped as availability failure", async () => {
  const controller = new AbortController();
  const primary = {
    async doStream() {
      throw new OpenCodeRetryExhaustedError("deepseek-v4-pro", {
        status: 503,
      });
    },
  };
  const fallback = {
    async doStream() {
      controller.abort(new DOMException("stop", "AbortError"));
      throw controller.signal.reason;
    },
  };

  await assert.rejects(
    withOpenCodeStreamFallback(primary, fallback).doStream({
      abortSignal: controller.signal,
    }),
    { name: "AbortError" },
  );
});

test("reports the protocol-compatible model when fallback also fails", async () => {
  const primary = {
    async doStream() {
      throw new OpenCodeRetryExhaustedError("deepseek-v4-pro", {
        status: 503,
      });
    },
  };
  const fallback = {
    async doStream() {
      throw new Error("fallback failure");
    },
  };

  await assert.rejects(
    withOpenCodeStreamFallback(primary, fallback, "glm-5.2").doStream({}),
    /primary and glm-5\.2 failed/,
  );
});

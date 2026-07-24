import test from "node:test";
import assert from "node:assert/strict";
import { withOpenCodeStreamFallback } from "../agent/opencode-stream-fallback.js";

test("replays a Console Go stream failure once through qwen", async () => {
  const calls: string[] = [];
  const primary = {
    async doStream(...args: unknown[]) {
      calls.push(`primary:${args[0]}`);
      throw new Error(
        "AI_APICallError: Error from provider (Console Go): Upstream request failed",
      );
    },
  };
  const fallback = {
    async doStream(...args: unknown[]) {
      calls.push(`fallback:${args[0]}`);
      return { ok: true };
    },
  };

  const model = withOpenCodeStreamFallback(primary, fallback);
  assert.deepEqual(await model.doStream("request"), { ok: true });
  assert.deepEqual(calls, ["primary:request", "fallback:request"]);
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
    withOpenCodeStreamFallback(primary, fallback).doStream(),
    /invalid request/,
  );
  assert.equal(fallbackCalls, 0);
});

test("reports stable availability failure when qwen also fails", async () => {
  const primary = {
    async doStream() {
      throw new Error(
        "Error from provider (Console Go): Upstream request failed",
      );
    },
  };
  const fallback = {
    async doStream() {
      throw new Error("fallback failure");
    },
  };

  await assert.rejects(
    withOpenCodeStreamFallback(primary, fallback).doStream(),
    /OpenCode Go Availability Error/,
  );
});

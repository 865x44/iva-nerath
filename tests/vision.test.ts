import test from "node:test";
import assert from "node:assert/strict";
import { describeImageWithConfig } from "../agent/vision.js";

const image = new Uint8Array([137, 80, 78, 71]).buffer;

test("OpenCode vision is a no-network no-op without an explicit model", async () => {
  let fetchCalls = 0;
  const fetchImpl: typeof fetch = async () => {
    fetchCalls++;
    throw new Error("network must not be called");
  };

  const result = await describeImageWithConfig(
    image,
    "image/png",
    "opencode",
    {
      baseURL: "https://opencode.ai/zen/go/v1",
      apiKey: "redacted",
      visionModel: undefined,
    },
    fetchImpl,
  );

  assert.equal(result, "");
  assert.equal(fetchCalls, 0);
});

test("explicit OpenCode vision override uses OpenAI-compatible image_url shape", async () => {
  let requestBody: any;
  const fetchImpl: typeof fetch = async (_input, init) => {
    requestBody = JSON.parse(String(init?.body));
    return Response.json({
      choices: [{ message: { content: "accepted" } }],
    });
  };

  const result = await describeImageWithConfig(
    image,
    "image/png",
    "opencode",
    {
      baseURL: "https://opencode.ai/zen/go/v1",
      apiKey: "redacted",
      visionModel: "catalog-vision",
    },
    fetchImpl,
  );

  assert.equal(result, "accepted");
  assert.equal(requestBody.model, "catalog-vision");
  assert.match(
    requestBody.messages[0].content[1].image_url.url,
    /^data:image\/png;base64,/,
  );
});

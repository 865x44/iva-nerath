import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import test from "node:test";

const repoRoot = realpathSync(join(dirname(fileURLToPath(import.meta.url)), ".."));
const agentRoot = join(repoRoot, "dogfood", "isolated-mock-agent", "agent");
const eveCli = join(repoRoot, "node_modules", "eve", "bin", "eve.js");
const disabledTools = ["bash", "write_file", "web_fetch", "web_search"];

test("C5a isolated mock agent is mock-only and has a denied tool surface", async (t) => {
  await t.test("mock fetch has one synthetic completion endpoint and fails closed", async () => {
    const { generateText, streamText } = await import("ai");
    const { mockFetch, mockModel } = await import(pathToFileURL(join(agentRoot, "agent.ts")).href);
    const response = await mockFetch("http://iva-mock.invalid/v1/chat/completions");
    const completion = await response.json();

    assert.equal(completion.choices[0].message.content, "IVA mock-only response");
    assert.equal((await generateText({ model: mockModel, prompt: "ordinary completion" })).text, "IVA mock-only response");

    const streamed = streamText({ model: mockModel, prompt: "streaming completion" });
    let streamTextResult = "";
    for await (const chunk of streamed.textStream) streamTextResult += chunk;
    assert.equal(streamTextResult, "IVA mock-only response");

    await assert.rejects(
      () => mockFetch("https://example.invalid/forbidden"),
      /rejected unexpected fetch URL/,
    );
  });

  await t.test("Eve discovers the isolated root and disabled framework tools without starting a server", () => {
    assert.equal(existsSync(join(agentRoot, ".env")), false, "isolated root must not load a local .env");
    assert.equal(existsSync(join(agentRoot, ".env.local")), false, "isolated root must not load a local .env.local");

    const result = spawnSync(
      "/usr/bin/node-24",
      [eveCli, "info", "--json"],
      {
        cwd: agentRoot,
        encoding: "utf8",
        env: { HOME: "/tmp/iva-mock-home", PATH: process.env.PATH || "/usr/bin:/bin", TMPDIR: "/tmp" },
      },
    );

    assert.equal(result.status, 0, `eve info failed: ${result.stderr}`);
    const jsonStart = result.stdout.indexOf("{");
    assert.notEqual(jsonStart, -1, "eve info must emit a JSON payload after its banner");
    const info = JSON.parse(result.stdout.slice(jsonStart));
    const manifest = JSON.parse(
      readFileSync(join(agentRoot, ".eve", "compile", "compiled-agent-manifest.json"), "utf8"),
    );

    assert.equal(info.agentRoot, agentRoot);
    assert.equal(info.appRoot, agentRoot);
    assert.deepEqual(info.tools, []);
    assert.deepEqual(info.skills, []);
    assert.deepEqual(info.channels, []);
    assert.deepEqual(manifest.connections, []);
    assert.deepEqual(manifest.schedules, []);
    assert.deepEqual(manifest.subagents ?? [], []);

    for (const name of disabledTools) {
      assert.ok(manifest.disabledFrameworkTools.includes(name), `${name} must be unavailable`);
    }
  });
});

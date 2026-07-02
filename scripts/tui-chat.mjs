#!/usr/bin/env node
// Локальный TUI-клиент для Iva.
// Подключается к локальному eve (loopback) через eve/client SDK.

import { createInterface } from "node:readline/promises";
import { Client } from "eve/client";

const PORT = process.env.IVA_PORT ?? "8723";
const HOST = process.env.ASSISTANT_HOST ?? `http://127.0.0.1:${PORT}`;

const client = new Client({ host: HOST });
const session = client.session();

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("close", () => {
  process.stdout.write("\n");
  process.exit(0);
});

rl.on("SIGINT", () => {
  process.stdout.write("\n");
  process.exit(0);
});

async function main() {
  for (;;) {
    const userInput = await rl.question("you> ");
    if (!userInput.trim()) continue;

    try {
      const response = await session.send(userInput);
      let didAppend = false;

      for await (const event of response) {
        if (event.type === "message.appended") {
          didAppend = true;
          process.stdout.write(event.data.messageDelta);
        }
        if (event.type === "message.completed" && event.data.finishReason !== "tool-calls") {
          if (!didAppend && event.data.message) {
            process.stdout.write(event.data.message);
          }
        }
        if (event.type === "step.failed" || event.type === "turn.failed" || event.type === "session.failed") {
          process.stdout.write(`\n[agent error] ${event.data.code}: ${event.data.message}`);
        }
      }
      process.stdout.write("\n");
    } catch (e) {
      console.error("\nОшибка связи с агентом:", e.message);
    }
  }
}

main().catch((e) => {
  console.error("tui-chat fatal error:", e);
  process.exit(1);
});

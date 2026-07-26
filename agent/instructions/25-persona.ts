import { defineDynamic, defineInstructions } from "eve/instructions";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Динамическая инструкция: каждый турн инжектит «характер» Ивы (vault/PERSONA.md) в
// системный промпт — тон, инициативность, стиль ответов, настроенные тестом-квизом в
// /menu. Живёт рядом с ядром памяти (20-core.ts): always-on, переживает компактацию
// (инструкции — не часть сжимаемой истории диалога), применяется со следующего
// сообщения без рестарта (квиз пишет файл — инструкция его подхватывает на очередном
// турне). Самодостаточна — только eve + node fs/path (гоча eve 0.11.4).
import { isNerathModeOn } from "../../scripts/lib/nerath-mode.mjs";

const VAULT = process.env.ASSISTANT_VAULT_DIR ?? "vault";
const MAX_CHARS = 800; // жёсткий лимит персоны — держим always-on пол плоским.

function personaMarkdown(): string {
  const vaultDir = process.env.ASSISTANT_VAULT_DIR ?? "vault";
  const vaultPath = vaultDir.startsWith("/") ? vaultDir : join(process.cwd(), vaultDir);
  let persona: string;
  try {
    persona = readFileSync(join(vaultPath, "PERSONA.md"), "utf8").trim();
  } catch {
    return ""; // нет файла (квиз не пройден) — молча ничего не инжектим.
  }
  if (!persona) return ""; // пустой файл — тоже ничего не инжектим.
  if (persona.length > MAX_CHARS) {
    persona = persona.slice(0, MAX_CHARS) + "\n…(характер усечён)";
  }

  if (isNerathModeOn()) {
    return `## Характер (настроен тестом /menu) [Underlayer]
${persona}

Precedence rule: the constitution register governs tone, epistemics, and identity boundaries; PERSONA supplies character flavor and lexicon only and NEVER overrides epistemic hygiene, capability truth, or identity-boundary rules. On conflict, constitution wins.`;
  }

  return `## Характер (настроен тестом /menu)\n${persona}`;
}

export default defineDynamic({
  events: {
    // turn.started — перечитывается каждый турн, чтобы смена характера в /menu применялась
    // со следующего сообщения без рестарта.
    "turn.started": () => defineInstructions({ markdown: personaMarkdown() }),
  },
});

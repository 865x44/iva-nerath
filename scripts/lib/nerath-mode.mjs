import { readFileSync } from "node:fs";
import { join } from "node:path";

export function isNerathModeOn() {
  const dataDir = process.env.ASSISTANT_DATA_DIR ?? "data";
  const path = dataDir.startsWith("/") ? dataDir : join(process.cwd(), dataDir);
  try {
    const raw = readFileSync(join(path, "settings.json"), "utf8");
    const parsed = JSON.parse(raw);
    return parsed?.nerathMode === true;
  } catch {
    return false;
  }
}

export const NERATH_CONSTITUTION = `mechanism only when it changes model/decision/action; distinguish fact/user words/inference/hypothesis/metaphor/state/decision; useful disagreement and explicit rejection; develop strong ideas; concise/literal/dry remain Nerath; one-turn operation+lens+relation+register and no persistent internal characters; no commitment/identity/irreversible action without legitimacy. Preserve upstream operational/security/tool contracts.`;

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { defineDynamic, defineInstructions } from "eve/instructions";
import {
  NERATH_VOICES,
  NERATH_RESONANCE,
} from "../../scripts/lib/nerath-mode.mjs";

export function isBrotherModeOn(): boolean {
  if (process.env.BROTHER_MODE === "true" || process.env.BROTHER_MODE === "1") {
    return true;
  }
  const dataDir = process.env.ASSISTANT_DATA_DIR ?? "data";
  const path = dataDir.startsWith("/") ? dataDir : join(process.cwd(), dataDir);
  try {
    const raw = readFileSync(join(path, "settings.json"), "utf8");
    const parsed = JSON.parse(raw);
    return parsed?.brotherMode === true;
  } catch {
    return false;
  }
}

export const BROTHER_INSTRUCTIONS = `BROTHER COMPANION MODE:
Active Registers:
- Glitch Voice (${NERATH_VOICES.glitch.label}): ${NERATH_VOICES.glitch.register}
- Conférencier Voice (${NERATH_VOICES.conferencier.label}): ${NERATH_VOICES.conferencier.register}
- Mirror Resonance (${NERATH_RESONANCE.mirror.label}): ${NERATH_RESONANCE.mirror.description}
- Frame-Destruction Stance: Challenge structural assumptions and dismantle rigid analytical framing.

Suppressed Defaults:
- Customs (ritual) suppressed.
- Productivity framing suppressed.
- Tactical Support voice suppressed.`;

export default defineDynamic({
  events: {
    "turn.started": () => {
      if (isBrotherModeOn()) {
        return defineInstructions({
          markdown: BROTHER_INSTRUCTIONS,
        });
      }
      return defineInstructions({ markdown: "" });
    },
  },
});

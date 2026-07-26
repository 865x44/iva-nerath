import { defineDynamic, defineInstructions } from "eve/instructions";
import {
  isNerathModeOn,
  NERATH_CONSTITUTION,
  NERATH_POSITIVE_LAYER,
} from "../../scripts/lib/nerath-mode.mjs";

export default defineDynamic({
  events: {
    "turn.started": () => {
      if (isNerathModeOn()) {
        return defineInstructions({
          markdown: `${NERATH_CONSTITUTION}\n\n${NERATH_POSITIVE_LAYER}`,
        });
      }
      return defineInstructions({ markdown: "" });
    },
  },
});

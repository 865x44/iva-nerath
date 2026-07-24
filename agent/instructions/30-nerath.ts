import { defineDynamic, defineInstructions } from "eve/instructions";
import { isNerathModeOn, NERATH_CONSTITUTION } from "../../scripts/lib/nerath-mode.mjs";

export default defineDynamic({
  events: {
    "turn.started": () => {
      if (isNerathModeOn()) {
        return defineInstructions({ markdown: NERATH_CONSTITUTION });
      }
      return defineInstructions({ markdown: "" });
    },
  },
});

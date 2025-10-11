import Ruler from "./ruler.mjs";
import StateCore from "./rules_core/state_core.mjs";

export type RuleCore = (state: StateCore) => void;

export default class Core {
    /**
     * {@link Ruler} instance. Keep configuration of core rules.
     */
    ruler: Ruler<RuleCore>;

    /**
     * Executes core chain rules.
     */
    process(state: StateCore): void;

    State: typeof StateCore;
}

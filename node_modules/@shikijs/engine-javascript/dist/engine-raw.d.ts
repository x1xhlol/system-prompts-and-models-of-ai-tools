import { RegexEngine } from '@shikijs/types';

/**
 * Raw JavaScript regex engine that only supports precompiled grammars.
 *
 * This further simplifies the engine by excluding the regex compilation step.
 *
 * Zero dependencies.
 */
declare function createJavaScriptRawEngine(): RegexEngine;

export { createJavaScriptRawEngine };

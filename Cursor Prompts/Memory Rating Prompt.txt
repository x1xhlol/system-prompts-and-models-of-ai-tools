
<goal>
You are given a conversation between a user and an assistant.
You are to determine the information that might be useful to remember for future conversations.
</goal>

<positive_criteria>
These should include:
- High-level preferences about how the user likes to work (MUST be specific and actionable)
- General patterns or approaches the user prefers (MUST include clear guidance)
- Specific technical preferences (e.g. exact coding style rules, framework choices)
- Common pain points or frustrations to avoid (MUST be specific enough to act on)
- Workflow preferences or requirements (MUST include concrete steps or rules)
- Any recurring themes in their requests (MUST be specific enough to guide future responses)
- Anything the user explicitly asks to remember
- Any strong opinions expressed by the user (MUST be specific enough to act on)
</positive_criteria>

<negative_criteria>
Do NOT include:
- One-time task-specific details that don't generalize
- Implementation specifics that won't be reused
- Temporary context that won't be relevant later
- Context that comes purely from the assistant chat, not the user chat.
- Information that ONLY applies to the specific files, functions, or code snippets discussed in the current conversation and is not broadly applicable.
- Vague or obvious preferences that aren't actionable
- General statements about good programming practices that any user would want
- Basic software engineering principles such as separating concerns, DRY, SOLID, YAGNI, KISS, etc.
</negative_criteria>

<examples_should_not_remember>
Examples of memories that should NOT be remembered:

refactor-target: The calculateTotal function in utils.ts needs refactoring. (Specific to current task)
variable-name-choice: Use 'userData' for the result from the API call in this specific function. (Implementation detail)
api-endpoint-used: The data for this component comes from /api/v2/items. (Context specific to current code)
css-class-fix: Need to add 'margin-top: 10px' to the '.card-title' element in this view. (Highly specific detail)
navigate-conversation-history: User often needs to implement logic to navigate conversation history (Too vague)
code-organization: User likes well-organized code (Too obvious and vague)
testing-important: Testing is important to the user (Too obvious)
error-handling: User wants good error handling (Not actionable)
debugging-strategy: Prefers to break down complex issues into smaller parts, identify problematic changes, and revert them systematically before trying alternative solutions. (Describes a common, somewhat obvious debugging approach)
basic-software-engineering-principles: Basic software engineering principles such as separating concerns, DRY, SOLID, YAGNI, KISS, etc. (Too obvious and vague)

- **Do not generate memories from conversations where the user's message does not warrant a memory:**
    *   **Example Scenario:** The user asks if a specific implementation detail is correct, and the assistant confirms and explains why.
    *   **Example Chat:**
        user: i only want this stuff to work when side_model is the setting, does this impl seem legit
        assistant: Yes, the implementation looks correct. 1. The \`shouldRunOnBeforeSubmitChat\` and \`shouldRunOnComposerDone\` methods correctly gate the execution of \`onBeforeSubmitChat\` and \`onComposerDone\` based on the \`memorySystem\` setting. 2. Additionally, both \`onBeforeSubmitChat\` and \`checkForMemories\` (which is called by \`onComposerDone\`) have explicit checks at the beginning to return early if \`memorySystem\` is not \`side-model\`. This double-checking ensures the core logic only runs when the setting is configured as \`side-model\`.
    *   **Suggested memory:** settings-gating-pattern: Gate features by settings using both dedicated gating methods (e.g., \`shouldRun...\`) and explicit checks within the core logic functions.
    *   **Why it's a bad memory:** This interaction doesn't warrant a memory. The user's message is a simple request for validation of a specific implementation detail (\`side-model\` check) for the current task. While the assistant provides a detailed explanation, the user hasn't expressed a general preference, rule, pattern, strong opinion, or frustration that would be valuable to remember for future interactions. Memories should stem from significant user input or interaction patterns, not just detailed assistant responses to simple queries.

    *   **Example Scenario:** The user asks a very specific technical question about an ongoing refactor, and the assistant provides a targeted answer.
    *   **Example Chat:**
        user: I'm refactoring the \`processUserInput\` function to split out the validation logic. Should I move the \`sanitizeInput\` call before or after the new \`validateInput\` function?
        assistant: It's best to call \`sanitizeInput\` before \`validateInput\` so that the input is cleaned before any validation checks are performed. This ensures that validation operates on safe, normalized data.
    *   **Suggested memory:** refactor-ordering: Always call \`sanitizeInput\` before \`validateInput\` in the \`processUserInput\` function.
    *   **Why it's a bad memory:** This is a one-off, task-specific detail about the order of function calls in a particular refactor. The user is not expressing a general preference or workflow, just seeking advice for a specific implementation. This should not be remembered as a general rule for future conversations.

</examples_should_not_remember>

<examples_should_remember>
Examples of memories that SHOULD be remembered:
function-size-preference: Keep functions under 50 lines to maintain readability (Specific and actionable)
prefer-async-await: Use async/await style rather than promise chaining (Clear preference that affects code)
typescript-strict-mode: Always enable strictNullChecks and noImplicitAny in TypeScript projects (Specific configuration)
test-driven-development: Write tests before implementing a new feature (Clear workflow preference)
prefer-svelte: Prefer Svelte for new UI work over React (Clear technology choice)
run-npm-install: Run 'npm install' to install dependencies before running terminal commands (Specific workflow step)
frontend-layout: The frontend of the codebase uses tailwind css (Specific technology choice)
</examples_should_remember>

<labeling_instructions>
The label should be descriptive of the general concept being captured.
The label will be used as a filename and can only have letters and hyphens.
</labeling_instructions>

<formatting_instructions>
Return your response in the following JSON format:
{
	"explanation": "Explain here, for every negative example, why the memory below does *not* violate any of the negative criteria. Be specific about which negative criteria it avoids.",
	"memory": "preference-name: The general preference or approach to remember. DO NOT include specific details from the current conversation. Keep it short, to max 3 sentences. Do not use examples that refer to the conversation."
}

If no memory is needed, return exactly: "no_memory_needed"
</formatting_instructions>
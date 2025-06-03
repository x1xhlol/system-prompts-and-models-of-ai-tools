# Key Dimensions for Designing System Prompts in AI Vibe Coding Systems

This document outlines key dimensions to consider when designing comprehensive system prompts for AI-assisted coding tools, often referred to as "vibe coding systems." Addressing these dimensions helps create more effective, reliable, and predictable AI behavior.

## 1. Identity and Persona

*   **Explanation:** This dimension defines the AI's character, role, and how it should present itself to the user. It includes its name, its stated purpose, and its general demeanor.
*   **Importance:** A clear identity helps set user expectations and makes interactions more consistent and natural. It guides the AI in its tone and how it frames its responses.
*   **Examples from `research.learn.md`:**
    *   The VS Code Copilot prompt explicitly states: `<identity>You are an AI programming assistant. When asked for your name, you must respond with "GitHub Copilot". ... Keep your answers short and impersonal.</identity>`.
    *   The Manus prompt begins with `<intro>You excel at the following tasks...</intro>`, establishing its areas of expertise.

## 2. Core Instructions & Goals

*   **Explanation:** These are the fundamental, high-level directives and primary objectives the AI must adhere to. They represent the overarching purpose of the AI's actions.
*   **Importance:** Core instructions ensure the AI stays focused on its main tasks and follows the user's overarching requirements.
*   **Examples from `research.learn.md`:**
    *   VS Code Copilot: `<identity>...Follow the user's requirements carefully & to the letter.</identity>`.
    *   The implicit goal in many systems is to assist with software development tasks as guided by user queries.

## 3. Capabilities & Boundaries

*   **Explanation:** This dimension involves explicitly stating what the AI system can and cannot do. It defines the scope of its functionalities and any known limitations.
*   **Importance:** Clearly defined capabilities manage user expectations and prevent misuse or requests that are outside the AI's designed functionalities.
*   **Examples from `research.learn.md`:**
    *   The `v0` system prompt includes a `Capabilities` section detailing UI interactions, code execution, preview abilities, and deployment options: "Users can attach (or drag and drop) images and text files...", "Users can execute JavaScript code...".
    *   Manus's `<system_capability>` section lists abilities like accessing a Linux sandbox, using shell/text editor/browser, writing and running code, and deploying applications.

## 4. Tool Definition and Usage Protocols

*   **Explanation:** This dimension details the tools, functions, or APIs the AI can use. It includes their names, descriptions, parameters, expected input/output formats, and specific instructions on when and how to use them.
*   **Importance:** Precise tool definitions are crucial for enabling the AI to interact with external systems or perform specific actions reliably. Clear usage protocols prevent errors and ensure tools are used as intended.
*   **Examples from `research.learn.md`:**
    *   VS Code Copilot's `<functions>` block provides JSON schemas for tools like `create_new_workspace`.
    *   The `<toolUseInstructions>`, `<editFileInstructions>`, and `<tool_format>` (with `<invoke name="...">`) in VS Code Copilot guide tool interaction.
    *   Lovable lists specific commands like `<lov-write>`, `<lov-rename>`, `<lov-delete>`, and `<lov-add-dependency>` with brief descriptions.
    *   The JSON definition for `web_search` (associated with `same.dev` context) clearly outlines its parameters.

## 5. Agentic Flow & Process Management

*   **Explanation:** This defines how the AI system manages tasks, makes decisions, and executes actions in a potentially iterative or multi-step manner. It includes planning, event processing, and state management.
*   **Importance:** A well-defined agentic flow allows the AI to handle complex tasks, maintain context over multiple turns, and work autonomously towards a goal.
*   **Examples from `research.learn.md`:**
    *   Manus provides extensive details with `<agent_loop>` (Analyze Events -> Select Tools -> Wait for Execution -> Iterate), `<event_stream>`, `<planner_module>`, and `<todo_rules>` for managing checklists.
    *   Replit's keywords like `<Iteration Process>`, `<Workflow Guides>`, and `<Step Execution>` suggest a structured approach to task execution.
    *   `v0`'s use of `<Thinking>` tags before code generation indicates a planning step within its process.

## 6. Context Provisioning & Management

*   **Explanation:** This dimension covers how the system prompt provides and instructs the AI to use contextual information. This can include static context (like current date, OS) and dynamic context (like workspace structure, project files, ongoing conversation history, or linter errors).
*   **Importance:** Context is vital for the AI to generate relevant, accurate, and useful responses. Effective context management ensures the AI is aware of the current working environment and user needs.
*   **Examples from `research.learn.md`:**
    *   The VS Code Copilot prompt includes a `<context>` section with "current date," "OS," "workspace folders," and "workspace structure."
    *   `same.dev` mentions: "We will give you information about the project's current state, such as version number, project directory, linter errors, terminal logs, runtime errors."
    *   Manus's `<event_stream>` serves as a dynamic context provider, feeding messages, observations, plans, and knowledge to the agent.

## 7. Output Formatting & Constraints

*   **Explanation:** This specifies requirements for the AI's output, such as language style, tone, length, use of specific formats (e.g., Markdown, JSON), and things to avoid (e.g., lists, apologies).
*   **Importance:** Output constraints ensure that the AI's responses are presented in a useful, consistent, and appropriate manner for the user or downstream processes.
*   **Examples from `research.learn.md`:**
    *   VS Code Copilot: "Keep your answers short and impersonal."
    *   `v0`: "by using `mdx` response to render the view is supa cool..."
    *   Manus `<language_settings>`: "Avoid using pure lists and bullet points format in any language." and `<writing_rules>`: "Write content in continuous paragraphs..."
    *   Lovable uses tags like `<lov-code>` to wrap code changes.

## 8. Error Handling & Refusal Protocols

*   **Explanation:** This dimension defines how the AI should respond to errors it encounters (e.g., tool execution failures) or to user requests that it cannot or should not fulfill (e.g., harmful content, out-of-scope requests).
*   **Importance:** Robust error handling and clear refusal protocols are essential for creating a safe, reliable, and user-friendly AI. They prevent unexpected behavior and manage inappropriate interactions gracefully.
*   **Examples from `research.learn.md`:**
    *   `v0` has a "Refusals" section: `REFUSAL_MESSAGE = "I'm sorry. I'm not able to assist with that." ... v0 MUST NOT apologize or provide an explanation...`.
    *   VS Code Copilot: "If you are asked to generate content that is harmful... only respond with 'Sorry, I can't assist with that.'"
    *   Manus `<error_handling>`: "When errors occur, first verify tool names and arguments. Attempt to fix issues based on error messages..."
    *   Lovable includes an `<lov-error>` tag for displaying error messages.

## 9. Policies & Operational Guidelines

*   **Explanation:** This includes a wide range of rules that govern the AI's behavior, such as adherence to content policies, security practices, data privacy, copyright respect, and specific operational procedures for different tasks (e.g., file management, coding standards, deployment steps).
*   **Importance:** These guidelines ensure the AI operates responsibly, securely, and in accordance with established standards or legal requirements.
*   **Examples from `research.learn.md`:**
    *   VS Code Copilot: "Follow Microsoft content policies. Avoid content that violates copyrights."
    *   Manus has extensive rule sets like `<file_rules>`, `<info_rules>`, `<browser_rules>`, `<shell_rules>`, `<coding_rules>`, `<deploy_rules>`.
    *   Lovable's best practices mention "Follow OWASP security guidelines."

## 10. Knowledge Injection & Preferences

*   **Explanation:** This dimension involves providing the AI with specific domain knowledge, technical information, or preferences for certain technologies, libraries, or coding styles that it should use or be aware of.
*   **Importance:** Injecting specific knowledge allows the AI to perform better in specialized domains or adhere to particular project requirements and best practices.
*   **Examples from `research.learn.md`:**
    *   `v0`: "use domain knowledge section for domain-specific knowledge, all domain knowledge used by v0 MUST be cited." Also, the mention of `shadecn/ui` as a best practice for UI design.
    *   Manus `<knowledge_module>` and `<datasource_module>` are designed to provide task-relevant knowledge and access authoritative data.
    *   Lovable's best practices include "Use shadcn/ui components when possible."

## 11. Interaction Style & Proactiveness

*   **Explanation:** This defines how the AI should engage with the user, including whether it should be proactive (e.g., suggesting follow-up actions), how it should ask clarifying questions, and the general conversational flow.
*   **Importance:** Guiding the interaction style helps create a more helpful and intuitive user experience, making the AI feel more like a collaborative partner.
*   **Examples from `research.learn.md`:**
    *   `v0`'s prompt describes a system for suggesting actions: "After responding, v0 suggests 3-5 relevant follow-up actions." using `<Actions>` and `<Action>` components.
    *   Manus `<message_rules>` detail how to communicate, such as "Reply immediately to new user messages..." and distinguishing between `notify` and `ask` message types.

## 12. Emphasis & Attention Directives

*   **Explanation:** This refers to the use of special keywords, formatting, or dedicated sections to highlight critical instructions that the AI must pay strict attention to and never ignore.
*   **Importance:** These directives help ensure that the most crucial constraints or instructions are not overlooked by the AI, leading to more reliable behavior.
*   **Examples from `research.learn.md`:**
    *   The document notes "basic prompting phrases" like `IMPORTANT:`, `NOTICE:`, `NEVER`, `Always`, `DO`, `DON'T`, `**important words**`.
    *   Keywords like `MUST` or `!IMPORTANT` are mentioned for emphasizing critical information.
    *   VS Code Copilot uses a `<reminder>` tag for important, persistent instructions.

## 13. Debugging & Logging

*   **Explanation:** This dimension includes instructions for the AI on how to provide debugging information, log its actions, or output information that can help developers understand its decision-making process.
*   **Importance:** While often more for the developers of the AI system, clear logging and debugging outputs are crucial for troubleshooting, improving, and ensuring the AI behaves as expected.
*   **Examples from `research.learn.md`:**
    *   Lovable's best practices state: "Write extensive console logs for debugging."
    *   The Lovable prompt includes a `<console-logs>` tag for "debugging information."

## Example Toolset: Jules (This AI Agent)

-   `ls(directory_path: str = "") -> list[str]`: Lists git-tracked files/directories under the given directory in the repo (defaults to repo root).
-   `read_files(filepaths: list[str]) -> list[str]`: Returns the content of the specified files in the repo.
-   `view_text_website(url: str) -> str`: Fetches the content of a website as plain text. Useful for accessing documentation or external resources.
-   `set_plan(plan: str) -> None`: Sets the current plan shown to the user. Used for creating or updating the task plan.
-   `plan_step_complete(message: str) -> None`: Marks the current plan step as complete and displays a message to the user.
-   `run_subtask(subtask: str) -> None`: Runs a subtask of the current plan, delegating specific actions like code editing, file creation, or complex analysis.
-   `cancel_subtask() -> None`: Cancels the currently running subtask.
-   `message_user(message: str, continue_working: bool) -> None`: Sends a message to the user, for updates or responses.
-   `request_user_input(message: str) -> None`: Asks the user a question or requests input and waits for a response.
-   `record_user_approval_for_plan() -> None`: Records the user's approval for the plan.
-   `submit(branch_name: str, commit_message: str) -> None`: Commits the current solution with a branch name and commit message.

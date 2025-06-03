# Designing System Prompts for Agentic AI: Flow Patterns and Structures

## Introduction

Agentic flow in AI systems refers to the ability of an AI to perform tasks autonomously, often involving iterative processing, tool use, planning, and decision-making based on incoming events and predefined rules. The system prompt plays a critical role in defining this flow, providing the AI with the necessary instructions, context, and operational framework. This document synthesizes observed patterns and structural conventions from AI system prompts (primarily drawing from examples like Manus and Replit in `research.learn.md`) to offer insights into designing effective agentic behaviors.

## Key Structural Elements for Agentic Flow

System prompts often use specific tags or dedicated sections to delineate the core components of an agentic process. These structures help the AI understand its operational mechanics.

*   **`<agent_loop>` (or similar):** This tag explicitly defines the main iterative cycle of the agent.
    *   **Example (Manus):**
        ```xml
        <agent_loop>
        You are operating in an agent loop, iteratively completing tasks through these steps:
        1. Analyze Events...
        2. Select Tools...
        3. Wait for Execution...
        4. Iterate...
        5. Submit Results...
        6. Enter Standby...
        </agent_loop>
        ```
*   **`<event_stream>`:** Describes the format and types of events the agent will process, forming the basis of its perception and reaction.
    *   **Example (Manus):**
        ```xml
        <event_stream>
        You will be provided with a chronological event stream...containing...events:
        1. Message: Messages input by actual users
        2. Action: Tool use (function calling) actions
        3. Observation: Results generated from corresponding action execution
        4. Plan: Task step planning and status updates provided by the Planner module
        ...
        </event_stream>
        ```
*   **`<planner_module>`:** Details the component responsible for high-level task planning and breaking down complex goals into manageable steps.
    *   **Example (Manus):**
        ```xml
        <planner_module>
        - System is equipped with planner module for overall task planning
        - Task planning will be provided as events in the event stream
        - Task plans use numbered pseudocode to represent execution steps...
        </planner_module>
        ```
*   **`<Iteration Process>`, `<Step Execution>`, `<Workflow Guides>`:** These keywords, noted in the context of Replit, suggest a high-level organization of the prompt into sections that guide the AI through different phases of task execution, implying an underlying iterative or step-by-step flow.

## Core Agentic Loop Patterns

The heart of an agentic system is its operational loop, which typically follows a consistent pattern:

*   **Input-Analyze-SelectTool-Execute-Iterate Loop:** This is the fundamental cycle.
    1.  **Input/Analyze Events:** The agent receives input, often as events in an `event_stream` (e.g., user messages, system notifications, previous tool outputs/observations). It analyzes this information to understand the current state and requirements. (Manus: "Analyze Events: Understand user needs and current state through event stream...")
    2.  **Select Tool(s):** Based on the analysis, the agent chooses the appropriate tool(s) or action(s) to make progress on the task. (Manus: "Select Tools: Choose next tool call based on current state, task planning...")
    3.  **Execute/Wait for Execution:** The selected tool is run, or the action is performed. The system then waits for the outcome. (Manus: "Wait for Execution: Selected tool action will be executed by sandbox environment with new observations added to event stream")
    4.  **Iterate:** The outcome of the execution (now a new event/observation) feeds back into the loop, and the process repeats until the task is completed. (Manus: "Iterate: Choose only one tool call per iteration, patiently repeat above steps until task completion")
*   **Event-Driven Processing:** This is a dominant pattern. The agent's actions are primarily reactions to events. This allows for dynamic and responsive behavior. The `event_stream` in Manus is a clear example, where user messages, tool outputs (observations), and planner updates are all events that drive the loop.

## Task Management and Planning Patterns

For complex tasks, simple iteration is not enough. Effective agents often separate planning from execution:

*   **Separation of High-Level Planning and Step Execution:**
    *   A dedicated `planner_module` (like in Manus) can create an overall task plan, often represented as a sequence of steps or pseudocode. This plan is then fed to the execution loop.
    *   The planner can dynamically update the plan based on new events or observations, providing flexibility. (Manus: "Pseudocode representing execution steps will update when overall task objective changes").
*   **Dynamic Checklists for Progress Tracking:**
    *   For managing detailed steps within a larger plan, systems can use dynamic checklists.
    *   **Example (Manus `<todo_rules>`):**
        ```xml
        <todo_rules>
        - Create todo.md file as checklist based on task planning from the Planner module
        - Task planning takes precedence over todo.md, while todo.md contains more details
        - Update markers in todo.md via text replacement tool immediately after completing each item...
        </todo_rules>
        ```
        This `todo.md` acts as a tangible, updatable record of progress, ensuring all planned steps are addressed.

## Policy and Rule Integration Patterns

To ensure reliable and safe operation, agentic systems embed specific rules and policies directly within their process descriptions:

*   **Dedicated Rule Sections:** Prompts often include clearly demarcated sections for various behavioral rules.
    *   **Example (Manus):** The Manus prompt features numerous `_rules` sections like `<message_rules>`, `<file_rules>`, `<shell_rules>`, `<error_handling>`, `<coding_rules>`, etc. Each section provides explicit instructions on how the agent should behave in specific situations or when performing certain types of actions. For instance, `<error_handling>` dictates how to react to tool failures, and `<message_rules>` governs communication with the user.
*   These rules are not just static guidelines but are intended to be actively consulted and applied by the AI during its `agent_loop` as it selects tools and formulates responses.

## Modularity and Organization Patterns

Complex system prompts benefit significantly from a modular design:

*   **Distinct, Manageable Sections:** Breaking down the prompt into logical blocks (e.g., identity, capabilities, event stream definition, agent loop, planner, specific rules) makes the overall system easier to understand, manage, and debug.
*   **Example (Manus):** The Manus prompt exemplifies this with its extensive use of XML-like tags to create a highly modular structure. Each tag encapsulates a specific aspect of the AI's configuration or behavior.
*   **Example (Replit):** The keyword-based organization (e.g., `<Iteration Process>`, `<Operation Principles>`) also points towards a modular approach, where different facets of the AI's operation are grouped thematically.
*   **Benefit:** Modularity helps in isolating different functionalities, making it easier to update or refine specific parts of the agent's behavior without disrupting others.

## Conclusion: Designing Effective Agentic Prompts

Designing system prompts for agentic AI requires a deliberate and structured approach. The examples from `research.learn.md` highlight several key takeaways for creating robust and predictable agentic flows:

1.  **Be Explicit:** Clearly define the agent's core operational loop, how it processes inputs, how it selects and uses tools, and how it handles outcomes.
2.  **Embrace Structure:** Use tags (like XML) or clear Markdown sectioning to organize the prompt. This helps the AI (and human developers) parse and understand the instructions.
3.  **Separate Concerns:** Where possible, separate high-level planning from low-level execution. Define distinct modules or sections for different functionalities (e.g., planning, event handling, specific operational rules).
4.  **Incorporate Comprehensive Rules:** Embed clear policies for communication, error handling, tool usage, and other critical behaviors directly into the agent's operational description.
5.  **Leverage Event-Driven Concepts:** Design the agent to be responsive to a stream of events, allowing for dynamic adaptation to changing circumstances.
6.  **Use Checklists for Complex Tasks:** For multi-step tasks, implementing a dynamic checklist mechanism (like `todo.md`) can ensure thoroughness.

By focusing on clarity, explicit process definition, modularity, and comprehensive rule sets, developers can construct system prompts that effectively guide AI agents in performing complex, multi-step tasks autonomously and reliably.

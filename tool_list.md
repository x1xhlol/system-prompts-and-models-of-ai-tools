# AI System Tools, Functions, and Commands List

This document lists tools, functions, and commands used by various AI-assisted coding systems as identified in `research.learn.md`.

## VS Code / GitHub Copilot

*   **`create_new_workspace`** (`VS Code`): Get steps to help the user create any project in a VS Code workspace. Use this tool to help users set up new projects, including TypeScript-based projects, Model Context Protocol (MCP) servers, VS Code extensions, Next.js projects, Vite projects, or any other project.
*   **`insert_edit_into_file`** (`VS Code`): Tool to edit files. Avoids repeating existing code by using comments like `// ...existing code...`.
*   **`get_errors`** (`VS Code`): Called after editing a file to validate the change and fix errors if relevant.
*   **`<invoke name="[tool_name]">`** (`VS Code`): Generic tool invocation format.
    *   `<parameter name="[param_name]">[param_value]`

## v0

*   **Node.js Executable code block** (`v0`): Allows users to execute JavaScript code.
*   **Inline SQL code block** (`v0`): Allows users to execute SQL queries directly in chat to query and modify databases.
*   **URL processing** (`v0`): Users can provide URL(s) to websites, and the system will automatically send a screenshot.
*   **"add to codebase" button** (`v0`): Installs Code Projects (code written by the AI) and handles setup of required dependencies in an existing project or helps create a new project.
*   **"Deploy" button** (`v0`): Deploys Code Projects to Vercel.
*   **`<Thinking>` tags** (`v0`): Used by the AI to think through project structure, styling, images, media, formatting, frameworks, libraries, and caveats before creating a Code Project.
*   **`<Actions>` component** (`v0`): Used to suggest relevant follow-up actions to the user.
    *   **`<Action name="..." description="..." />`** (`v0`): Defines a suggested action and its description.

## same.dev

*   **`web_search`** (`same.dev` - example JSON, platform not explicitly stated but context implies general AI tooling): Search the web for real-time text and image responses.
    *   `fetch_content` (parameter): Whether to crawl and include the content of each search result.
    *   `search_term` (parameter): The search term to look up on the web.
    *   `type` (parameter): The type of search to perform (text or images).

## Manus

The Manus system describes general capabilities and rules which imply the use of several types of tools:

*   **Message tools** (`Manus`): For communication with users. Divided into:
    *   `notify`: Non-blocking, no reply needed from users.
    *   `ask`: Blocking, reply required from users.
*   **Shell tools** (`Manus`): Access to a Linux sandbox environment. Includes ability to:
    *   Install required software packages and dependencies.
    *   Use flags like `-y` or `-f` for automatic confirmation.
    *   Chain commands with `&&`.
    *   Use pipe operator `|`.
    *   **`bc` command** (`Manus`): For simple non-interactive calculations.
    *   **`uptime` command** (`Manus`): For sandbox status check.
*   **Text editor tools** (`Manus`): For file manipulation.
*   **Browser tools** (`Manus`): To access and comprehend URLs, explore links, and extract page content.
*   **Python execution** (`Manus`): To write and run Python code, especially for complex mathematical calculations, analysis, and calling Data APIs.
*   **Deployment tools** (`Manus`): To deploy websites or applications.
    *   **Expose port tool** (`Manus`): For temporary external access to services.
*   **File tools** (`Manus`): For reading, writing, appending, and editing files.
    *   **Text replacement tool** (`Manus`): Implied by `todo_rules` for updating markers in `todo.md`.
    *   **Append mode of file writing tool** (`Manus`): For merging text files.
*   **Search tools** (`Manus`): Preferred over browser access to search engine result pages for information gathering.
*   **Data API interaction** (`Manus`): Called through Python code to access authoritative datasources. (Note: Data APIs themselves are not "tools" in this context but are accessed via Python code).

## Lovable

*   **File Operations:**
    *   **`<lov-write>`** (`Lovable`): For creating or updating files. Must include complete file contents.
    *   **`<lov-rename>`** (`Lovable`): For renaming files from original path to new path.
    *   **`<lov-delete>`** (`Lovable`): For removing files from the project.
    *   **`<lov-add-dependency>`** (`Lovable`): For installing new packages or updating existing ones.
*   **Code Block Structure:**
    *   **`<lov-code>`** (`Lovable`): To wrap all code changes and technical details.
    *   **`<lov-thinking>`** (`Lovable`): To show your thought process (optional).
    *   **`<lov-error>`** (`Lovable`): To display error messages when they occur.
    *   **`<lov-success>`** (`Lovable`): To confirm successful operations.
*   **Response Format Tags (Informational):**
    *   `<response_format>` (`Lovable`)
    *   `<user_message>` (`Lovable`)
    *   `<ai_message>` (`Lovable`)
    *   `<examples>` (`Lovable`)
    *   `<guidelines>` (`Lovable`)
    *   `<console-logs>` (`Lovable`)
    *   `<useful-context>` (`Lovable`)
    *   `<current-route>` (`Lovable`)
    *   `<instructions-reminder>` (`Lovable`)
    *   `<last-diff>` (`Lovable`)
*   **Shell Commands (Example Setup Guide):**
    *   **`git clone <YOUR_GIT_URL>`** (`Lovable`): Clones a repository.
    *   **`cd <YOUR_PROJECT_NAME>`** (`Lovable`): Navigates to a project directory.
    *   **`npm i`** (`Lovable`): Installs necessary dependencies.
    *   **`npm run dev`** (`Lovable`): Starts the development server.

## General / Unspecified Platform

*   **`<Thinking> tags`** (General, mentioned for `v0` but a general concept): To outline project requirements, user stories, and acceptance criteria before implementation.
*   **Text replacement tool** (General, implied by Manus `todo_rules`): For updating markers in todo.md or similar checklist files.
*   **File tools for reading, writing, appending, editing** (General, implied by Manus `file_rules`): Basic file operations.
*   **Search tools** (General, implied by Manus `info_rules` and `coding_rules`): For finding solutions or information.
*   **Deployment tools** (General, implied by Manus `coding_rules` and `deploy_rules`): For packaging and deploying applications.
*   **Expose port tool** (General, implied by Manus `deploy_rules`): For making services temporarily accessible.

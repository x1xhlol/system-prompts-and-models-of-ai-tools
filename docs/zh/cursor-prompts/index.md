# 文档目录

- [Agent CLI Prompt 2025-08-07](./Agent%20CLI%20Prompt%202025-08-07.md)
- [Agent Prompt 2025-09-03](./Agent%20Prompt%202025-09-03.md)
- [Agent Prompt v1.0](./Agent%20Prompt%20v1.0.md)
- [Agent Prompt v1.2](./Agent%20Prompt%20v1.2.md)
- [Agent Prompt](./Agent%20Prompt.md)
- [Agent Tools v1.0](./Agent%20Tools%20v1.0.md)
- [Chat Prompt](./Chat%20Prompt.md)
- [Memory Prompt](./Memory%20Prompt.md)
- [Memory Rating Prompt](./Memory%20Rating%20Prompt.md)

## 产品工具文档的综述

此目录包含了为AI编程助手 "Cursor" 设计的一系列核心系统提示和功能性提示。这些文件共同定义了Cursor助手的身份、行为、工具使用以及其随时间演变的各种能力。

- **`Agent Prompt` (多个版本)**: 存在多个版本的代理提示文件（如 `Agent Prompt.md`, `Agent Prompt v1.0.md`, `Agent Prompt v1.2.md`, `Agent CLI Prompt 2025-08-07.md`, `Agent Prompt 2025-09-03.md`），它们都将助手定位为一个由先进模型（如GPT-4.1, GPT-5, Claude Sonnet 4）驱动的AI编程伙伴。这些提示详细规定了助手的核心工作流程：通过工具（特别是代码搜索和文件编辑工具）理解代码库、制定计划、执行更改并进行验证。不同版本在细节上有所不同，例如：
  - **早期版本** (`v1.0`, `v1.2`) 强调了并行工具调用和上下文理解的重要性。
  - **新版** (`2025-09-03`) 引入了更结构化的工作流程，如强制使用待办事项列表（`todo_write`）来规划和跟踪任务，并对状态更新和摘要格式提出了更严格的要求。
  - **CLI版本** (`2025-08-07`) 专注于命令行交互，并详细定义了如何引用代码和格式化输出。

- **`Agent Tools v1.0.md`**: 以JSON格式详细定义了代理可用的工具集，包括代码库搜索、文件读写、终端命令执行、Mermaid图表生成等。

- **`Chat Prompt.md`**: 定义了助手在纯聊天或问答场景下的行为，此时它可能不执行代码编辑，而是提供解释和指导。

- **`Memory Prompt.md` 和 `Memory Rating Prompt.md`**: 这两个文件定义了一个“记忆”系统。`Memory Prompt` 指导AI如何判断从对话中捕获的“记忆”（如用户偏好、工作流程）是否值得长期记住，并对其进行评分。`Memory Rating Prompt` 则提供了更详细的评分标准和正反面示例，旨在让AI更准确地学习和适应用户的习惯。

总而言之，`cursor-prompts`目录通过一系列不断迭代的、功能丰富的提示文档，构建了一个高度复杂、具备学习能力且工作流程严谨的AI编程助手。该助手不仅能执行具体的编码任务，还能通过记忆系统不断优化其与用户的协作方式。

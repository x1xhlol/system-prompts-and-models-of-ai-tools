# 文档目录

- [Builder Prompt](./Builder%20Prompt.md)
- [Builder Tools](./Builder%20Tools.md)
- [Chat Prompt](./Chat%20Prompt.md)

## 产品工具文档的综述

此目录包含了为 Trae AI 编程助手设计的核心系统提示和工具集，该助手被设计为在 Trae AI IDE 中运行的强大代理。其功能通过两种不同的模式来体现：

- **Builder 模式**:
  - **`Builder Prompt.md`**: 这是 Builder 模式的核心系统提示，定义了AI助手在执行编码任务（如创建、修改、调试代码库）时的行为准则。它强调了代码更改、调试、外部API调用和沟通风格的最佳实践。
  - **`Builder Tools.md`**: 以JSON格式详细定义了 Builder 模式下可用的所有工具。这包括任务管理 (`todo_write`)、代码搜索 (`search_codebase`)、文件操作（`write_to_file`, `update_file`）、命令执行 (`run_command`) 和网页搜索 (`web_search`) 等，为AI提供了全面的开发能力。

- **Chat 模式**:
  - **`Chat Prompt.md`**: 定义了AI在与用户进行对话和问答时的行为规范。它侧重于理解用户意图，并决定是直接回答还是需要使用工具。此模式下的工具列表为空，表明其主要功能是对话而非直接操作。

总而言之，`trae` 目录通过这两种模式的定义，构建了一个既能作为强大开发代理（Builder Mode）又能作为智能对话伙伴（Chat Mode）的AI助手系统。
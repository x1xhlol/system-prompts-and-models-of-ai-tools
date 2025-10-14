# 文档目录

- [chat-titles](./chat-titles.md)
- [claude-sonnet-4](./claude-sonnet-4.md)
- [gemini-2.5-pro](./gemini-2.5-pro.md)
- [gpt-4.1](./gpt-4.1.md)
- [gpt-4o](./gpt-4o.md)
- [gpt-5-mini](./gpt-5-mini.md)
- [gpt-5](./gpt-5.md)
- [nes-tab-completion](./nes-tab-completion.md)
- [Prompt](./Prompt.md)

## 产品工具文档的综述

此目录包含了为集成在VS Code中的AI编程助手“GitHub Copilot”设计的核心指令和配置文件。这些文件共同定义了该助手的多方面行为：

- **`Prompt.md`**: 这是主要的系统提示，定义了助手的身份、高级指令、工具使用规则（如 `semantic_search`, `run_in_terminal`, `insert_edit_into_file` 等）以及文件编辑和错误处理的最佳实践。
- **特定模型提示 (例如 `gpt-4o.md`, `gemini-2.5-pro.md`, `claude-sonnet-4.md` 等)**: 这些文件为不同的大语言模型提供了定制化的指令集。虽然它们共享许多通用指令，但也包含了针对特定模型工具（如 `apply_patch`）或行为的微调，以优化其在Copilot环境中的性能。
- **功能性提示 (例如 `chat-titles.md`, `nes-tab-completion.md`)**: 这些是针对特定功能的专用提示。`chat-titles.md` 指导AI如何为聊天对话生成简洁的标题，而 `nes-tab-completion.md`（内容为空）可能用于定义与Tab键代码补全相关的功能。

总而言之，这个目录通过一个通用基础提示和多个针对不同模型及特定功能的专用提示，构建了一个复杂、分层且高度可配置的AI代理系统，使其能够在VS Code环境中高效地辅助用户完成编程任务。
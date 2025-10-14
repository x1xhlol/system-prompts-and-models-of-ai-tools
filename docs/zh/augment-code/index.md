# 文档目录

- [claude-4-sonnet-agent-prompts](./claude-4-sonnet-agent-prompts.md)
- [claude-4-sonnet-tools](./claude-4-sonnet-tools.md)
- [gpt-5-agent-prompts](./gpt-5-agent-prompts.md)
- [gpt-5-tools](./gpt-5-tools.md)

## 产品工具文档的综述

此目录包含了为AI编码助手 "Augment Agent" 设计的系统提示和工具定义，该助手由Augment Code开发，旨在通过其上下文引擎和集成访问开发者的代码库。该目录的核心是为不同的底层大语言模型提供定制化的配置。

- **Claude 4 Sonnet 版本**:
  - **`claude-4-sonnet-agent-prompts.md`**: 这是针对Claude 4 Sonnet模型的核心系统提示。它定义了Augment Agent的身份、初步任务流程（强调信息收集）、计划与任务管理（使用`add_tasks`, `update_tasks`等工具）、代码编辑规范以及包管理原则。
  - **`claude-4-sonnet-tools.md`**: 以JSON格式详细定义了在此配置下可用的工具集。这些工具包括强大的文件编辑工具`str-replace-editor`、进程管理工具（`launch-process`, `kill-process`）、代码检索工具（`codebase-retrieval`, `git-commit-retrieval`）以及任务管理工具。

- **GPT-5 版本**:
  - **`gpt-5-agent-prompts.md`**: 这是针对GPT-5模型的系统提示。与Claude版本类似，它也定义了代理的身份和行为，但在信息收集策略、计划与任务管理（特别是任务列表的触发条件和使用方式）以及代码编辑（`str_replace_editor`）等方面有更具体的指导。
  - **`gpt-5-tools.md`**: 定义了GPT-5配置下的工具集，其功能与Claude版本基本一致，但在工具描述和参数上可能存在细微差异，以更好地适配GPT-5模型的能力。

总而言之，`augment-code`目录通过为不同的LLM提供定制化的提示和工具定义，展示了一种灵活的、可适配不同模型的AI代理架构，使其能够一致地执行代码理解、计划、编辑和验证等高级开发任务。

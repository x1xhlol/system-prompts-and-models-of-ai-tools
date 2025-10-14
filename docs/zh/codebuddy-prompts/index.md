# 文档目录

- [Chat Prompt](./Chat%20Prompt.md)
- [Craft Prompt](./Craft%20Prompt.md)

## 产品工具文档的综述

此目录包含了为AI编程助手 "CodeBuddy" 设计的两种不同操作模式的系统提示。CodeBuddy被定位为一名技能高超的软件工程师，旨在帮助用户完成编码任务。

- **`Chat Prompt.md` (聊天模式)**: 此提示定义了CodeBuddy在“聊天模式”下的行为。在此模式下，助手的核心任务是与用户进行自然对话，回答问题、提供解释并讨论想法。它使用`chat_mode_respond`工具直接与用户沟通，重点在于信息收集和与用户共同制定计划，而不是立即执行代码。

- **`Craft Prompt.md` (创作模式)**: 此提示定义了CodeBuddy在“创作模式”下的行为。在此模式下，助手将扮演执行者的角色，使用一套基于XML风格标签的丰富工具集来完成具体的开发任务。这些工具包括文件操作（`read_file`, `write_to_file`, `replace_in_file`）、命令执行（`execute_command`）、代码库搜索（`search_files`）以及与外部MCP服务器交互的能力。此模式强调迭代式地、一步步地完成任务，并在每次操作后等待用户确认。

总而言之，`codebuddy-prompts`通过这两种模式的切换（由用户手动触发），构建了一个从“规划讨论”到“动手实现”的完整开发工作流，使用户能够与AI助手进行高效协作。

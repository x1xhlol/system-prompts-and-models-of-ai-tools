# 文档目录

- [Prompt](./Prompt.md)

## 产品工具文档的综述

此目录下的 `Prompt.md` 文件为名为 "Cline" 的AI助手定义了核心系统提示。Cline被定位为一名高级软件工程师，拥有广泛的编程知识。该提示详细规定了Cline如何通过一套基于XML风格标签的工具集与用户交互，以分步、迭代的方式完成编码任务。这些工具包括文件操作（`read_file`, `write_to_file`, `replace_in_file`）、命令执行（`execute_command`）、代码库搜索（`search_files`, `list_files`）以及与外部MCP服务器和浏览器交互的能力。该文档强调了在每次工具调用后等待用户确认，并根据结果调整后续步骤的迭代式工作流程。
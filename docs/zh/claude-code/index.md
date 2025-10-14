# 文档目录

- [claude-code-system-prompt](./claude-code-system-prompt.md)
- [claude-code-tools](./claude-code-tools.md)

## 产品工具文档的综述

此目录包含了为AI编程助手 "Claude Code" 设计的核心系统提示和工具集定义。Claude Code被定位为一个交互式命令行界面（CLI）工具，旨在帮助用户完成各类软件工程任务。

- **`claude-code-system-prompt.md`**: 这是Claude Code的核心系统提示，定义了其身份、沟通风格（简洁、直接）和行为准则。该提示强调了在执行任务前通过搜索工具理解代码库，并使用`TodoWrite`工具进行任务规划和跟踪。它还规定了在进行代码更改后，必须运行lint和typecheck等验证步骤，以确保代码质量。

- **`claude-code-tools.md`**: 以JSON格式详细定义了Claude Code可用的工具集。这些工具功能全面，涵盖了从代码探索（`Glob`, `Grep`, `LS`）、文件操作（`Read`, `Edit`, `Write`）到任务执行和管理（`Task`, `Bash`, `TodoWrite`）的各个方面。特别值得注意的是`Task`工具，它可以启动一个专门的子代理来处理复杂任务，以及`WebFetch`和`WebSearch`工具，用于从网络获取信息。

总而言之，这两个文件共同描绘了一个功能强大、工作流程严谨的CLI代码助手。它通过一套丰富的工具集和对任务规划、代码验证的强制要求，旨在系统化、高质量地完成用户的开发请求。

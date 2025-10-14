# 文档目录

- [Prompt](./Prompt.md)

## 产品工具文档的综述

此目录下的 `Prompt.md` 文件为名为 "Junie" 的AI助手定义了核心系统提示。Junie被设计为一个有用的助手，其主要任务是快速探索和澄清用户的想法，通过调查项目结构和从文件中检索相关代码片段或信息来辅助用户。该提示详细规定了Junie可用的特殊命令，如 `search_project`（项目内模糊搜索）、`get_file_structure`（获取文件结构大纲）以及多种文件查看命令（`open`, `open_entire_file`, `goto`, `scroll_down`, `scroll_up`）。Junie的工作流程被设计为在只读模式下运行，通过一系列命令调用来收集信息，并最终使用 `answer` 命令向用户提供全面答案。

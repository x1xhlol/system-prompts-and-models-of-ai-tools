# 文档目录

- [Decision-making prompt](./Decision-making%20prompt.md)
- [System Prompt](./System%20Prompt.md)

## 产品工具文档的综述

此目录定义了AI编码助手 "Orchids" 的核心工作流和行为准则。Orchids被设计为一个强大的代理，专门处理基于Next.js 15和Shadcn/UI的TypeScript项目。其工作流程分为两个主要阶段，由不同的提示文件来指导：

- **`Decision-making prompt.md`**: 此文件定义了Orchids的“决策与设计”阶段。在此阶段，AI负责协调工具调用，以响应用户的请求来设计应用或网站。它包含一个决策树，用于判断是应该克隆现有网站（`clone_website`工具）还是从头开始生成设计系统（`generate_design_system`工具）。完成设计后，它会通过`handoff_to_coding_agent`工具将任务移交给编码代理。

- **`System Prompt.md`**: 这是“编码代理”的核心系统提示。该代理负责接收设计并执行具体的编码任务。此提示详细规定了编码时的各项原则，如任务完成、功能保留、导航集成、错误修复、UI/UX设计和工具调用等。它特别强调了代码编辑的格式要求（`edit_file_format_requirements`）、并行工具调用的策略以及如何使用专门的子代理（如`use_database_agent`, `use_auth_agent`）来处理数据库、身份验证和支付等复杂功能。

总而言之，`orchidsapp`通过这种设计与编码分离的两阶段方法，构建了一个结构清晰、职责分明的AI开发流程，旨在高效地将用户需求从抽象的设计概念转化为具体的、高质量的代码实现。
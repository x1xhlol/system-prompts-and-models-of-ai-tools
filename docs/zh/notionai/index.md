# 文档目录

- [Prompt](./Prompt.md)
- [tools](./tools.md)

## 产品工具文档的综述

此目录包含了为 "Notion AI" 设计的核心系统提示和工具集定义。Notion AI 是一个深度集成在 Notion 工作区内的AI代理，旨在通过聊天界面帮助用户管理和操作其Notion内容。

- **`Prompt.md`**: 这是核心的系统提示，定义了Notion AI的身份、行为准则和交互逻辑。它详细阐述了Notion的核心概念（工作区、页面、数据库、数据源、视图），并为AI如何理解和操作这些实体提供了具体指导。该提示还包含了内容起草、编辑、搜索策略以及如何处理空白页面和锁定页面的详细规则。

- **`tools.md`**: 以JSON格式详细定义了Notion AI可用的所有工具。这些工具赋予了AI直接操作Notion内容的能力，主要包括：
  - **查看**: `view` (查看页面、数据库等实体的详细信息)
  - **搜索**: `search` (在工作区、第三方连接器或网络上执行搜索)
  - **页面操作**: `create-pages`, `update-page`, `delete-pages`
  - **数据库操作**: `query-data-sources`, `create-database`, `update-database`

总而言之，这两个文件共同描绘了一个功能强大的、特定领域（Notion）的AI助手。它通过一套精确的工具集和详细的行为指南，能够理解并执行用户在Notion环境中的各种复杂请求，从简单的页面编辑到复杂的数据库查询和管理。
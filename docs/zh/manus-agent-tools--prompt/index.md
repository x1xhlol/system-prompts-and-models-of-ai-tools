# 文档目录

- [Agent loop](./Agent%20loop.md)
- [Modules](./Modules.md)
- [Prompt](./Prompt.md)
- [tools](./tools.md)

## 产品工具文档的综述

此目录包含了为AI代理 "Manus" 设计的完整系统提示、模块定义和工具集。Manus被定位为一个多才多艺的AI代理，擅长信息收集、数据处理、内容创作和软件开发等多种任务。

- **`Prompt.md` 和 `Modules.md`**: 这两个文件共同定义了Manus的核心身份、能力和工作流程。它们描述了Manus如何在一个包含`Planner`（任务规划）、`Knowledge`（知识库）和`Datasource`（数据API）等模块的系统中运作。Manus通过分析事件流（用户消息、工具执行结果等）来迭代地完成任务，并强调了信息获取的优先级（API > 网络搜索 > 内部知识）。

- **`Agent loop.md`**: 此文件简要概括了Manus的核心代理循环：分析事件 -> 选择工具 -> 等待执行 -> 迭代 -> 提交结果 -> 进入待机。这个循环是其自主完成任务的基础。

- **`tools.md`**: 以JSON格式详细定义了Manus可用的庞大工具集。这些工具赋予了Manus全面的操作能力，包括：
  - **通信**: `message_notify_user`, `message_ask_user`
  - **文件系统**: `file_read`, `file_write`, `file_find_by_name` 等
  - **Shell操作**: `shell_exec`, `shell_view`, `shell_kill_process` 等
  - **浏览器交互**: `browser_navigate`, `browser_click`, `browser_input`, `browser_console_exec` 等，提供了强大的网页自动化能力。
  - **信息与部署**: `info_search_web`, `deploy_expose_port`, `deploy_apply_deployment`

总而言之，这些文档共同描绘了一个高度模块化、工具驱动的通用AI代理。Manus通过其强大的工具集和结构化的代理循环，能够在沙箱环境中自主地、系统地完成从信息处理到软件部署的各类复杂任务。
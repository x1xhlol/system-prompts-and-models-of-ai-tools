# 文档目录

- [phase_mode_prompts](./phase_mode_prompts.md)
- [phase_mode_tools](./phase_mode_tools.md)
- [plan_mode_tools](./plan_mode_tools.md)

## 产品工具文档的综述

此目录定义了 Traycer.AI 助手的核心操作逻辑，该助手被设计为一个在IDE中运行的技术主管，能够将复杂的编码任务分解为高层次的阶段。其功能通过两种不同的模式实现，每种模式都有其专用的系统提示和工具集。

- **阶段模式 (Phase Mode)**:
  - **`phase_mode_prompts.md`**: 定义了AI在此模式下的角色——作为技术主管，专注于将用户查询分解为高层次阶段，并且只对代码库有只读访问权限。
  - **`phase_mode_tools.md`**: 提供了此模式下可用的工具集，主要包括代码探索（如 `read_file`, `grep_search`）、代码导航（如 `find_references`, `go_to_definition`）以及最终用于输出阶段性计划的 `write_phases` 工具。

- **计划模式 (Plan Mode)**:
  - **`plan_mode_tools.md`**: 定义了在计划模式下可用的工具。此模式下的工具集与阶段模式类似，但增加了用于复杂推理的 `think` 工具，以及用于创建和移交任务给专门代理的 `agent` 和 `hand_over_to_approach_agent` 工具，显示出此模式更侧重于详细的实施计划制定和任务分配。

总而言之，`traycer-ai` 通过这两种模式的定义，构建了一个能够从高层次任务分解到详细实施计划制定的双层AI代理系统，旨在系统化地解决复杂的软件工程任务。
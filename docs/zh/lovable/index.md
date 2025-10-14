# 文档目录

- [Agent Prompt](./Agent%20Prompt.md)
- [Agent Tools](./Agent%20Tools.md)

## 产品工具文档的综述

此目录包含了为AI编辑器 "Lovable" 设计的核心系统提示和工具集。Lovable被定位为一个在浏览器内实时创建和修改Web应用程序的AI助手，其技术栈基于React、Vite、Tailwind CSS和TypeScript，并与Supabase有原生集成。

- **`Agent Prompt.md`**: 这是Lovable的核心系统提示，定义了其身份、界面布局、技术栈限制以及行为准则。该提示强调了在编码前先与用户讨论和规划，并遵循“完美的架构”和“最大化效率”（特别是并行工具调用）的原则。它还详细规定了SEO最佳实践、调试指南、设计原则（强调设计系统和避免临时样式）以及一个明确的、从检查上下文到实施和验证的必要工作流程。

- **`Agent Tools.md`**: 以JSON格式详细定义了Lovable可用的庞大工具集。这些工具功能全面，覆盖了软件开发的各个方面，包括：
  - **文件与依赖管理**: `lov-add-dependency`, `lov-write`, `lov-line-replace`, `lov-rename`, `lov-delete` 等。
  - **代码与网络探索**: `lov-search-files`, `lov-fetch-website`, `websearch--web_search`。
  - **调试与分析**: `lov-read-console-logs`, `lov-read-network-requests`, `analytics--read_project_analytics`。
  - **第三方集成**: 包含`supabase--*`, `imagegen--*`, `stripe--*`, `security--*`等多个与Supabase、图像生成、Stripe支付和安全扫描相关的专用工具。

总而言之，这两个文件共同描绘了一个功能极其强大、工具集极为丰富的AI Web开发助手。它不仅能够处理代码的创建和修改，还能进行调试、分析、设计、搜索、安全扫描，并深度集成多种第三方服务，旨在提供一个一站式的、在浏览器内完成Web应用开发的完整体验。
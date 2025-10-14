# 文档目录

- [Prompt](./Prompt.md)
- [Tools](./Tools.md)

## 产品工具文档的综述

此目录包含了为Vercel的AI助手 "v0" 设计的核心系统提示和工具集定义。这些文档共同构成了v0在代码生成和项目开发中的行为准则与能力边界。

- **`Prompt.md`**: 该文件是v0的核心系统提示，详细规定了其身份、编码指南、设计原则（颜色、排版、布局）、与第三方库的集成方式（如Supabase, Neon, Stripe）以及响应用户的对齐策略。它强调了v0在生成Next.js应用、处理文件、使用特定组件（如shadcn/ui）以及与AI SDK交互时的最佳实践。

- **`Tools.md`**: 该文件以JSON格式定义了v0可用的13个核心工具。这些工具覆盖了从代码库探索（`GrepRepo`, `LSRepo`, `ReadFile`）、网络搜索（`SearchWeb`）、开发辅助（`InspectSite`, `TodoManager`）到设计与集成（`GenerateDesignInspiration`, `GetOrRequestIntegration`）的全部功能。每个工具都有明确的描述、参数和使用场景，是v0执行具体开发任务的基础。

总而言之，这两个文件共同描绘了一个功能强大且遵循严格规范的AI助手，它能够通过定义的工具集和行为准则，高效地完成从设计构思到代码实现的全栈开发任务。
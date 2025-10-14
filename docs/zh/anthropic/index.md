# 文档目录

- [Claude Code 2.0](./Claude%20Code%202.0.md)
- [Sonnet 4.5 Prompt](./Sonnet%204.5%20Prompt.md)

## 产品工具文档的综述

此目录包含了为Anthropic公司开发的AI助手Claude设计的两份核心系统提示，分别对应其在不同产品或版本中的具体应用。

- **`Claude Code 2.0.md`**: 此文件为名为 "Claude Code" 的交互式CLI工具定义了系统提示。该提示将Claude定位为一个软件工程任务助手，强调了其简洁、直接的沟通风格和结构化的任务处理流程。它强制要求使用`TodoWrite`工具进行任务规划和跟踪，并在代码更改后运行lint和typecheck等验证步骤，以确保代码质量。此外，它还规定了如何通过`WebFetch`工具查阅官方文档来回答关于产品自身的问题。

- **`Sonnet 4.5 Prompt.md`**: 此文件是基于Sonnet 4.5模型的通用Claude助手的系统提示。它定义了Claude作为一个知识渊博、富有同理心且具有智识好奇心的对话伙伴的身份。该提示详细阐述了Claude的行为准则，包括其知识截止日期、内容安全策略、回复语气和格式、以及何时使用网络搜索（`web_search`）。特别值得注意的是，它引入了“工件（Artifacts）”的概念，指导Claude如何将实质性的、高质量的输出（如代码、文档、报告）封装在`<artifact>`标签中，并为不同类型的工件（代码、Markdown、HTML、React组件等）提供了详细的实现规范。

总而言之，`anthropic`目录通过这两份提示，展示了Claude模型在不同应用场景下的两种形态：一个是严谨、流程化的CLI代码助手（Claude Code），另一个是功能强大、注重高质量内容生成和用户体验的通用对话助手（Sonnet 4.5）。

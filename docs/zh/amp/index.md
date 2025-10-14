# Amp (中文)

# 如何获取 [Amp](https://ampcode.com) 的系统提示词

1. 使用 VScode 登录 Amp
2. 向 Amp 发送一个简短的查询
3. 按住 Alt (Windows) 或 Option (macOS) 并点击工作区按钮

![](./view-thread-yaml.png)

4. 点击查看线程 YAML

# 注意事项

Amp 使用的系统提示词针对 Sonnet 4.x 进行了调优，并将其他 LLM 注册为工具（"oracle"）。要获取针对 `GPT-5` 调优的系统提示词，需要在 VSCode 用户设置中配置以下内容，然后再次按照上述步骤操作：

```json
{
    "amp.url": "https://ampcode.com/",
    "amp.gpt5": true
}
```

## 产品工具文档的综述

此目录包含了为AI编码代理 "Amp" 设计的系统提示。Amp由Sourcegraph构建，旨在帮助用户完成软件工程任务。该目录下的文件展示了Amp如何针对不同的底层大语言模型进行配置和优化。

- **`claude-4-sonnet.md`**: 这是为Amp配置的、针对Anthropic的Claude Sonnet 4模型的系统提示。它详细定义了Amp的代理行为、任务管理（`todo_write`工具）、代码约定和沟通风格。一个核心特性是频繁使用`oracle`工具，这是一个由其他LLM（如此处的GPT-5）扮演的专家顾问，用于在规划、审查和调试复杂任务时提供指导。

- **`gpt-5.md`**: 这是为Amp配置的、针对OpenAI的GPT-5模型的系统提示。此版本同样定义了Amp的代理行为，但更强调并行执行策略（`Parallel Execution Policy`）、快速上下文理解和严格的护栏（Guardrails）规则。它也提到了使用`oracle`（此处可能由Claude Sonnet 4扮演）和其他子代理（`Task`, `Codebase Search`）来协同完成任务。

总而言之，`amp`目录通过为不同的LLM提供定制化的系统提示，展示了一种灵活的、多模型协作的AI代理架构。它利用一个主模型（如Claude Sonnet 4）来执行任务，同时将另一个强大的模型（如GPT-5）作为“神谕”（oracle）工具来提供专家建议，从而实现更强大和可靠的编程辅助能力。

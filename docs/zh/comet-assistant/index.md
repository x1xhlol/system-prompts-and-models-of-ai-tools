# 文档目录

- [System Prompt](./System%20Prompt.md)

## 产品工具文档的综述

此目录下的 `System Prompt.md` 文件为名为 "Comet Assistant" 的AI代理定义了核心系统提示。Comet Assistant由Perplexity创建，是一个在Perplexity Comet网页浏览器中运行的自主网页导航代理。其核心目标是通过持续、战略性地执行函数调用来完成用户基于网页的请求。该提示详细规定了代理的核心身份、行为准则、输出协议（可选的1-2句状态更新+必需的函数调用）以及任务终止逻辑（`return_documents`函数）。它还包含了关于处理身份验证、页面元素交互、安全性和错误处理的具体规则，并强调了在遇到障碍时应持续尝试所有合理策略，永不轻易放弃。

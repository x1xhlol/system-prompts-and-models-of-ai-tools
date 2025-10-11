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
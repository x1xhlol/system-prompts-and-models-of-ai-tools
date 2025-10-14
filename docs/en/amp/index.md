# Amp (EN)

# How to obtain the system prompt for [Amp](https://ampcode.com)

1. Login with Amp using VScode
2. Issue a short query into Amp
3. Hold down Alt (windows) or Option (macOS) and click on the workspace button

![](./view-thread-yaml.png)

4. Click view Thread YAML

# Notes

The system prompt used by Amp is tuned to Sonnet 4.x and has other LLMs registered into it as tools ("the oracle"). To obtain the `GPT-5` tuned system prompt then you need to configure VSCode user settings with the following and then follow the steps above again

```json
{
    "amp.url": "https://ampcode.com/",
    "amp.gpt5": true
}
```

## Summary of Product Tool Documents

This directory contains system prompts designed for the AI coding agent "Amp". Built by Sourcegraph, Amp is designed to help users with software engineering tasks. The files in this directory demonstrate how Amp is configured and optimized for different underlying large language models.

- **`claude-4-sonnet.md`**: This is the system prompt configured for Amp, targeting Anthropic's Claude Sonnet 4 model. It defines in detail Amp's agent behavior, task management (`todo_write` tool), code conventions, and communication style. A core feature is the frequent use of the `oracle` tool, an expert consultant played by another LLM (in this case, GPT-5), used for guidance in planning, reviewing, and debugging complex tasks.

- **`gpt-5.md`**: This is the system prompt configured for Amp, targeting OpenAI's GPT-5 model. This version also defines Amp's agent behavior but places more emphasis on a Parallel Execution Policy, rapid context understanding, and strict Guardrails. It also mentions the use of an `oracle` (possibly played by Claude Sonnet 4 here) and other sub-agents (`Task`, `Codebase Search`) to complete tasks collaboratively.

In summary, the `amp` directory showcases a flexible, multi-model collaborative AI agent architecture by providing customized system prompts for different LLMs. It utilizes a primary model (like Claude Sonnet 4) to execute tasks while using another powerful model (like GPT-5) as an "oracle" tool to provide expert advice, thereby achieving more powerful and reliable programming assistance capabilities.
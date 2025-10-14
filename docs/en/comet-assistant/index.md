# Comet Assistant

- [System Prompt](./System%20Prompt.md)

## Summary of Product Tool Documents

The `System Prompt.md` file in this directory defines the core system prompt for the AI agent named "Comet Assistant". Created by Perplexity, Comet Assistant is an autonomous web navigation agent that runs in the Perplexity Comet web browser. Its core objective is to complete user's web-based requests through continuous and strategic execution of function calls. The prompt details the agent's core identity, code of conduct, output protocol (optional 1-2 sentence status update + required function call), and task termination logic (`return_documents` function). It also includes specific rules for handling authentication, page element interaction, security, and error handling, and emphasizes that when encountering obstacles, all reasonable strategies should be continuously attempted and never given up easily.
# Kiro

- [Mode_Clasifier_Prompt](./Mode_Clasifier_Prompt.md)
- [Spec_Prompt](./Spec_Prompt.md)
- [Vibe_Prompt](./Vibe_Prompt.md)

## Summary of Product Tool Documents

This directory contains multiple system prompts designed for the AI assistant "Kiro," which is positioned as an AI partner assisting developers within the IDE. Its workflow is managed through different "modes," each with its specific responsibilities and prompts.

- **`Vibe_Prompt.md`**: This is Kiro's core identity and code of conduct, defining its knowledgeable, supportive, and easygoing personality. It details Kiro's capabilities, communication style, safety rules, and how to leverage its key features such as autonomous mode, chat context, Steering, Spec, and Hooks.

- **`Mode_Clasifier_Prompt.md`**: This prompt file defines an intent classifier. Its sole job is to analyze the user's conversation history and classify their intent into either "Do Mode" (executing specific tasks) or "Spec Mode" (handling formal specification documents). This classifier is the first step in Kiro's decision-making process for adopting a workflow.

- **`Spec_Prompt.md`**: This is Kiro's dedicated system prompt for "Spec Mode". In this mode, Kiro acts as a technical documentation expert, following a structured workflow to create and iterate on functional specifications. This workflow includes three phases: requirements gathering, functional design, and task list creation, each requiring explicit user approval before proceeding to the next step.

In summary, the `kiro` directory, through these different prompt files, builds a multi-mode, multi-stage AI assistant system. This system first determines user intent via a classifier and then enters different working modes (such as Spec Mode) based on the intent, helping users complete the entire early software development process from requirements analysis to implementation planning in a structured and iterative manner.
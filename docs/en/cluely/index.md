# Cluely

- [Default Prompt](./Default%20Prompt.md)
- [Enterprise Prompt](./Enterprise%20Prompt.md)

## Summary of Product Tool Documents

This directory contains system prompts designed for the AI assistant "Cluely" for two different application scenarios. Cluely is positioned as an AI assistant capable of analyzing and solving user problems, with its behavior and response format adjusted according to its operating environment (general scenarios or enterprise meetings).

- **`Default Prompt.md`**: This prompt defines Cluely's code of conduct in general scenarios. It emphasizes specific, accurate, and actionable responses, and provides detailed response formats and structures for different types of questions (technical, mathematical, multiple-choice, email, UI navigation). For example, technical questions require code with line-by-line comments, and math problems require the use of LaTeX and double-checking. The prompt also specifies how to cautiously provide guesses when the user's intent is unclear.

- **`Enterprise Prompt.md`**: This prompt positions Cluely as a "real-time meeting co-pilot," with the primary goal of assisting users who are in an audio conversation. It establishes a response priority system: first, answer questions directly raised in the conversation; second, define proper nouns that appear at the end of the conversation; then, ask follow-up questions to advance the discussion when the conversation stagnates; and finally, handle objections in scenarios such as sales. The prompt has strict requirements for the response structure (short title, main points, sub-details, detailed explanation) and guides the AI on how to handle imperfect real-time speech transcription.

In summary, the `cluely` directory, through these two different prompt files, demonstrates how to deeply customize a core AI assistant for different application scenarios, enabling it to serve as both a general Q&A and technical support tool, and a professional co-pilot providing context-aware assistance in real-time meetings.
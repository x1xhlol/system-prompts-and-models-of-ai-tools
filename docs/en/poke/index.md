# Poke

- [Poke agent](./Poke%20agent.md)
- [Poke_p1](./Poke_p1.md)
- [Poke_p2](./Poke_p2.md)
- [Poke_p3](./Poke_p3.md)
- [Poke_p4](./Poke_p4.md)
- [Poke_p5](./Poke_p5.md)
- [Poke_p6](./Poke_p6.md)

## Summary of Product Tool Documents

This directory contains the complete system prompts and behavioral guidelines designed for the AI assistant "Poke". Poke is designed as a personal assistant that interacts with users via instant messaging (iMessage/WhatsApp/SMS), backed by a complex multi-agent system.

- **`Poke agent.md`**: Defines the role and responsibilities of the backend agent as the "execution engine". This agent is responsible for executing tasks assigned by Poke (the user-facing assistant) but cannot directly interact with users. It emphasizes the ability to execute tasks in parallel, use triggers (automation and reminders), and integrate with third-party services like Notion and Linear.

- **`Poke_p1.md` to `Poke_p6.md`**: These files are detailed system prompts for the main assistant Poke, elaborated in multiple parts:
  - **P1 (Personality and Functions)**: Defines Poke's identity as a brand ambassador, its enthusiastic and witty personality, adaptable communication style, and logic for handling different types of messages (user, agent, automation, etc.).
  - **P2 (Limitations and Strategies)**: Explains WhatsApp's 24-hour message window limit, rules for interpreting emoji reactions, and strategies for collaborating with backend agents via the `sendmessageto_agent` tool.
  - **P3 (Error Handling and Drafts)**: Specifies how to handle user dissatisfaction, how to silently cancel erroneous triggers, and how to confirm drafts with users via the `display_draft` tool before sending emails or calendar events.
  - **P4 (Integrations and Context)**: Describes integrations with services like Notion and Linear, and defines the priority hierarchy of context when processing user requests. It also includes notes on Poke's brand background and security/privacy policies.
  - **P5 & P6 (Protocols and Memory)**: Details email link protocols, notification formats, and how the system automatically handles memory and long conversation summaries to maintain conversational continuity.

In summary, these documents collectively build a complex and human-like AI assistant system that works collaboratively through a user-facing "Poke" assistant with a distinct personality and a powerful backend execution agent, providing comprehensive personal assistant services to users.
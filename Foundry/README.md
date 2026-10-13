# Foundry AI Worker System Prompts & State-Management Protocols

Foundry is an open-source, zero-dependency local AI worker control room built on Node.js that coordinates autonomous CLI agents and multi-agent teams.

---

## 1. System Prompt

```text
You are an autonomous AI agent operating natively inside Foundry, a multi-agent workspace environment. You have direct access to the local system, the active project context, and your AI teammates. Do not claim you lack access to the system or communication tools.

TALKING TO / ACTIVATING TEAMMATES — you can send ANY teammate a message or a task and get their reply back live, EVEN IF THEY ARE ON A DIFFERENT TEAM.
To send a message, you MUST output a valid, JSON-escaped block inside a markdown json block:

```json
{
  "sendMessage": {
    "recipientId": "teammate_id",
    "content": "task or message content"
  }
}
```

For multiple @mentions in a single prompt, output separate JSON objects sequentially or an array of objects:
```json
[
  {
    "sendMessage": {
      "recipientId": "teammate_1",
      "content": "Task for teammate 1"
    }
  },
  {
    "sendMessage": {
      "recipientId": "teammate_2",
      "content": "Task for teammate 2"
    }
  }
]
```

CRITICAL — @MENTIONS ARE DELEGATION ORDERS: when the user @mentions teammates, you MUST send EACH @mentioned teammate their task using the JSON block above.
```

---

## 2. Message Escaping & Formatting Rules

When constructing `sendMessage` payloads:
- **String Escaping**: All strings in `recipientId` and `content` MUST adhere to standard JSON escaping rules (RFC 8259). Double quotes (`"`), backslashes (`\`), and control characters (such as newlines `\n` and tabs `\t`) must be escaped properly.
- **Multiple Recipients**: When delegating to multiple teammates in one turn, agents MUST output a JSON array of `sendMessage` objects.
- **Invalid Output Handling**: If an agent emits malformed JSON or unescaped characters, the Foundry runtime captures the output, logs a syntax warning in the execution trace, and prompts the agent with a format correction retry request.

### Escaping Example (Multiline & Quoted Content)
```json
{
  "sendMessage": {
    "recipientId": "backend_dev",
    "content": "Please review line 45 in \"server.js\":\n```js\nconst path = require(\"path\");\n```"
  }
}
```

---

## 3. State-Management & Worker Lifecycle Contract

Foundry manages worker tasks via an event-driven state machine:

### State Transitions & Lifecycle

```
[ PENDING ] ──( Dispatch )──> [ RUNNING ] ──( Complete )──> [ COMPLETED ]
                                  │
                             ( Fail / Retry )
                                  ▼
                             [ FAILED ] ──( Max Retries Exceeded )──> [ DEAD_LETTER ]
```

1. **PENDING**: Task created and assigned unique UUID `taskId`.
2. **RUNNING**: Worker picks up `taskId`, updates state, and executes local tools.
3. **COMPLETED**: Worker returns final execution result payload with acknowledgment (`ack: true`).
4. **FAILED**: If execution errors occur, worker retries up to 3 times with exponential backoff before transitioning to `DEAD_LETTER`.

### Message Payload Schema

```json
{
  "taskId": "task-uuid-v4-8f92",
  "messageId": "msg-uuid-v4-01a4",
  "senderId": "orchestrator",
  "recipientId": "code_auditor",
  "state": "RUNNING",
  "retryCount": 0,
  "maxRetries": 3,
  "idempotencyKey": "idem-key-88912",
  "ack": true,
  "payload": {
    "command": "audit_security",
    "target": "server.js"
  }
}
```

---

## 4. Repository & Architecture Links
- [Foundry GitHub Repository](https://github.com/harelos/foundry)
- **License**: MIT
- **Runtime**: Pure Node.js (Zero external npm dependencies)

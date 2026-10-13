# Mail module

- Use when you need Mail tools.
- Start in `index.ts` for tool inputs/outputs. Call the direct functions on the module (e.g. `searchEmails`, `viewThreadContent`, `updateStatus`).
- Permissions live in `integration.ts`.
- Trigger payloads live in `triggers.ts`.
- Read `skills/mail-guidelines.md` for detailed instructions on email address rules, draft tool selection, and mail best practices.
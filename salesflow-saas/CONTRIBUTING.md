# Contributing to Dealix

## Ground Rules

1. **No secrets.** Never commit `.env` files, API keys, private keys, certificates, or credentials.
2. **No `.env` files.** Use `.env.example` with placeholder values only.
3. **No key files.** Files matching `*.pem`, `*.key`, `*.crt`, `*.p12` must never be tracked.
4. **Small, auditable changes.** Each pull request should do one thing and be easy to review.
5. **Clear commit messages.** Use prefixed format:
   - `fix:` - Bug fix
   - `feat:` - New feature
   - `docs:` - Documentation only
   - `refactor:` - Code restructuring without behavior change
   - `test:` - Adding or updating tests
   - `chore:` - Tooling, CI, dependencies
6. **Branch from `main`.** Create a feature branch, open a PR back to `main`.

## Workflow

```
git checkout main
git pull origin main
git checkout -b feat/your-feature
# make changes
git add <specific files>
git commit -m "feat: describe your change"
git push origin feat/your-feature
# open a Pull Request
```

## What We Review

- No secrets or credentials in diff
- Scoped to a single concern
- Tests pass (if applicable)
- Consistent with existing code style
- No unnecessary files (logs, build artifacts, IDE configs)

## Questions

Open a discussion or contact the maintainer before starting large changes.

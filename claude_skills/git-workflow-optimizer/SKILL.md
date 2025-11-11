---
name: git-workflow-optimizer
description: Expert in Git workflows, branching strategies, merge strategies, conflict resolution, and Git best practices. Use for optimizing Git workflows, resolving complex merge conflicts, or setting up branching strategies.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# Git Workflow Optimizer

## Purpose
Optimize Git workflows with best practices for branching, merging, and collaboration.

## Branching Strategies

### Git Flow
```bash
# Main branches
main    # Production code
develop # Development integration

# Supporting branches
feature/user-auth
release/1.2.0
hotfix/critical-bug

# Workflow
git checkout develop
git checkout -b feature/new-feature
# ... work ...
git checkout develop
git merge --no-ff feature/new-feature
```

### GitHub Flow (Simpler)
```bash
# Only main branch + feature branches
main
feature/user-profile
feature/api-endpoints

# Workflow
git checkout -b feature/user-profile
# ... work ...
git push origin feature/user-profile
# Create PR → Review → Merge to main
```

### Trunk-Based Development
```bash
# Short-lived branches
main
short-lived-feature  # Max 1-2 days

# Frequent integration to main
git checkout -b quick-feature
# ... small change ...
git push && create PR
# Merge immediately after review
```

## Commit Best Practices

```bash
# Conventional Commits
feat: add user authentication
fix: resolve login redirect issue
docs: update API documentation
style: format code with prettier
refactor: extract user service
test: add integration tests
chore: update dependencies

# Good commit message
feat(auth): implement JWT token refresh

- Add refresh token endpoint
- Store refresh tokens in Redis
- Set 7-day expiry on refresh tokens
- Update auth middleware to handle refresh

Closes #123

# Atomic commits
git add -p  # Stage hunks interactively
git commit -m "fix: resolve validation error"
```

## Conflict Resolution

```bash
# When conflict occurs
git merge feature-branch
# CONFLICT in file.ts

# Option 1: Manual resolution
vim file.ts  # Resolve conflicts
git add file.ts
git commit

# Option 2: Use merge tool
git mergetool

# Option 3: Choose one side
git checkout --ours file.ts   # Keep your version
git checkout --theirs file.ts # Use their version

# Abort merge if needed
git merge --abort
```

## Useful Commands

```bash
# Interactive rebase (clean history)
git rebase -i HEAD~3

# Squash commits
git rebase -i main
# Mark commits as 'squash' or 'fixup'

# Cherry-pick specific commits
git cherry-pick abc123

# Find when bug was introduced
git bisect start
git bisect bad  # Current is bad
git bisect good v1.0  # v1.0 was good
# Git checks out middle commit
# Test and mark good/bad until found

# Clean up branches
git branch --merged | grep -v "\*\|main\|develop" | xargs -n 1 git branch -d

# Stash changes
git stash save "WIP: working on feature"
git stash list
git stash pop

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Amend last commit
git commit --amend --no-edit
```

## Success Criteria
- ✓ Clear branching strategy
- ✓ Descriptive commit messages
- ✓ Clean commit history
- ✓ No merge conflicts
- ✓ Regular integration


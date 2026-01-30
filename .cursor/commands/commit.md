# commit.md

# commit

Act as a senior software engineer to commit changes to the repository using **Conventional Commits**:

"$type${[(scope)]}{[!]}: $description"

## Notes
- Square brackets **[]** indicate optional parts.
- "!" marks a **breaking change** (also add a `BREAKING CHANGE:` footer in the body).
- Keep the first line ≤ **50 chars**. Wrap body at ~72 cols.

## Types
fix | feat | chore | docs | refactor | test | perf | build | ci | style | revert | other

## Scope
Use a concise module or area: e.g., `api`, `auth`, `ui`, `parser`, `db`, `infra`.

## When logs are missing
If we haven't logged the latest changes yet, open **@log.md** and log changes **first** (top of the file, reverse-chronological), then commit.

---

## Constraints
- Do **not** mention "logging" in commit messages.
- Use **multiple `-m` flags**, one per log entry (subject & body as needed).
- Use **Conventional Commits** with scope, title, and body.
- Include footers when applicable:
  - Issue links: `Fixes #123`, `Closes #456`
  - Co-authors: `Co-authored-by: Name <email@domain>`
  - Breaking: `BREAKING CHANGE: <migration notes>`

---

## Commit Flow
1) Stage and preview:
```bash
git add -A
git --no-pager diff --cached

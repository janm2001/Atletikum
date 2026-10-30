# Git workflow

- Start each new feature or distinct task on a new `codex/` branch based on the latest `main`. Do not implement changes directly on `main`.
- Keep related changes together on their task branch.
- Merge into `main` only when the user requests it. After an authorized merge, create and switch to a fresh `codex/` branch from the updated `main` for the next task.
- Preserve existing work and never force-push or discard unrelated changes.

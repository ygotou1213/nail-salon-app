# Workflow

This project is a Git repository and should normally be maintained directly on `main`.

## Git rules

- Start with `git status -sb`.
- Keep `.claude/`, `.DS_Store`, and other local-only tooling paths untracked unless intentionally needed.
- Commit and push each completed modification.

## Verification checklist

1. Open the page locally when UI or markup changes are made.
2. Review the diff for temporary notes, local-only files, or debug snippets.
3. Check that ignored local folders remain untracked before committing.

## Project notes

- Use clear commit messages because this project appears to carry user-facing feature work.
- Review browser-facing changes locally before shipping when possible.
- For GAS/Google Sheets date fields, always store or return canonical strings
  (`YYYY-MM` or `YYYY-MM-DD`) and normalize on both read and write. Sheets may
  auto-convert strings into Date objects, which can shift display keys and break
  month/date matching in the SPA.

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

## API app

The `api/` directory is a standalone Next.js App Router app intended for Vercel.
It must not replace the existing GitHub Pages `index.html` deployment until a
planned cutover is approved.

Required environment variables are documented in `api/.env.example`:

- `GAS_URL`
- `GAS_SERVER_TOKEN`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`

Before production rollout, confirm the Google Sheets backup, current GitHub
Pages commit, current GAS deployment ID, Vercel environment variables, and the
rollback window. If staff clock-in/out breaks, roll back the frontend and GAS
deployment before continuing diagnosis.

## Project notes

- Use clear commit messages because this project appears to carry user-facing feature work.
- Review browser-facing changes locally before shipping when possible.
- For GAS/Google Sheets date fields, always store or return canonical strings
  (`YYYY-MM` or `YYYY-MM-DD`) and normalize on both read and write. Sheets may
  auto-convert strings into Date objects, which can shift display keys and break
  month/date matching in the SPA.

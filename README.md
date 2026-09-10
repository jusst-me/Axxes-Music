# Axxes Music

A collaborative playlist application: browse a music catalog, build playlists together, reorder them by
pointer or keyboard, and play preview clips. Available in English, Dutch and German.

Project documentation lives in [`docs/`](./docs/README.md) — scope, technical decisions, architecture,
backlog and delivery plan.

## Requirements

- Node.js 24 or newer (see `.nvmrc`)
- pnpm 11

## Getting started

```bash
pnpm install
pnpm dev
```

The application runs at http://localhost:3000.

## Scripts

| Script                | Purpose                                        |
| --------------------- | ---------------------------------------------- |
| `pnpm dev`            | Start the development server                   |
| `pnpm build`          | Production build                               |
| `pnpm start`          | Serve the production build                     |
| `pnpm lint`           | Run ESLint                                     |
| `pnpm lint:fix`       | Run ESLint and apply fixes                     |
| `pnpm prettier`       | Format the codebase                            |
| `pnpm prettier:check` | Verify formatting without writing              |
| `pnpm typecheck`      | Type-check without emitting                    |
| `pnpm check`          | Everything CI runs: lint, formatting and types |

## Commit conventions

Commits follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) and branches use
a `feature/` or `hotfix/` prefix. Two Git hooks enforce this:

- **pre-commit** runs ESLint and Prettier over the staged files only.
- **commit-msg** validates the message against the Conventional Commits specification.

The hooks install themselves through the `prepare` script when you run `pnpm install`.

If a hook blocks an urgent commit, bypass it with `git commit --no-verify`. Use this sparingly: CI runs
the same checks and will fail the pull request regardless.

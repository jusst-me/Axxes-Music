# Axxes Music

[![CI](https://github.com/jusst-me/Axxes-Music/actions/workflows/ci.yml/badge.svg)](https://github.com/jusst-me/Axxes-Music/actions/workflows/ci.yml)

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
cp .env.dist .env   # then fill in DATABASE_URL and AUTH_SECRET
pnpm db:deploy
pnpm db:seed
pnpm dev
```

The application runs at http://localhost:3000.

## Database

Postgres, accessed through Prisma. `.env.dist` lists the variables that must be set; `DATABASE_URL`
points at a Neon database, one branch per environment.

The Prisma client is generated rather than committed. `build` and `typecheck` regenerate it themselves,
because a host that restores a dependency cache skips `postinstall` and would otherwise type-check
against a client that is not there.

The seed imports a catalog from the iTunes Search API and creates a demo account; it uses upserts and
is safe to re-run.

| Script            | Purpose                                            |
| ----------------- | -------------------------------------------------- |
| `pnpm db:migrate` | Create and apply a migration after a schema change |
| `pnpm db:deploy`  | Apply existing migrations, for CI and production   |
| `pnpm db:seed`    | Import the catalog and create the demo account     |
| `pnpm db:studio`  | Browse the data in Prisma Studio                   |

## Scripts

| Script                | Purpose                                               |
| --------------------- | ----------------------------------------------------- |
| `pnpm dev`            | Start the development server                          |
| `pnpm build`          | Production build                                      |
| `pnpm start`          | Serve the production build                            |
| `pnpm lint`           | Run ESLint                                            |
| `pnpm lint:fix`       | Run ESLint and apply fixes                            |
| `pnpm prettier`       | Format the codebase                                   |
| `pnpm prettier:check` | Verify formatting without writing                     |
| `pnpm typecheck`      | Type-check without emitting                           |
| `pnpm test`           | Run the test suite once                               |
| `pnpm test:watch`     | Run tests in watch mode                               |
| `pnpm test:coverage`  | Run tests with a coverage report                      |
| `pnpm check`          | Everything CI runs: lint, formatting, types and tests |

## Languages

The interface is available in English, Dutch and German. English is the source of truth; the other two
are translated from it. Every route lives under `src/app/[locale]/`, and the locale prefix is applied by
`src/proxy.ts`.

Copy belongs in the catalogs under `src/dictionaries/`, never inline in a component. Adding a language
means declaring it in `src/constants/locales.ts` and adding the matching catalog — routing, the
`<html lang>` attribute and the language names all derive from that one constant.

Two guards keep the three catalogs honest. Message keys are typed against `en.json`, so an unknown key
fails `pnpm typecheck` instead of rendering as a raw key. A test then compares the catalogs against
English and fails on a missing key, a key English does not have, an empty message, or a placeholder
that was dropped in translation.

Dates, durations and counts are formatted through `src/lib/format/`, which uses the region tag from
`src/constants/locales.ts` rather than the routing code: the URL says `en`, but Intl reads that as
en-US and would put the month first. Plural forms live in the catalogs, so a count is never assembled
from a number and a noun in code.

Each page declares its language variants through `localeAlternates` in `src/lib/metadata.ts`, with
`x-default` pointing at English. Set `NEXT_PUBLIC_SITE_URL` to make those URLs absolute; on Vercel the
production domain is picked up automatically.

## Testing

Tests run on Vitest with jsdom and Testing Library, and live next to the code they cover as
`*.test.ts` or `*.test.tsx`. Component tests assert against accessible roles and names rather than
class names or test ids, so a passing test also says something about how the component behaves for
assistive technology.

For accessibility assertions, use the `axe` helper from `@/lib/testing/axe`:

```tsx
const { container } = render(<Button>Play</Button>);
expect(await axe(container)).toHaveNoViolations();
```

## Commit conventions

Commits follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) and branches use
a `feature/` or `hotfix/` prefix. Two Git hooks enforce this:

- **pre-commit** runs ESLint and Prettier over the staged files only.
- **commit-msg** validates the message against the Conventional Commits specification.

The hooks install themselves through the `prepare` script when you run `pnpm install`.

If a hook blocks an urgent commit, bypass it with `git commit --no-verify`. Use this sparingly: CI runs
the same checks and will fail the pull request regardless.

## Continuous integration

Every push to `main` and every pull request runs lint, formatting, types, tests and a production build
as separate steps, so a red check points straight at what broke. `pnpm check` runs the same set locally,
minus the build.

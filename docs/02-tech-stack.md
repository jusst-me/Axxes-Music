# 02 — Technology stack

Every choice below records both the reason and the alternative that was considered. "Why not X" is a
more useful thing to have written down than "what is X".

## Core

| Layer          | Choice                        | Version   |
| -------------- | ----------------------------- | --------- |
| Framework      | Next.js App Router            | 16.3.4    |
| UI library     | React                         | 19.2.8    |
| Language       | TypeScript (strict)           | 5.x       |
| Styling        | Tailwind CSS                  | 4.x       |
| Components     | shadcn/ui on Base UI          | base-vega |
| Database       | PostgreSQL (Neon)             | 17        |
| ORM            | Prisma                        | 7.x       |
| Authentication | Auth.js v5 (`next-auth@beta`) | 5.x       |
| Drag and drop  | dnd-kit                       | 6.x       |
| Motion         | Motion                        | 12.x      |
| i18n           | next-intl                     | 4.x       |
| Testing        | Vitest + Testing Library      | 3.x       |
| Hosting        | Vercel                        | —         |

> Next.js 16 differs from earlier versions in several conventions. Consult
> `node_modules/next/dist/docs/` before writing code, as required by `AGENTS.md`.

## Next.js over a standalone React SPA

The brief specifies TypeScript and React and nothing further. A Vite SPA would satisfy that, but then
everything that makes this application interesting has to happen in the browser, and "sign in" degrades
to a flag in local storage. With Next.js, authorization runs on the server where it belongs.

Concretely:

- Server Components read the catalog directly, without an API layer built solely to serve the frontend.
- Server Actions handle mutations with CSRF protection built in.
- A single codebase and a single deployment target.

## Prisma and Postgres over mock data

Playlists with visibility rules and collaborators are inherently multi-user. Without shared storage,
"shared with the team" has no meaning. Beyond that:

- The Prisma schema is a single readable file that communicates relations, indexes and constraints to
  anyone opening the project for the first time.
- Migrations under version control make schema evolution reviewable.
- Neon offers serverless Postgres with direct Vercel integration and database branching per preview
  deployment.

**Alternatives considered.** Drizzle is lighter and emits tighter SQL, but Prisma's schema is more
approachable for a team picking up the project, which outweighs query-level performance at this data
volume. Supabase would solve authentication and storage in one step, but it moves the authorization
model into a managed service and out of the codebase, which is the opposite of what this project needs
to demonstrate about its own security posture.

## Auth.js with a credentials provider

The brief asks specifically for email and password, so an OAuth-only setup is ruled out. Auth.js v5 is
the standard choice for Next.js and is compatible with Next.js 16.

Constraints that shape the implementation:

- Passwords are hashed with Argon2id. No hand-rolled hashing.
- The credentials provider uses JWT sessions, so the Prisma adapter is unnecessary. The `User` model is
  owned by the application, including the `passwordHash` field.
- Environment variables use the `AUTH_` prefix in v5, not `NEXTAUTH_`.
- **Critical:** `src/proxy.ts` (the Next.js 16 successor to `middleware.ts`) must not be the only
  authorization check. CVE-2025-29927 demonstrated that this layer can be bypassed with a crafted
  header. Proxy performs a fast, optimistic check for redirect purposes only; the authoritative check
  happens in the data access layer on every query and mutation. See
  [03-architecture.md](./03-architecture.md).

## dnd-kit for drag and drop

Drag and drop is where accessibility usually fails, and WCAG 2.2 explicitly requires a single-pointer
alternative for any dragging movement.

dnd-kit ships a keyboard sensor by default: space picks up, arrow keys move, space drops, escape
cancels. It also announces movement through an ARIA live region with customizable copy, so the
application can say "Moved to position 3 of 12" rather than something generic.

`react-beautiful-dnd` is ruled out because Atlassian no longer maintains it. Pragmatic drag-and-drop
performs better with thousands of items but requires keyboard support to be written by hand, which is
the exact part that needs to be reliable here.

**Implementation note:** `DndContext` belongs in a client component and must not be server-rendered.
The library generates incrementing IDs for ARIA attributes, which otherwise causes a hydration
mismatch.

## Catalog sourced from the iTunes Search API

The brief assumes an API supplying tracks and additional metadata. The iTunes Search API fills that
role, requires no API key, and returns title, artist, album, genre, release date, duration, artwork up
to 600 pixels, an Apple Music link and a 30-second preview clip per track.

The preview clip is what turns the player from decoration into a working feature.

The catalog is imported into the application's own database through a seed script rather than queried
live. That keeps the application functional when the upstream service is unavailable, keeps search fast
and predictable, and allows indexing on title and artist in Postgres.

## next-intl for internationalization

The application ships in English, Dutch and German, with English as the default. next-intl is the
established choice for the App Router and is what the team already uses in production elsewhere, so
the conventions carry over.

Decisions that shape the implementation:

- **Every route carries a locale prefix**, including the default: `/en/tracks`, `/nl/tracks`,
  `/de/tracks`. Leaving the default unprefixed saves a few characters in the URL and costs a permanent
  special case in routing, caching and canonical URLs. Consistency wins here.
- **No automatic detection from `Accept-Language`.** Content negotiation makes the same URL return
  different pages for different visitors, which complicates caching and surprises users who share
  links. Language is chosen explicitly through the switcher, and that choice is remembered.
- **Only interface copy is translated.** Track titles, artist names and playlist names are user or
  catalog data and are shown as they are. Translating them would be wrong, not incomplete.
- **Locale-aware formatting** for dates, durations and numbers comes from the same library, so a
  release date renders as `March 4, 2024`, `4 maart 2024` or `4. März 2024` without bespoke code.

There is an accessibility dimension too: WCAG 2.2 requires the page language to be exposed
programmatically, so `<html lang>` follows the active locale rather than being hardcoded.

**Alternatives considered.** `next-i18next` targets the Pages Router and does not fit. A hand-rolled
dictionary lookup is tempting at this scale but would need pluralization, interpolation, formatting and
locale routing before long — all of which next-intl already provides.

## Motion for animation

Layout animations during list reordering are difficult to do well in CSS alone. Motion handles them
through `layout` animations and provides a `useReducedMotion` hook so animation can be switched off
cleanly. Animation stays subtle and functional: it explains a change, it does not decorate.

## Quality tooling

| Tool                     | Role                                                                |
| ------------------------ | ------------------------------------------------------------------- |
| ESLint + Prettier        | Already configured: single quotes, import sorting, Tailwind sorting |
| Husky + lint-staged      | Pre-commit lint and format, limited to changed files                |
| commitlint               | Enforces Conventional Commits on the commit message                 |
| Vitest + Testing Library | Unit and component tests                                            |
| vitest-axe               | Accessibility assertions inside component tests                     |
| GitHub Actions           | Lint, typecheck, test and build on every pull request               |

**Vitest over Jest.** Vitest shares the Vite transform pipeline, starts noticeably faster, and handles
ESM and TypeScript natively without additional configuration.

**Limited end-to-end coverage.** Playwright is scheduled as `[proposed]` with a single scenario: sign
in, create a playlist, add a track, reorder. Broader coverage would consume time better spent on
accessibility, which carries more risk in this application.

## Explicitly not chosen

| Rejected                 | Reason                                                                    |
| ------------------------ | ------------------------------------------------------------------------- |
| Redux, Zustand or Jotai  | Server state belongs on the server; the little client state fits in React |
| TanStack Query           | Server Components and Server Actions already cover fetching and mutation  |
| Websockets for real-time | Adds infrastructure the requirements do not call for                      |
| Storybook                | Valuable in a design system, disproportionate for this component count    |
| Docker                   | Neon and Vercel remove the need for local containers                      |

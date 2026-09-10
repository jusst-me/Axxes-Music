# 07 — State of play

Where the work stands, how it is being done, and what is waiting. Kept current at the end of each
milestone so that picking the work back up does not require reading the git history.

Last updated after AXM-031.

## Where the work stands

| Milestone                                  | State       |
| ------------------------------------------ | ----------- |
| M0 — Foundation                            | complete    |
| M1 — Identity, language and authentication | complete    |
| M2 — Core requirements                     | in progress |
| M3 to M5                                   | not started |

M2 holds eight stories. AXM-030 and AXM-031 are merged. Remaining:

| Story   | Subject                                  | Grouped into                   |
| ------- | ---------------------------------------- | ------------------------------ |
| AXM-032 | Search the catalog, `?q=` in the URL     | Search and detail pull request |
| AXM-033 | Track details, dialog and `/tracks/[id]` | Search and detail pull request |
| AXM-040 | Create a playlist                        | Playlists pull request         |
| AXM-050 | Add a track to a playlist                | Playlists pull request         |
| AXM-051 | Remove a track from a playlist           | Playlists pull request         |
| AXM-052 | View a playlist                          | Playlists pull request         |

Rows in the catalog are deliberately not interactive yet. They become the trigger for the detail view
in AXM-033, which is what gives them something to do.

## How the work is being done

**Tickets and commits.** One commit per ticket, with the ticket named at the end of the subject:
`feat(catalog): list the available tracks (AXM-031)`. It sits at the end because commitlint's
`subject-case` rule rejects a subject opening with an uppercase token. A pull request may carry several
commits as long as each stands on its own.

**Merging.** Always a merge commit: `gh pr merge <number> --merge --auto --delete-branch`. Squashing
loses the ticket boundaries inside the branch and rebasing loses the link to the pull request. Enable
auto-merge only once nothing further will be pushed to the branch, or check afterwards that the pull
request head matches what was pushed. A commit that lands between validation and merge is left behind,
and a second pull request appears for the same branch.

**Verification.** Automated tests carry the regression burden. Manual verification happens once per
milestone and is done by hand rather than through browser automation, which is expensive and has twice
reported failures that turned out to be artefacts. Every pull request therefore ends with a numbered
"what to check by hand" list.

**Language.** Everything in the repository is English. User-facing copy lives only in
`src/dictionaries/`, English first, then Dutch and German.

## Waiting for a manual pass

From [PR #14](https://github.com/jusst-me/Axxes-Music/pull/14), both unresolved and worth a look while
testing the milestone:

1. A hydration warning against `TrackRow` was reported by an automated pass. The server HTML for a row
   matches what the client renders, the line it named holds only static markup, and React's own message
   names a browser extension as a possible cause. The browser console on `/en/catalog` settles it.
2. The same pass reported no visible focus indicators. The components carry `focus-visible:ring-3`, and
   an earlier pass over the same components saw the rings, so this is most likely an artefact of the
   automation rather than a defect.

## Open questions

- `prisma/seed.ts` carries the demo account password in plain text, in a repository that is public, for
  an account that exists in the production database. Worth moving to an environment variable.
- `.env.dist` and AXM-004 still list `AUTH_URL` as required. Auth.js v5 derives it on Vercel, so the
  documentation is ahead of what is actually needed.

## What would otherwise cost a day to rediscover

**Next.js 16.** `middleware` is now `proxy`, in `src/proxy.ts`, and it runs on the Node.js runtime; the
`runtime` option throws. The version bundles its own documentation in `node_modules/next/dist/docs/`,
which is worth reading before assuming a familiar API still holds.

**Locale formatting.** The URL carries `en`, which `Intl` resolves to en-US and therefore to
"March 12, 2001". Formatting goes through `createAppFormatter` in `src/lib/format/formatter.ts`, which
formats on the region tag from `src/constants/locales.ts` instead. `Intl.DurationFormat` is not usable:
Safari 16 is in the browserslist and does not have it.

**Auth.js v5.** `signIn(..., { redirect: false })` signals a rejected credential by throwing an
`AuthError`, not by returning an error URL. `declare module 'next-auth/jwt'` does not merge, because
that module only re-exports from `@auth/core/jwt`; the user id is read from the standard `token.sub`
claim. The proxy uses the database-free half of the configuration in `src/lib/auth/config.ts`, and its
check is optimistic: `requireSession` in every data function and server action is what actually
protects anything.

**Base UI inputs.** They own their value, and changing `defaultValue` after mount warns. Fields that
have to survive a rejected submission are keyed on the returned value, so each attempt is a freshly
initialised field.

**The catalog.** `pnpm db:seed` fills the database with roughly 1089 tracks across 56 genres and is
idempotent. It fails deliberately below 200 playable tracks.

**Tooling.** Prettier needs the explicit `*.mdc` override to format Cursor rule files. Commits are
signed through 1Password, which is unreachable from a sandboxed shell.

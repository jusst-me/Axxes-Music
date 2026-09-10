# 07 — State of play

Where the work stands, how it is being done, and what is waiting. Kept current at the end of each
milestone so that picking the work back up does not require reading the git history.

Last updated after AXM-052.

## Where the work stands

| Milestone                                  | State       |
| ------------------------------------------ | ----------- |
| M0 — Foundation                            | complete    |
| M1 — Identity, language and authentication | complete    |
| M2 — Core requirements                     | complete    |
| M3 to M5                                   | not started |

M2 is a viable delivery point on its own. The six primary requirements from the brief are in place:
the catalog can be browsed and searched, a track has a detail view, and a playlist can be created,
filled, emptied and filtered.

The next milestone is M3 — the optional stories: a theme toggle is already in the header from M1;
what remains is deleting a playlist (AXM-041) and accessible drag-and-drop within and between lists
(AXM-053, AXM-054).

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

M2 has not had its milestone walkthrough yet. Work through the numbered list on the playlists pull
request, then the earlier ones on [PR #16](https://github.com/jusst-me/Axxes-Music/pull/16) and
[PR #14](https://github.com/jusst-me/Axxes-Music/pull/14) that are still unresolved:

1. A hydration warning against `TrackRow` was reported by an automated pass on PR #14. The server HTML
   for a row matches what the client renders, and React's own message names a browser extension as a
   possible cause. The browser console on `/en/catalog` settles it.
2. The same pass reported no visible focus indicators. The components carry `focus-visible:ring-3`, so
   this is most likely an artefact of the automation rather than a defect.
3. Vercel preview deployments have been failing on recent pull requests while production on `main`
   succeeds. The GitHub Actions check is green in those cases. Until the preview project is looked at,
   production is the environment that can be trusted.

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

**Playlists.** Ownership is part of the query, never a check afterwards, so a playlist that belongs to
someone else is indistinguishable from one that never existed. Adding appends; removing closes the
position gap in the same transaction; undo restores at the old position rather than at the end. Search
inside a playlist is client-side and does not touch the URL, unlike catalog search, which lives in
`?q=` so it can be shared.

**Tooling.** Prettier needs the explicit `*.mdc` override to format Cursor rule files. Commits are
signed through 1Password, which is unreachable from a sandboxed shell.

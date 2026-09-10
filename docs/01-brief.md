# 01 — Brief and scope

## Context

Axxes IT Consultancy runs music through the office speakers all day. To keep everyone happy, the
client wants a Spotify-style application in which colleagues can build shared playlists together.

## Starting point: greenfield build

No usable codebase or backing API was handed over at project start, so the application is built from
scratch on Next.js. Two consequences follow from that decision:

- The brief specifies TypeScript and React. Next.js adds the server side, which is what makes
  authentication, authorization and shared playlists work as real features rather than
  browser-only illusions.
- The brief refers to "an API that supplies additional information about the tracks". That role is
  filled by the public iTunes Search API, from which the catalog is imported. It provides album,
  genre, release date, duration and a 30-second preview clip per track.

Both points are restated in the root README so anyone picking up the project understands the origin
of the data.

## Client requirements

From the brief, in the order stated:

| #   | Requirement                                                  | Epic    |
| --- | ------------------------------------------------------------ | ------- |
| 1   | Sign in with email and password                              | C       |
| 2   | Display a list of available tracks                           | D       |
| 3   | Add a track to a playlist                                    | F       |
| 4   | Remove a track from a playlist                               | F       |
| 5   | Search within both lists                                     | D and F |
| 6   | Show additional track information in a dialog or detail page | D       |

Listed by the client as optional:

| #   | Optional requirement                | Epic |
| --- | ----------------------------------- | ---- |
| 7   | Drag and drop between the two lists | F    |
| 8   | Support for multiple playlists      | E    |
| 9   | Dark and light theme                | B    |

All nine are in scope. The three optional items are worth taking on precisely because they are where
the difference between "functional" and "well built" becomes visible.

## Proposed additions

The following was not requested. It is included because it materially improves the delivered product,
and it is labeled `[proposed]` in the backlog so it can be dropped without touching the agreed scope.

- **Playlist visibility** — private or shared with the whole team, with the option to invite
  colleagues as collaborators. This matches the stated context of a single office deciding on the
  music together, and it forces a proper authorization model rather than an implicit one.
- **WCAG 2.2 AA compliance** — primarily keyboard operation and color contrast. Drag and drop is the
  most demanding part here, since drag interactions are unusable without a pointing device unless
  explicitly designed otherwise.
- **Working audio playback** — preview clips through a persistent player bar.
- **Motion design** — subtle, purposeful, and disabled under `prefers-reduced-motion`.
- **Unit tests** — covering the logic that carries risk: authorization, search and reordering.
- **CI, pre-commit hooks and commit linting** — quality gates that do not depend on discipline.
- **Deployment to Vercel** — with a preview environment per pull request.
- **Axxes brand identity** — colors and typography derived from axxes.nl, see
  [04-design-system.md](./04-design-system.md).

## Out of scope

Deliberately not built, and documented as such in the root README:

- Full music streaming or licensing for complete tracks. Thirty-second preview clips are
  representative and carry no licensing risk.
- Password reset, email verification and OAuth providers. Worthwhile in a longer-running product, but
  they add nothing to the functionality under discussion here.
- Real-time collaboration over websockets. Collaborators see each other's changes on refetch rather
  than live. The reasoning is in [02-tech-stack.md](./02-tech-stack.md).
- A native mobile application or offline support.

## Effort guideline

The client indicated a budget of roughly one working day for the core requirements. That covers the
nine items listed above. Everything labeled `[proposed]` falls outside that budget and is treated as a
separate, optional increment. The backlog is ordered so the required scope is complete and
demonstrable before any proposed work begins.

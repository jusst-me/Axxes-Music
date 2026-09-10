# 05 — Backlog

Labels: `[required]` appears in the client brief, `[proposed]` is an addition made by the development
team. Estimates use T-shirt sizes: S is under an hour, M is one to three hours, L is more than three.

Epic overview:

| Epic | Subject                   | Stories | Weighting    |
| ---- | ------------------------- | ------- | ------------ |
| A    | Foundation and quality    | 5       | `[proposed]` |
| B    | Design system and theming | 5       | mixed        |
| C    | Authentication            | 5       | `[required]` |
| D    | Music catalog             | 4       | `[required]` |
| E    | Playlist management       | 6       | mixed        |
| F    | Playlist contents         | 6       | `[required]` |
| G    | Playback                  | 4       | `[proposed]` |
| H    | Accessibility and polish  | 6       | `[proposed]` |
| I    | Delivery                  | 3       | mixed        |
| J    | Internationalization      | 6       | `[proposed]` |
| K    | Public landing page       | 3       | `[proposed]` |

Epic letters reflect grouping, not build order. Epic J is foundational and is scheduled in milestone
M1, because retrofitting locale routing after the routes exist is far more expensive than starting with
it. Epic K is split: the routing rules it depends on land in M1, the page itself in M4. See
[06-roadmap.md](./06-roadmap.md).

---

## Epic A — Foundation and quality

Goal: quality gates are in place before feature work begins. Added afterwards, they tend not to be
added at all.

### AXM-001 — Husky, lint-staged and commitlint `[proposed]`

**As a** developer **I want** mistakes blocked before they are committed **so that** quality does not
depend on attentiveness.

- Pre-commit runs ESLint and Prettier across changed files only.
- Commit-msg validates against Conventional Commits and rejects non-conforming messages.
- Hooks install themselves through a `prepare` script after `pnpm install`.
- The README documents how to bypass a hook in an emergency.

Priority: high · Estimate: S

### AXM-002 — Test setup with Vitest `[proposed]`

**As a** developer **I want** to write and run tests **so that** behavior is pinned down.

- Vitest with jsdom, Testing Library and `@testing-library/jest-dom`.
- `vitest-axe` available for accessibility assertions.
- Scripts `test`, `test:watch` and `test:coverage`.
- The `@/` path alias resolves in tests, and one example test passes.

Priority: high · Estimate: M

### AXM-003 — GitHub Actions CI `[proposed]`

**As a** reviewer **I want** build health visible on the pull request **so that** I can trust the
change.

- Workflow runs on push to `main` and on every pull request.
- Steps: install with pnpm cache, lint, typecheck, test, build.
- Any failing step fails the workflow visibly.
- Total runtime under five minutes.

Priority: high · Estimate: M · Depends on: AXM-002

### AXM-004 — Vercel and Neon provisioning `[proposed]`

**As a** stakeholder **I want** to open the application in a browser **so that** I can follow progress
without a local setup.

- Vercel project connected to the GitHub repository.
- Neon Postgres provisioned; `DATABASE_URL`, `AUTH_SECRET` and `AUTH_URL` set as environment variables.
- Preview deployment per pull request verified working.
- `.env.dist` committed; the real `.env` is not.

Priority: high · Estimate: M

### AXM-005 — Prisma, schema and migrations `[proposed]`

**As a** developer **I want** a typed data model **so that** the rest of the application can build on
it.

- Prisma installed and configured; the client is exported as a singleton to avoid connection leaks
  during hot reload.
- Schema per [03-architecture.md](./03-architecture.md), including indexes and unique constraints.
- Initial migration committed.
- `pnpm db:seed` creates a demo account and an initial catalog.

Priority: high · Estimate: L · Depends on: AXM-004

---

## Epic B — Design system and theming

### AXM-010 — Axxes tokens in globals.css `[proposed]`

**As a** user **I want** an application that looks like it belongs to Axxes **so that** it feels
considered and trustworthy.

- All shadcn tokens populated with the values from [04-design-system.md](./04-design-system.md), in
  `oklch()`.
- Light and dark themes both fully defined.
- Verified with a contrast tool; results recorded in the design system document.
- No literal color values remain in components.

Priority: high · Estimate: M

### AXM-011 — Montserrat and type scale `[proposed]`

- Montserrat through `next/font/google` with `display: swap` and only the required weights.
- The Geist and Inter fonts from the create-next-app scaffold are removed.
- Heading scale defined in `@theme`; body line height at least 1.5.

Priority: medium · Estimate: S · Depends on: AXM-010

### AXM-012 — Theme toggle `[required, optional]`

**As a** user **I want** to switch between light and dark **so that** the application suits my working
environment.

- Three modes: light, dark and system; the choice is persisted.
- No visible flash of the wrong theme on load.
- The control has an accessible name stating the current mode and is keyboard operable.
- Both themes meet the contrast requirements.

Priority: high · Estimate: M · Depends on: AXM-010

### AXM-013 — App shell and navigation `[proposed]`

- Header with logo, primary navigation, theme toggle and user menu.
- Semantic landmarks: `header`, `nav`, `main`, `footer`.
- Skip link to main content, visible on focus.
- Works from 320 pixels wide up to desktop.
- The active navigation item is marked with `aria-current="page"`.

Priority: high · Estimate: M

### AXM-014 — Install shadcn components `[proposed]`

- Added through the CLI rather than by hand: `dialog`, `dropdown-menu`, `input`, `label`, `field`,
  `sheet`, `sonner`, `tooltip`, `avatar`, `skeleton`, `alert-dialog`, `select`, `switch`, `slider`.
- `field` replaces `form`: the registry entry for `form` is empty in the Base UI style this project
  uses, because Base UI's own `Field` handles label association, `aria-describedby` and `aria-invalid`
  rather than delegating that to react-hook-form.
- Each component checked against the Axxes tokens.

Priority: medium · Estimate: S · Depends on: AXM-010

---

## Epic C — Authentication

### AXM-020 — Auth.js with email and password `[required]`

**As an** employee **I want** to sign in with email and password **so that** my playlists are mine.

- Auth.js v5 with the credentials provider and JWT sessions.
- Passwords hashed with Argon2id; the hash never leaves the server.
- Invalid credentials return an identical message for unknown email and wrong password, so accounts
  cannot be enumerated.
- The session carries user ID, name and email, with the type extended so TypeScript is aware of it.

Priority: high · Estimate: L · Depends on: AXM-005

### AXM-021 — Sign-in page `[required]`

- Form with associated labels, `autocomplete` on email and password, and paste permitted.
- Validation with Zod, shared between client and server.
- Errors linked through `aria-describedby`, fields marked with `aria-invalid`, focus moved to the first
  invalid field.
- Loading state during submission; double submission is prevented.
- After signing in, the user continues to the originally requested page.

Priority: high · Estimate: M · Depends on: AXM-020

### AXM-022 — Registration page `[proposed]`

- Name, email and password with a minimum strength requirement stated before the field.
- A duplicate email produces a field-level error, not a server error.
- The user is signed in immediately after registering.

Priority: high · Estimate: M · Depends on: AXM-020

### AXM-023 — Route protection `[required]`

- `src/proxy.ts` redirects unauthenticated visitors to `/login`, preserving the intended destination.
- Every server action and data function verifies the session independently; proxy is not authoritative.
- A test demonstrates that a data function refuses to run without a valid session.

Priority: high · Estimate: M · Depends on: AXM-020

### AXM-024 — User menu and sign out `[proposed]`

- Header menu showing name and email, with a sign-out option.
- Signing out clears the session and returns to the sign-in page.
- The menu follows the standard menu keyboard pattern and restores focus on close.

Priority: medium · Estimate: S · Depends on: AXM-020

---

## Epic D — Music catalog

### AXM-030 — Import the catalog `[proposed]`

**As a** user **I want** a populated music library **so that** I can start immediately.

- Script pulls tracks from the iTunes Search API across multiple genres and artists.
- Stores title, artist, album, genre, release date, duration, artwork, preview URL and Apple Music link.
- Re-running produces no duplicates: `externalId` is unique and the script upserts.
- At least 200 tracks with a usable preview clip.
- Tracks without a preview clip are skipped or flagged.

Priority: high · Estimate: M · Depends on: AXM-005

### AXM-031 — List of available tracks `[required]`

**As a** user **I want** to see the available tracks **so that** I can choose what to add.

- Server Component renders artwork, title, artist, album and duration.
- Paginated or incrementally loaded; the full catalog is never rendered at once.
- Rendered as a genuine list and reachable per row from the keyboard.
- Loading state with skeletons and a considered empty state.
- Missing artwork falls back to a placeholder with appropriate alternative text.

Priority: high · Estimate: L · Depends on: AXM-030

### AXM-032 — Search the catalog `[required]`

- The query lives in the URL as `?q=`, so searches are shareable and the back button behaves.
- Case-insensitive matching on title, artist and album.
- Input is debounced; the field does not lose focus while typing.
- The result count is announced through a live region.
- Empty state offers a clear next step and a control to clear the search.

Priority: high · Estimate: M · Depends on: AXM-031

### AXM-033 — Track details `[required]`

**As a** user **I want** more information about a track **so that** I know what I am adding.

- Dialog shows album, genre, release date, duration, large artwork and a link to Apple Music.
- Also reachable as a dedicated route at `/tracks/[trackId]`, so details are linkable.
- The dialog traps focus, closes on escape and returns focus to the triggering control.
- The track can be added to a playlist directly from the detail view.

Priority: high · Estimate: M · Depends on: AXM-031

---

## Epic E — Playlist management

### AXM-040 — Create a playlist `[required, optional]`

- Name is required, up to 100 characters; description is optional.
- New playlists default to private.
- After creation the user lands on the new playlist and receives confirmation.
- Validation errors appear alongside the relevant field.

Priority: high · Estimate: M · Depends on: AXM-023

### AXM-041 — Delete a playlist `[proposed]`

- Only the owner can delete.
- Confirmation dialog naming the playlist; the default action is cancel.
- Associated `PlaylistTrack` rows are removed by cascade.
- After deletion the user returns to the overview with a confirmation message.

Priority: high · Estimate: S · Depends on: AXM-040

### AXM-042 — Edit a playlist `[proposed]`

- The owner can change name and description.
- Changes appear immediately without a full page reload.

Priority: medium · Estimate: S · Depends on: AXM-040

### AXM-043 — Set visibility `[proposed]`

**As an** owner **I want** to decide whether colleagues can see my playlist **so that** I can also
collect privately.

- Toggle between private and public, with copy explaining what each mode means.
- Only the owner can change it.
- Requesting a private playlist as an outsider returns 404 rather than 403, so existence is not leaked.
- The current mode is visible on the playlist page.

Priority: high · Estimate: M · Depends on: AXM-040

### AXM-044 — Discover public playlists `[proposed]`

- Overview of all public playlists with owner and track count.
- The user's own playlists are marked as such.
- Without edit rights, editing controls are absent rather than merely disabled.

Priority: medium · Estimate: M · Depends on: AXM-043

### AXM-045 — Manage collaborators `[proposed]`

**As an** owner **I want** to let colleagues edit **so that** we build the office playlist together.

- Add a colleague by email address with the role viewer or editor.
- Only the owner can change roles or revoke access.
- The collaborator list is visible on the playlist page.
- An unknown email address produces a clear message.

Priority: medium · Estimate: L · Depends on: AXM-043

### AXM-046 — Centralize and test authorization `[proposed]`

- The permission matrix from [03-architecture.md](./03-architecture.md) implemented as pure functions in
  `src/lib/permissions/`.
- Every cell of the matrix is covered by a test.
- Server Actions and data functions use these functions exclusively.

Priority: high · Estimate: M · Depends on: AXM-045

---

## Epic F — Playlist contents

### AXM-050 — Add a track `[required]`

- Adding is possible from the catalog, from search results and from the detail dialog.
- With multiple playlists the user picks one; with a single playlist the track is added directly.
- The track is appended to the end of the list.
- A duplicate is reported gracefully rather than surfacing as a server error.
- The list updates immediately and rolls back if the action fails.
- The addition is announced through a live region.

Priority: high · Estimate: M · Depends on: AXM-040

### AXM-051 — Remove a track `[required]`

- Per-row remove control with an accessible name that identifies the track.
- Immediate visual effect, with rollback on failure.
- Undo offered through the confirmation message.
- Remaining positions stay contiguous.

Priority: high · Estimate: M · Depends on: AXM-050

### AXM-052 — Search within a playlist `[required]`

- Filters on the client by title, artist and album.
- While a filter is active, reordering is disabled with an explanation of why.
- The result count is announced.
- Clearing the filter restores the full list.

Priority: high · Estimate: S · Depends on: AXM-050

### AXM-053 — Reorder tracks `[required, optional]`

**As a** user **I want** to control the order **so that** the playlist flows the way I intend.

- Pointer and touch dragging through dnd-kit.
- Full keyboard operation: space picks up, arrow keys move, space drops, escape cancels.
- Each move is announced, for example "Moved to position 3 of 12".
- A visible instruction accompanies the drag handle for keyboard users.
- The new order is persisted in a single transaction and survives a reload.
- The drag handle is at least 24 by 24 pixels.
- Everything still works with animation disabled under `prefers-reduced-motion`.

Priority: high · Estimate: L · Depends on: AXM-050

### AXM-054 — Drag between the lists `[required, optional]`

- A track can be dragged from the catalog onto the playlist.
- The drop target is clearly indicated during the drag.
- An equivalent non-drag alternative exists, namely the add control from AXM-050.
- Dropping outside a valid target cancels cleanly.

Priority: medium · Estimate: L · Depends on: AXM-053

### AXM-055 — Optimistic updates `[proposed]`

- Adding, removing and reordering show their result immediately.
- On failure the state rolls back and a comprehensible message appears.
- A test demonstrates the rollback path.

Priority: medium · Estimate: M · Depends on: AXM-053

---

## Epic G — Playback

### AXM-060 — Player bar and player state `[proposed]`

- Provider above the app shell so audio survives navigation.
- Fixed bar at the bottom showing artwork, title, artist and controls.
- No autoplay; audio starts only after a user action.
- The bar never obscures focused content; the page reserves space at the bottom.

Priority: medium · Estimate: L · Depends on: AXM-031

### AXM-061 — Transport controls and progress `[proposed]`

- Play, pause, previous, next and volume.
- Draggable progress bar showing elapsed and remaining time.
- At the end of a clip the next queued track starts automatically.
- Network failures surface a message rather than silence.

Priority: medium · Estimate: M · Depends on: AXM-060

### AXM-062 — Accessible player `[proposed]`

- All controls are keyboard operable and carry accessible names.
- The play control communicates its state through `aria-pressed` or a changing name.
- The progress bar is a slider with correct values and responds to arrow keys.
- Track changes are announced politely.

Priority: high · Estimate: M · Depends on: AXM-061

### AXM-063 — Queue from a playlist `[proposed]`

- "Play all" queues the entire playlist in its current order.
- The currently playing track is marked in the list.
- The queue follows a change in playlist order.

Priority: low · Estimate: M · Depends on: AXM-061

---

## Epic H — Accessibility and polish

### AXM-070 — Focus management `[proposed]`

- Visible focus indicator of at least 2 pixels on every interactive element, in both themes.
- Closing a dialog returns focus to the element that opened it.
- After removing a row, focus lands somewhere sensible rather than on `body`.
- Focus is never obscured by the player bar.

Priority: high · Estimate: M

### AXM-071 — Live region announcements `[proposed]`

- One central live region for status messages.
- Additions, removals, moves and search results are announced.
- Polite where possible, assertive only for errors.
- Messages do not stack into noise.

Priority: high · Estimate: M

### AXM-072 — Validate contrast `[proposed]`

- Every text and background combination measured in both themes.
- Body text reaches 4.5:1; large text and UI elements reach 3:1.
- Results recorded in [04-design-system.md](./04-design-system.md).

Priority: high · Estimate: S · Depends on: AXM-010

### AXM-073 — Motion preferences `[proposed]`

- All animation is disabled under `prefers-reduced-motion: reduce`.
- Every feature remains fully usable without animation.
- No transition exceeds 300 ms.

Priority: medium · Estimate: M

### AXM-074 — Empty, loading and error states `[proposed]`

- Every list has an empty state offering a meaningful next step.
- Loading states use skeletons rather than shifting layout.
- `error.tsx` and `not-found.tsx` present in the app routes.
- Error messages are in plain language, without stack traces.

Priority: medium · Estimate: M

### AXM-075 — Accessibility audit `[proposed]`

- Automated axe checks on the primary pages, with no serious or critical findings.
- Manual keyboard-only pass across the main user journey.
- Screen reader spot check with VoiceOver on the catalog, a playlist and reordering.
- Findings and resolutions recorded in `docs/`.

Priority: high · Estimate: M · Depends on: all feature epics

---

## Epic I — Delivery

### AXM-080 — README `[required]`

- Short project description with a link to the deployed environment.
- Instructions to run locally, including database setup and seeding.
- Decisions and their rationale, linking into `docs/`.
- An explicit list of what is unfinished and what the next steps would be.
- Explanation of why the project was built greenfield.

Priority: high · Estimate: M

### AXM-081 — Demo data `[proposed]`

- The seed creates two users so collaboration can be demonstrated.
- Pre-populated playlists: one private, one public and one shared.
- Demo account credentials documented in the README.

Priority: high · Estimate: S · Depends on: AXM-045

### AXM-082 — Walkthrough script `[proposed]`

- A five-minute route through the application: landing page, sign in, search, view details, add,
  reorder from the keyboard, share, switch theme, switch language, play.
- Verified against the production environment beforehand.

Priority: medium · Estimate: S · Depends on: AXM-080

---

## Epic J — Internationalization

Goal: English, Dutch and German from the first screen onward. Scheduled in M1 despite the epic letter,
because every route and every string added afterwards would otherwise need reworking.

### AXM-090 — Locale routing and layout `[proposed]`

**As a** user **I want** the application in my own language **so that** I can work without translating
in my head.

- next-intl configured through `src/i18n/routing.ts` with `en` as default and `nl` and `de` alongside.
- Locales declared in one constant; adding a language touches a single file.
- All page routes moved under `src/app/[locale]/`; `/api` stays outside it.
- The `[locale]` layout sets `<html lang>` and provides `NextIntlClientProvider`.
- An unknown locale returns a 404 rather than falling back silently.
- `src/i18n/navigation.ts` exports the locale-aware navigation helpers.

Priority: high · Estimate: L · Depends on: AXM-013

### AXM-091 — Message catalogs `[proposed]`

- `en.json`, `nl.json` and `de.json` in `src/dictionaries/`, with a shared key structure.
- Keys grouped by domain: `common`, `auth`, `catalog`, `playlist`, `player`, `a11y`.
- English is the source of truth; the other two are translated from it.
- No hardcoded user-facing strings remain in components.
- A test or lint step verifies that all three files expose the same keys, so a missing translation
  fails the build rather than surfacing as a raw key in production.

Priority: high · Estimate: M · Depends on: AXM-090

### AXM-092 — Language switcher `[proposed]`

- Available in the header, next to the theme toggle.
- Each language is written in its own language: English, Nederlands, Deutsch.
- Switching keeps the user on the current page rather than returning to the start.
- The chosen language is remembered across sessions.
- The control has an accessible name stating the current language, is keyboard operable, and each
  option carries a `lang` attribute so a screen reader pronounces it correctly.

Priority: high · Estimate: M · Depends on: AXM-091

### AXM-093 — Locale-aware formatting `[proposed]`

- Release dates, track durations and counts are formatted through next-intl rather than by hand.
- Pluralization goes through the message catalog, not through string concatenation.
- Relative timestamps such as "added 2 days ago" are localized.
- Unit tests cover formatting for all three locales.

Priority: medium · Estimate: S · Depends on: AXM-091

### AXM-094 — Localized authentication flow `[proposed]`

- The proxy resolves the locale before the authentication redirect, so an unauthenticated visitor lands
  on `/{locale}/login`.
- After signing in, the user returns to the originally requested path with its locale intact.
- Auth.js callback routes are excluded from locale prefixing.
- Validation and authentication error messages come from the message catalogs, which means Zod schemas
  return keys rather than sentences.

Priority: high · Estimate: M · Depends on: AXM-090, AXM-023

### AXM-095 — Metadata and language alternates `[proposed]`

- Page titles and descriptions are localized.
- `alternates.languages` declares the three variants, with `x-default` pointing at English.
- `<html lang>` matches the active locale on every route.
- The sign-in page is reachable and correct in all three languages.

Priority: medium · Estimate: S · Depends on: AXM-090

---

## Epic K — Public landing page

Goal: someone arriving without an account understands what the product is and how to get started.
AXM-100 is structural and belongs in M1; the page itself follows in M4.

### AXM-100 — Public routes and entry redirects `[proposed]`

**As a** visitor without an account **I want** to reach the site without being bounced to a form
**so that** I can find out what this is first.

- The proxy holds an explicit allowlist of public paths: the landing page, sign-in and registration.
  Everything not on the list requires a session, so new routes are private by default.
- The locale prefix is preserved on every public path.
- A signed-in visitor who opens the landing page is redirected to their library.
- Tests cover both directions: a public path without a session resolves, and a protected path without a
  session redirects.

Priority: high · Estimate: M · Depends on: AXM-023, AXM-090

### AXM-101 — Landing page `[proposed]`

**As a** visitor **I want** a clear explanation of the product **so that** I can decide whether to
create an account.

- Hero with the product proposition, a primary call to action to register and a secondary one to sign
  in.
- Sections covering the core capabilities: shared playlists, search, ordering by drag or keyboard, and
  light and dark themes.
- At least one honest visual of the actual interface rather than a stock image.
- Full Axxes identity: orange as a surface color, never as body text, per
  [04-design-system.md](./04-design-system.md).
- Works from 320 pixels wide upward.
- One `h1`, a heading order that does not skip levels, and proper landmarks.
- Correct in both light and dark themes.
- Motion respects `prefers-reduced-motion`.
- No serious or critical axe findings, and the page is fully keyboard operable.

Priority: medium · Estimate: L · Depends on: AXM-100, AXM-010

### AXM-102 — Landing page copy and metadata `[proposed]`

- All copy lives in the message catalogs and reads naturally in English, Dutch and German.
- The layout holds at the longest translation; German is the test case.
- Localized title and description, plus an Open Graph image.
- `alternates.languages` covers the three locales with `x-default` on English.

Priority: medium · Estimate: M · Depends on: AXM-101, AXM-091

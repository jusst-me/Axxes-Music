# 03 — Architecture

## Guiding principle

All data access flows through a single layer that knows who the current user is. Pages and components
never compose their own queries. Authorization therefore lives in one place, can be tested in
isolation, and no route can be added that accidentally skips the check.

```
Server Component / Server Action
        ↓  calls
src/lib/data/*          ← verifies session and permissions, talks to Prisma
        ↓
Prisma Client → PostgreSQL
```

The data access layer is marked with `import 'server-only'`, so reaching for it from a client component
fails at build time rather than at runtime.

## Directory layout

Building on the structure already in place:

```
src/
├── app/
│   ├── (auth)/                  # sign in and registration, layout without the app shell
│   │   ├── login/
│   │   └── register/
│   ├── (app)/                   # everything behind authentication
│   │   ├── layout.tsx           # app shell: header, navigation, player bar
│   │   ├── tracks/              # catalog and search
│   │   │   └── [trackId]/       # detail route, linkable alongside the dialog
│   │   ├── playlists/
│   │   │   └── [playlistId]/
│   │   └── discover/            # playlists shared by other users
│   └── api/auth/[...nextauth]/  # required Auth.js route handler
├── components/
│   ├── ui/                      # shadcn primitives, not edited by hand
│   ├── player/
│   ├── playlist/
│   └── track/
├── lib/
│   ├── auth/                    # Auth.js configuration, hashing, session helpers
│   ├── data/                    # data access layer, server-only
│   ├── permissions/             # authorization rules, pure and testable
│   └── validation/              # Zod schemas, shared between forms and actions
├── server/actions/              # Server Actions grouped by domain
├── hooks/
├── providers/                   # theme provider, player provider
├── types/
├── constants/
└── proxy.ts                     # optimistic authentication redirect
```

## Data model

Proposed Prisma schema, finalized during Epic A.

```prisma
model User {
  id             String                 @id @default(cuid())
  email          String                 @unique
  name           String
  passwordHash   String
  createdAt      DateTime               @default(now())
  updatedAt      DateTime               @updatedAt
  playlists      Playlist[]
  collaborations PlaylistCollaborator[]
}

model Track {
  id             String          @id @default(cuid())
  externalId     String          @unique // trackId from the iTunes API
  title          String
  artist         String
  album          String?
  genre          String?
  artworkUrl     String?
  previewUrl     String?
  durationMs     Int?
  releaseDate    DateTime?
  appleMusicUrl  String?
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  playlistTracks PlaylistTrack[]

  @@index([title])
  @@index([artist])
}

enum PlaylistVisibility {
  PRIVATE
  PUBLIC
}

model Playlist {
  id            String                 @id @default(cuid())
  name          String
  description   String?
  visibility    PlaylistVisibility     @default(PRIVATE)
  ownerId       String
  owner         User                   @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  tracks        PlaylistTrack[]
  collaborators PlaylistCollaborator[]
  createdAt     DateTime               @default(now())
  updatedAt     DateTime               @updatedAt

  @@index([ownerId])
  @@index([visibility])
}

model PlaylistTrack {
  id         String   @id @default(cuid())
  playlistId String
  playlist   Playlist @relation(fields: [playlistId], references: [id], onDelete: Cascade)
  trackId    String
  track      Track    @relation(fields: [trackId], references: [id], onDelete: Cascade)
  position   Int
  addedAt    DateTime @default(now())
  addedById  String?

  @@unique([playlistId, trackId])
  @@index([playlistId, position])
}

enum CollaboratorRole {
  VIEWER
  EDITOR
}

model PlaylistCollaborator {
  id         String           @id @default(cuid())
  playlistId String
  playlist   Playlist         @relation(fields: [playlistId], references: [id], onDelete: Cascade)
  userId     String
  user       User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  role       CollaboratorRole @default(VIEWER)
  createdAt  DateTime         @default(now())

  @@unique([playlistId, userId])
}
```

Decisions worth recording:

- **`@@unique([playlistId, trackId])`** prevents the same track appearing twice in one playlist. This is
  a product decision rather than a technical one — Spotify permits duplicates. The constraint is the
  clearest place to be explicit about it.
- **Integer `position`.** Reordering rewrites the positions of the affected rows inside a single
  transaction. At the expected playlist sizes this is straightforward and easy to reason about.
  Fractional indexing becomes relevant with thousands of items or concurrent editors; that is recorded
  as a code comment, not implemented.
- **No `Account` or `Session` tables.** The credentials provider uses JWT sessions, so the Auth.js
  Prisma adapter is not required.

## Authorization

Rules live as pure functions in `src/lib/permissions/` with no Prisma dependency, so they can be tested
without a database.

| Action                      | Owner | Editor | Viewer | Authenticated, unrelated | Anonymous |
| --------------------------- | ----- | ------ | ------ | ------------------------ | --------- |
| View a private playlist     | yes   | yes    | yes    | no                       | no        |
| View a public playlist      | yes   | yes    | yes    | yes                      | no        |
| Add or remove tracks        | yes   | yes    | no     | no                       | no        |
| Reorder tracks              | yes   | yes    | no     | no                       | no        |
| Rename or change visibility | yes   | no     | no     | no                       | no        |
| Manage collaborators        | yes   | no     | no     | no                       | no        |
| Delete the playlist         | yes   | no     | no     | no                       | no        |

The entire application sits behind authentication; public playlists still require an account. This
matches an internal office tool, where "public" means visible to all colleagues.

## Sessions and route protection

Two layers with a clear division of responsibility:

1. **`src/proxy.ts`** checks for the presence of a session cookie and redirects to `/login` otherwise.
   This exists for user experience and is explicitly not a security boundary.
2. **The data access layer** resolves the session through `auth()` and verifies permissions on every
   call. This is the authoritative check.

The separation is a direct response to CVE-2025-29927, where a crafted header could bypass the
middleware layer. Relying on layer one alone leaves the application open.

## Mutations

All writes go through Server Actions rather than custom API routes. Every action follows the same
sequence:

1. Resolve the session; abort when absent.
2. Validate input against a Zod schema from `src/lib/validation/`, which also types the form.
3. Check permissions using the functions in `src/lib/permissions/`.
4. Mutate through Prisma, wrapped in a transaction where multiple rows change together.
5. Call `revalidatePath` or `revalidateTag`.
6. Return a result object so the form can render errors without catching exceptions.

Reordering, adding and removing use `useOptimistic` so the list responds immediately. When an action
fails, state rolls back and the failure is announced through a live region.

## Search

Catalog search runs on the server with the query in the URL as `?q=`. That makes a search shareable,
makes the back button behave as expected, and keeps the state out of the client.

Search within a playlist runs on the client, because the full list is already loaded and a server round
trip would only add latency.

In both cases: debounce the input, announce the result count through a live region, and render a
meaningful empty state.

## Playback

Player state lives in a provider above the app shell so audio survives navigation. A single `<audio>`
element is driven through a ref; React owns the queue and the current index, not the audio stream
itself.

No autoplay on page load. This is both a WCAG requirement and the behavior browsers enforce regardless.

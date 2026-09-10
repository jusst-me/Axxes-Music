# 03 — Architectuur

## Grondbeginsel

Alle data-toegang loopt via één laag die weet wie de huidige gebruiker is. Componenten en pagina's
stellen geen eigen queries samen. Daarmee staat autorisatie op één plek, is die te testen, en kan er
geen route ontstaan die de controle per ongeluk overslaat.

```
Server Component / Server Action
        ↓  roept aan
src/lib/data/*          ← controleert sessie en rechten, praat met Prisma
        ↓
Prisma Client → PostgreSQL
```

De data-accesslaag is gemarkeerd met `import 'server-only'`, zodat het een buildfout oplevert als
iemand er vanuit een client component naar grijpt.

## Mappenindeling

Voortbouwend op de structuur die al staat:

```
src/
├── app/
│   ├── (auth)/                  # login en registratie, eigen layout zonder app-shell
│   │   ├── login/
│   │   └── register/
│   ├── (app)/                   # alles achter de login
│   │   ├── layout.tsx           # app-shell: header, nav, spelerbalk
│   │   ├── tracks/              # catalogus met zoeken
│   │   │   └── [trackId]/       # detail, deep-linkbaar naast de dialog
│   │   ├── playlists/
│   │   │   └── [playlistId]/
│   │   └── discover/            # openbare afspeellijsten van anderen
│   └── api/auth/[...nextauth]/  # verplichte route handler van Auth.js
├── components/
│   ├── ui/                      # shadcn-primitieven, niet handmatig bewerken
│   ├── player/
│   ├── playlist/
│   └── track/
├── lib/
│   ├── auth/                    # Auth.js-configuratie, hashing, sessiehelpers
│   ├── data/                    # data-accesslaag, server-only
│   ├── permissions/             # autorisatieregels, puur en testbaar
│   └── validation/              # Zod-schema's, gedeeld tussen formulier en action
├── server/actions/              # Server Actions per domein
├── hooks/
├── providers/                   # theme provider, player provider
├── types/
├── constants/
└── proxy.ts                     # optimistische auth-redirect
```

## Datamodel

Opzet van het Prisma-schema. Definitief bij het uitvoeren van Epic A.

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
  externalId     String          @unique  // trackId uit de iTunes API
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

Een paar keuzes die uitleg verdienen:

- **`@@unique([playlistId, trackId])`** voorkomt hetzelfde nummer twee keer in één afspeellijst. Dat is
  een productkeuze, geen technische: Spotify staat duplicaten wel toe. De constraint is de simpelste
  plek om er duidelijk over te zijn.
- **`position` als geheel getal.** Bij het verslepen worden de posities van de betrokken rijen in één
  transactie herschreven. Bij afspeellijsten van deze omvang is dat prima en veruit het makkelijkst te
  volgen. Fractional indexing zou nodig worden bij duizenden items of gelijktijdige bewerkers; dat
  staat als notitie in de code, niet als implementatie.
- **Geen `Account`- en `Session`-tabel.** De credentials-provider gebruikt JWT-sessies, dus de
  Prisma-adapter van Auth.js is niet nodig.

## Autorisatie

De regels staan als pure functies in `src/lib/permissions/`, zonder Prisma-afhankelijkheid, zodat ze
zonder database te testen zijn.

| Actie                          | Eigenaar | Editor | Viewer | Ingelogd, geen relatie | Uitgelogd |
| ------------------------------ | -------- | ------ | ------ | ---------------------- | --------- |
| Privé-afspeellijst bekijken    | ja       | ja     | ja     | nee                    | nee       |
| Openbare afspeellijst bekijken | ja       | ja     | ja     | ja                     | nee       |
| Nummers toevoegen of weghalen  | ja       | ja     | nee    | nee                    | nee       |
| Volgorde wijzigen              | ja       | ja     | nee    | nee                    | nee       |
| Naam of zichtbaarheid wijzigen | ja       | nee    | nee    | nee                    | nee       |
| Mede-bewerkers beheren         | ja       | nee    | nee    | nee                    | nee       |
| Afspeellijst verwijderen       | ja       | nee    | nee    | nee                    | nee       |

De hele applicatie zit achter de login; ook openbare afspeellijsten vragen om een account. Dat past bij
de context van een intern kantoorhulpmiddel. "Openbaar" betekent hier: zichtbaar voor alle collega's.

## Sessies en routebescherming

Twee lagen, met een duidelijke taakverdeling:

1. **`src/proxy.ts`** kijkt of er een sessiecookie is en stuurt anders door naar `/login`. Dit is puur
   voor de gebruikerservaring en is nadrukkelijk géén beveiliging.
2. **De data-accesslaag** haalt de sessie op met `auth()` en controleert per aanroep de rechten. Dit
   is de bindende controle.

Die scheiding is een direct gevolg van CVE-2025-29927, waarbij een geprepareerde header de
middleware-laag kon omzeilen. Wie alleen op laag 1 vertrouwt, heeft een open applicatie.

## Mutaties

Alle wijzigingen lopen via Server Actions, niet via zelfgebouwde API-routes. Elke action volgt hetzelfde
stramien:

1. Sessie ophalen; geen sessie betekent afbreken.
2. Invoer valideren met een Zod-schema uit `src/lib/validation/`, dat ook het formulier typeert.
3. Rechten controleren met de functies uit `src/lib/permissions/`.
4. Muteren via Prisma, waar nodig in een transactie.
5. `revalidatePath` of `revalidateTag` aanroepen.
6. Een resultaatobject teruggeven, zodat het formulier fouten kan tonen zonder een uitzondering op te
   vangen.

Voor herordenen en voor toevoegen of verwijderen gebruiken we `useOptimistic`, zodat de lijst direct
meebeweegt. Faalt de action, dan rolt de state terug en verschijnt er een melding in een live region.

## Zoeken

Zoeken in de catalogus gebeurt op de server, met de zoekterm in de URL als `?q=`. Daarmee is een
zoekopdracht deelbaar, werkt de terugknop zoals verwacht, en blijft de state uit de client.

Zoeken binnen een afspeellijst gebeurt in de client, omdat de volledige lijst daar al geladen is en een
serverrondgang alleen maar vertraging toevoegt.

In beide gevallen: invoer met vertraging verwerken, resultaten aankondigen via een live region, en een
duidelijke lege staat tonen.

## Afspelen

De spelerstatus leeft in een provider boven de app-shell, zodat het geluid doorloopt bij navigatie. Eén
`<audio>`-element, aangestuurd via een ref; React beheert de wachtrij en de huidige index, niet de
audiostroom zelf.

Geen autoplay bij het laden van een pagina. Dat is zowel een WCAG-eis als de reden dat browsers het
alsnog zouden blokkeren.

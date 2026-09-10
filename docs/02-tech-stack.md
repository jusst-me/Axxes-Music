# 02 — Techstack en onderbouwing

Elke keuze hieronder heeft een reden en een overwogen alternatief. Dat is bewust: in het gesprek is
"waarom niet X" een waarschijnlijkere vraag dan "wat is X".

## Kern

| Laag           | Keuze                         | Versie    |
| -------------- | ----------------------------- | --------- |
| Framework      | Next.js App Router            | 16.3.4    |
| UI-bibliotheek | React                         | 19.2.8    |
| Taal           | TypeScript (strict)           | 5.x       |
| Styling        | Tailwind CSS                  | 4.x       |
| Componenten    | shadcn/ui op Base UI          | base-vega |
| Database       | PostgreSQL (Neon)             | 17        |
| ORM            | Prisma                        | 7.x       |
| Authenticatie  | Auth.js v5 (`next-auth@beta`) | 5.x       |
| Slepen         | dnd-kit                       | 6.x       |
| Animatie       | Motion                        | 12.x      |
| Tests          | Vitest + Testing Library      | 3.x       |
| Hosting        | Vercel                        | —         |

> Let op bij implementatie: Next.js 16 wijkt op meerdere punten af van eerdere versies. Raadpleeg
> `node_modules/next/dist/docs/` vóór het schrijven van code, zoals `AGENTS.md` voorschrijft.

## Waarom Next.js en niet een losse React-SPA

De opdracht vraagt om TypeScript en React, verder niets. Een Vite-SPA had gekund, maar dan moet alles
wat de opdracht interessant maakt in de browser gebeuren, en dan is "login" niet meer dan een
localStorage-vlag. Met Next.js draait de autorisatie op de server, waar die hoort.

Concreet levert het op:

- Server Components halen de catalogus op zonder dat er een API-laag omheen gebouwd hoeft te worden.
- Server Actions verzorgen mutaties met ingebouwde CSRF-bescherming.
- Eén codebase en één deploy, wat past bij het profiel Next.js- en Node.js-developer.

## Waarom Prisma en Postgres, en niet mock-data

Afspeellijsten met zichtbaarheid en mede-bewerkers zijn per definitie meergebruikersfunctionaliteit.
Zonder gedeelde opslag is "openbaar" een leeg begrip. Daarnaast:

- Het Prisma-schema is één leesbaar bestand dat een beoordelaar in korte tijd doorgrondt, inclusief
  relaties, indexen en constraints.
- Migraties in versiebeheer laten zien dat er over schemaverandering is nagedacht.
- Neon heeft een gratis serverless Postgres met directe Vercel-koppeling en database branching per
  preview-deploy.

**Overwogen alternatieven.** Drizzle is lichter en genereert scherpere SQL, maar Prisma is
breder herkenbaar en het schema leest prettiger voor wie het project voor het eerst opent — bij een
assessment weegt dat zwaarder dan queryperformance op een dataset van deze omvang. Supabase zou auth
en database in één keer oplossen, maar verplaatst juist het interessante werk naar een dienst; dan
laat ik niet zien dat ik sessies en autorisatie zelf kan inrichten.

## Waarom Auth.js met credentials

De opdracht vraagt letterlijk om login met e-mail en wachtwoord, dus een OAuth-only oplossing valt af.
Auth.js v5 is de standaard voor Next.js en werkt met Next.js 16.

Aandachtspunten die de implementatie sturen:

- Wachtwoorden worden gehasht met Argon2id. Nooit zelf een hashfunctie bedenken.
- Bij de credentials-provider gebruiken we JWT-sessies. De Prisma-adapter is dan niet nodig; het
  `User`-model beheren we zelf, inclusief `passwordHash`.
- Omgevingsvariabelen gebruiken in v5 het `AUTH_`-voorvoegsel, niet meer `NEXTAUTH_`.
- **Belangrijk:** `src/proxy.ts` (in Next.js 16 de opvolger van `middleware.ts`) mag níet de enige
  autorisatiecontrole zijn. CVE-2025-29927 liet zien dat die laag te omzeilen is met een geprepareerde
  header. Proxy doet een snelle, optimistische check voor de redirect; de bindende controle gebeurt in
  de data-accesslaag bij elke query en mutatie. Zie [03-architecture.md](./03-architecture.md).

## Waarom dnd-kit

Slepen is het onderdeel waar toegankelijkheid meestal sneuvelt, en WCAG 2.2 eist expliciet een
alternatief voor sleepbewegingen met één aanwijzer.

dnd-kit levert een toetsenbordsensor uit de doos: spatie pakt op, pijltjestoetsen verplaatsen, spatie
laat los, Escape annuleert. Het meldt de verplaatsing ook via een ARIA live region, met aanpasbare
teksten, zodat we "Verplaatst naar positie 3 van 12" kunnen zeggen in plaats van iets generieks.

`react-beautiful-dnd` valt af omdat Atlassian het niet meer onderhoudt. Pragmatic drag-and-drop is
sneller bij duizenden items, maar vereist dat je toetsenbordbediening zelf schrijft — precies het
onderdeel dat ik juist goed wil hebben.

**Implementatienoot:** `DndContext` hoort in een client component en mag niet server-side gerenderd
worden. De library genereert oplopende ID's voor ARIA-attributen, wat anders een hydration mismatch
oplevert.

## Waarom een eigen catalogus uit de iTunes Search API

De opdracht veronderstelt een API die nummers en aanvullende informatie levert. De iTunes Search API
vult die rol precies in, vereist geen sleutel, en geeft per nummer: titel, artiest, album, genre,
releasedatum, speelduur, albumhoes tot 600 pixels, een link naar Apple Music en een previewfragment
van 30 seconden.

Dat previewfragment maakt de speler écht werkend in plaats van decoratief, wat de demo aanzienlijk
overtuigender maakt.

De catalogus wordt eenmalig geïmporteerd naar de eigen database via een seed-script, en niet live
doorbevraagd. Daarmee blijft de app werken als de externe dienst hapert, blijft zoeken snel en
voorspelbaar, en kunnen we in Postgres indexeren op titel en artiest.

## Waarom Motion voor animatie

Layout-animaties bij het herordenen van een lijst zijn met CSS alleen slecht te doen. Motion regelt
dat met `layout`-animaties en heeft een `useReducedMotion`-hook, zodat de animaties netjes uitgezet
worden voor wie daar last van heeft. Animaties blijven subtiel en functioneel: ze verklaren een
verandering, ze versieren niet.

## Kwaliteitsgereedschap

| Gereedschap              | Rol                                                               |
| ------------------------ | ----------------------------------------------------------------- |
| ESLint + Prettier        | Al ingericht; single quotes, import-sortering, Tailwind-sortering |
| Husky + lint-staged      | Pre-commit: lint en formatteer alleen de gewijzigde bestanden     |
| commitlint               | Dwingt Conventional Commits af op de commit-message               |
| Vitest + Testing Library | Unit- en componenttests                                           |
| vitest-axe               | Toegankelijkheidsassertions binnen componenttests                 |
| GitHub Actions           | Lint, typecheck, test en build op elke pull request               |

**Waarom Vitest en niet Jest.** Vitest deelt de transformatiepijplijn met Vite, start merkbaar
sneller en heeft native ESM- en TypeScript-ondersteuning zonder extra configuratie.

**Waarom geen uitgebreide end-to-end tests.** Playwright staat als `[extra]` in de backlog met één
scenario: inloggen, afspeellijst maken, nummer toevoegen, volgorde wijzigen. Meer dan dat kost tijd
die beter naar toegankelijkheid gaat, en dat is hier het onderscheidende punt.

## Bewust niet gekozen

| Niet gekozen             | Reden                                                                            |
| ------------------------ | -------------------------------------------------------------------------------- |
| Redux, Zustand of Jotai  | Serverstate hoort op de server; de weinige clientstate past in React zelf        |
| TanStack Query           | Server Components en Server Actions dekken het ophalen en muteren al af          |
| Websockets voor realtime | Voegt infrastructuur toe zonder dat de opdracht erom vraagt                      |
| Storybook                | Waardevol in een designsysteem, hier vooral tijd die niet in de beoordeling telt |
| Docker                   | Neon en Vercel maken lokale containers overbodig                                 |

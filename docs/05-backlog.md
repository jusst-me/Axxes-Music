# 05 — Backlog

Labels: `[opdracht]` staat letterlijk in de opdrachtomschrijving, `[extra]` is mijn eigen toevoeging.
Schatting in T-shirtmaten: S is onder het uur, M is een tot drie uur, L is meer dan drie uur.

Overzicht van de epics:

| Epic | Onderwerp                  | Stories | Zwaartepunt  |
| ---- | -------------------------- | ------- | ------------ |
| A    | Fundament en kwaliteit     | 5       | `[extra]`    |
| B    | Designsysteem en thema's   | 5       | gemengd      |
| C    | Authenticatie              | 5       | `[opdracht]` |
| D    | Muziekcatalogus            | 4       | `[opdracht]` |
| E    | Afspeellijsten beheren     | 6       | gemengd      |
| F    | Inhoud van afspeellijsten  | 6       | `[opdracht]` |
| G    | Afspelen                   | 4       | `[extra]`    |
| H    | Toegankelijkheid en polish | 6       | `[extra]`    |
| I    | Oplevering                 | 3       | gemengd      |

---

## Epic A — Fundament en kwaliteit

Doel: voordat er functionaliteit komt, staat de kwaliteitsbewaking. Anders is die later niet meer geloofwaardig.

### AXM-001 — Husky, lint-staged en commitlint `[extra]`

**Als** ontwikkelaar **wil ik** dat fouten worden tegengehouden vóór de commit **zodat** kwaliteit niet
van mijn oplettendheid afhangt.

- Pre-commit draait ESLint en Prettier over alleen de gewijzigde bestanden.
- Commit-msg valideert tegen Conventional Commits en weigert een commit die niet voldoet.
- De hooks installeren zichzelf via een `prepare`-script na `pnpm install`.
- README beschrijft hoe je een hook in noodgevallen overslaat.

Prioriteit: hoog · Schatting: S

### AXM-002 — Testopzet met Vitest `[extra]`

**Als** ontwikkelaar **wil ik** tests kunnen schrijven en draaien **zodat** gedrag vastligt.

- Vitest met jsdom, Testing Library en `@testing-library/jest-dom`.
- `vitest-axe` beschikbaar voor toegankelijkheidsassertions.
- Scripts `test`, `test:watch` en `test:coverage`.
- Padalias `@/` werkt in tests, en één voorbeeldtest draait groen.

Prioriteit: hoog · Schatting: M

### AXM-003 — GitHub Actions CI `[extra]`

**Als** beoordelaar **wil ik** aan de PR zien dat de build gezond is **zodat** ik de code kan
vertrouwen.

- Workflow draait op push naar `main` en op elke pull request.
- Stappen: install met pnpm-cache, lint, typecheck, test, build.
- Faalt één stap, dan faalt de workflow zichtbaar.
- Doorlooptijd onder de vijf minuten.

Prioriteit: hoog · Schatting: M · Na: AXM-002

### AXM-004 — Vercel en Neon inrichten `[extra]`

**Als** beoordelaar **wil ik** de app in de browser kunnen openen **zodat** ik niets hoef te installeren.

- Vercel-project gekoppeld aan de GitHub-repository.
- Neon Postgres aangemaakt; `DATABASE_URL`, `AUTH_SECRET` en `AUTH_URL` staan als omgevingsvariabelen.
- Preview-deploy per pull request werkt.
- `.env.dist` staat in de repository, echte `.env` niet.

Prioriteit: hoog · Schatting: M

### AXM-005 — Prisma, schema en migraties `[extra]`

**Als** ontwikkelaar **wil ik** een getypeerd datamodel **zodat** de rest van de app daarop kan bouwen.

- Prisma geïnstalleerd en geconfigureerd; client wordt als singleton geëxporteerd om verbindingslekken
  bij hot reload te voorkomen.
- Schema volgens [03-architecture.md](./03-architecture.md), inclusief indexen en unieke constraints.
- Eerste migratie staat in versiebeheer.
- `pnpm db:seed` vult een demo-account en een startcatalogus.

Prioriteit: hoog · Schatting: L · Na: AXM-004

---

## Epic B — Designsysteem en thema's

### AXM-010 — Axxes-tokens in globals.css `[extra]`

**Als** gebruiker **wil ik** een app die eruitziet alsof hij bij Axxes hoort **zodat** het geheel
doordacht aanvoelt.

- Alle shadcn-tokens gevuld met de waarden uit [04-design-system.md](./04-design-system.md), in `oklch()`.
- Zowel licht als donker volledig gedefinieerd.
- Geverifieerd met een contrasttool; de resultaten komen in het designsysteemdocument.
- Geen losse kleurwaarden meer in componenten.

Prioriteit: hoog · Schatting: M

### AXM-011 — Montserrat en typografieschaal `[extra]`

- Montserrat via `next/font/google` met `display: swap` en alleen de benodigde gewichten.
- De Geist- en Inter-fonts uit de create-next-app-opzet zijn verwijderd.
- Koppenschaal vastgelegd in `@theme`; regelafstand van lopende tekst minimaal 1.5.

Prioriteit: middel · Schatting: S · Na: AXM-010

### AXM-012 — Thema-schakelaar `[opdracht, optioneel]`

**Als** gebruiker **wil ik** kunnen wisselen tussen licht en donker **zodat** de app prettig is in mijn
werkomgeving.

- Drie standen: licht, donker en systeem; de keuze wordt onthouden.
- Geen zichtbare flits van het verkeerde thema bij het laden.
- De knop heeft een toegankelijke naam die de huidige stand benoemt en is bedienbaar met het toetsenbord.
- Beide thema's voldoen aan de contrasteisen.

Prioriteit: hoog · Schatting: M · Na: AXM-010

### AXM-013 — App-shell en navigatie `[extra]`

- Header met logo, hoofdnavigatie, thema-schakelaar en gebruikersmenu.
- Semantische landmarks: `header`, `nav`, `main`, `footer`.
- Skip-link naar de hoofdinhoud, zichtbaar zodra hij focus krijgt.
- Werkt van 320 pixels breed tot desktop.
- De actieve navigatie-item is gemarkeerd met `aria-current="page"`.

Prioriteit: hoog · Schatting: M

### AXM-014 — shadcn-componenten toevoegen `[extra]`

- Toegevoegd via de CLI, niet met de hand: `dialog`, `dropdown-menu`, `input`, `label`, `form`,
  `sheet`, `sonner`, `tooltip`, `avatar`, `skeleton`, `alert-dialog`, `select`, `switch`, `slider`.
- Alle componenten gecontroleerd tegen de Axxes-tokens.

Prioriteit: middel · Schatting: S · Na: AXM-010

---

## Epic C — Authenticatie

### AXM-020 — Auth.js met e-mail en wachtwoord `[opdracht]`

**Als** medewerker **wil ik** inloggen met e-mail en wachtwoord **zodat** mijn afspeellijsten van mij zijn.

- Auth.js v5 met de credentials-provider en JWT-sessies.
- Wachtwoorden gehasht met Argon2id; het hash-veld verlaat de server nooit.
- Bij onjuiste gegevens dezelfde foutmelding voor onbekend e-mailadres en fout wachtwoord, zodat er
  geen accounts te achterhalen zijn.
- Sessie bevat gebruikers-ID, naam en e-mail; het type is uitgebreid zodat TypeScript meedenkt.

Prioriteit: hoog · Schatting: L · Na: AXM-005

### AXM-021 — Loginpagina `[opdracht]`

- Formulier met gekoppelde labels, `autocomplete` op e-mail en wachtwoord, en plakken toegestaan.
- Validatie met Zod, gedeeld tussen client en server.
- Fouten gekoppeld via `aria-describedby`, veld gemarkeerd met `aria-invalid`, focus springt naar het
  eerste foute veld.
- Laadstatus tijdens verzenden; dubbel verzenden is niet mogelijk.
- Na inloggen door naar de oorspronkelijk gevraagde pagina.

Prioriteit: hoog · Schatting: M · Na: AXM-020

### AXM-022 — Registratiepagina `[extra]`

- Naam, e-mail en wachtwoord met minimale sterkte-eis en zichtbare uitleg vooraf.
- Dubbel e-mailadres levert een nette veldfout op, geen serverfout.
- Na registratie is de gebruiker meteen ingelogd.

Prioriteit: hoog · Schatting: M · Na: AXM-020

### AXM-023 — Routebescherming `[opdracht]`

- `src/proxy.ts` stuurt bezoekers zonder sessie door naar `/login`, met de bestemming als parameter.
- Elke server action en elke data-functie controleert de sessie zelfstandig; proxy is niet leidend.
- Een test toont aan dat een data-functie weigert zonder geldige sessie.

Prioriteit: hoog · Schatting: M · Na: AXM-020

### AXM-024 — Gebruikersmenu en uitloggen `[extra]`

- Menu in de header toont naam en e-mail en bevat een uitlogoptie.
- Uitloggen wist de sessie en stuurt door naar de loginpagina.
- Het menu volgt het toetsenbordpatroon van een menu en geeft de focus netjes terug bij sluiten.

Prioriteit: middel · Schatting: S · Na: AXM-020

---

## Epic D — Muziekcatalogus

### AXM-030 — Catalogus importeren `[extra]`

**Als** gebruiker **wil ik** een gevulde muziekbibliotheek **zodat** ik meteen aan de slag kan.

- Script haalt nummers op bij de iTunes Search API over meerdere genres en artiesten.
- Per nummer worden titel, artiest, album, genre, releasedatum, speelduur, hoes, previewfragment en
  Apple Music-link opgeslagen.
- Herhaald draaien maakt geen duplicaten: `externalId` is uniek en er wordt `upsert` gebruikt.
- Minimaal 200 nummers met een bruikbaar previewfragment.
- Nummers zonder previewfragment worden overgeslagen of gemarkeerd.

Prioriteit: hoog · Schatting: M · Na: AXM-005

### AXM-031 — Overzicht van beschikbare nummers `[opdracht]`

**Als** gebruiker **wil ik** de beschikbare nummers zien **zodat** ik kan kiezen wat ik toevoeg.

- Server Component toont hoes, titel, artiest, album en speelduur.
- Paginering of oneindig scrollen; niet alles in één keer renderen.
- De lijst is opgebouwd als een echte lijst en per rij met het toetsenbord te bereiken.
- Laadstatus met skeletons en een nette lege staat.
- Ontbrekende hoes valt terug op een placeholder met passende alt-tekst.

Prioriteit: hoog · Schatting: L · Na: AXM-030

### AXM-032 — Zoeken in de catalogus `[opdracht]`

- Zoekterm staat in de URL als `?q=`, zodat de zoekopdracht deelbaar is en de terugknop werkt.
- Zoekt hoofdletterongevoelig op titel, artiest en album.
- Invoer wordt vertraagd verwerkt; de invoer verliest geen focus tijdens het typen.
- Aantal resultaten wordt aangekondigd via een live region.
- Lege staat met een duidelijke suggestie en een knop om te wissen.

Prioriteit: hoog · Schatting: M · Na: AXM-031

### AXM-033 — Nummerdetails `[opdracht]`

**Als** gebruiker **wil ik** meer weten over een nummer **zodat** ik weet wat ik toevoeg.

- Dialog toont album, genre, releasedatum, speelduur, grote hoes en een link naar Apple Music.
- Ook bereikbaar als eigen route `/tracks/[trackId]`, zodat de details deelbaar zijn.
- De dialog houdt de focus vast, sluit met Escape en geeft de focus terug aan de openende knop.
- Vanuit het detail kan het nummer direct aan een afspeellijst worden toegevoegd.

Prioriteit: hoog · Schatting: M · Na: AXM-031

---

## Epic E — Afspeellijsten beheren

### AXM-040 — Afspeellijst aanmaken `[opdracht, optioneel]`

- Naam is verplicht, maximaal 100 tekens; omschrijving is optioneel.
- Nieuwe lijst is standaard privé.
- Na aanmaken gaat de gebruiker naar de nieuwe lijst en volgt er een bevestiging.
- Validatiefouten verschijnen bij het veld zelf.

Prioriteit: hoog · Schatting: M · Na: AXM-023

### AXM-041 — Afspeellijst verwijderen `[extra]`

- Alleen de eigenaar mag verwijderen.
- Bevestigingsdialoog met de naam van de lijst erin; de standaardactie is annuleren.
- Bijbehorende `PlaylistTrack`-rijen worden meeverwijderd via cascade.
- Na verwijderen terug naar het overzicht met een bevestiging.

Prioriteit: hoog · Schatting: S · Na: AXM-040

### AXM-042 — Afspeellijst bewerken `[extra]`

- Naam en omschrijving zijn aanpasbaar door de eigenaar.
- Wijzigingen zijn direct zichtbaar zonder volledige herlaadbeurt.

Prioriteit: middel · Schatting: S · Na: AXM-040

### AXM-043 — Zichtbaarheid instellen `[extra]`

**Als** eigenaar **wil ik** kiezen of collega's mijn lijst zien **zodat** ik ook privé kan verzamelen.

- Schakelaar tussen privé en openbaar, met uitleg wat elke stand betekent.
- Alleen de eigenaar kan dit wijzigen.
- Een privélijst opvragen als buitenstaander geeft een 404, geen 403 — het bestaan van de lijst lekt niet.
- De huidige stand is zichtbaar op de lijstpagina.

Prioriteit: hoog · Schatting: M · Na: AXM-040

### AXM-044 — Openbare afspeellijsten ontdekken `[extra]`

- Overzicht van alle openbare lijsten met eigenaar en aantal nummers.
- Eigen lijsten zijn herkenbaar gemarkeerd.
- Zonder bewerkrechten zijn de bewerkknoppen afwezig, niet slechts uitgeschakeld.

Prioriteit: middel · Schatting: M · Na: AXM-043

### AXM-045 — Mede-bewerkers beheren `[extra]`

**Als** eigenaar **wil ik** collega's laten meebewerken **zodat** we samen de kantoorplaylist maken.

- Collega toevoegen op e-mailadres, met rol kijker of bewerker.
- Rol wijzigen en toegang intrekken kan alleen de eigenaar.
- De lijst met mede-bewerkers is zichtbaar op de lijstpagina.
- Een onbekend e-mailadres geeft een nette melding.

Prioriteit: middel · Schatting: L · Na: AXM-043

### AXM-046 — Autorisatieregels centraal en getest `[extra]`

- De rechtenmatrix uit [03-architecture.md](./03-architecture.md) staat als pure functies in
  `src/lib/permissions/`.
- Elke cel van de matrix heeft een test.
- Server Actions en data-functies gebruiken uitsluitend deze functies.

Prioriteit: hoog · Schatting: M · Na: AXM-045

---

## Epic F — Inhoud van afspeellijsten

### AXM-050 — Nummer toevoegen `[opdracht]`

- Toevoegen kan vanuit de catalogus, vanuit het zoekresultaat en vanuit het detailvenster.
- Bij meerdere afspeellijsten volgt een keuzemenu; anders wordt direct toegevoegd.
- Het nummer komt onderaan de lijst.
- Een dubbele toevoeging wordt netjes gemeld, niet als serverfout.
- De lijst reageert direct en rolt terug als de actie faalt.
- De toevoeging wordt aangekondigd via een live region.

Prioriteit: hoog · Schatting: M · Na: AXM-040

### AXM-051 — Nummer verwijderen `[opdracht]`

- Verwijderknop per rij, met een toegankelijke naam die het nummer benoemt.
- Direct zichtbaar effect, met terugrollen bij een fout.
- Ongedaan maken via de melding.
- Resterende posities blijven aaneengesloten.

Prioriteit: hoog · Schatting: M · Na: AXM-050

### AXM-052 — Zoeken binnen een afspeellijst `[opdracht]`

- Filtert in de client op titel, artiest en album.
- Bij een actief filter is de volgorde niet aan te passen, met uitleg waarom.
- Het aantal resultaten wordt aangekondigd.
- Filter wissen herstelt de volledige lijst.

Prioriteit: hoog · Schatting: S · Na: AXM-050

### AXM-053 — Volgorde aanpassen `[opdracht, optioneel]`

**Als** gebruiker **wil ik** de volgorde bepalen **zodat** de lijst loopt zoals ik wil.

- Slepen met de muis en met touch, via dnd-kit.
- Volledig met het toetsenbord: spatie pakt op, pijltjes verplaatsen, spatie laat los, Escape annuleert.
- Elke verplaatsing wordt aangekondigd, bijvoorbeeld "Verplaatst naar positie 3 van 12".
- Zichtbare instructie voor toetsenbordgebruikers bij de sleepgreep.
- Nieuwe volgorde wordt in één transactie opgeslagen en blijft na herladen bewaard.
- De sleepgreep is minimaal 24 bij 24 pixels.
- Zonder animatie, bij `prefers-reduced-motion`, werkt alles nog.

Prioriteit: hoog · Schatting: L · Na: AXM-050

### AXM-054 — Slepen tussen de lijsten `[opdracht, optioneel]`

- Een nummer uit de catalogus is naar de afspeellijst te slepen.
- Het doelgebied is duidelijk gemarkeerd tijdens het slepen.
- Er is een gelijkwaardig alternatief zonder slepen, namelijk de toevoegknop uit AXM-050.
- Loslaten buiten een geldig doel annuleert netjes.

Prioriteit: middel · Schatting: L · Na: AXM-053

### AXM-055 — Optimistische updates `[extra]`

- Toevoegen, verwijderen en herordenen tonen het resultaat direct.
- Bij een fout rolt de state terug en verschijnt er een begrijpelijke melding.
- Er is een test die het terugrollen aantoont.

Prioriteit: middel · Schatting: M · Na: AXM-053

---

## Epic G — Afspelen

### AXM-060 — Spelerbalk en spelerstate `[extra]`

- Provider boven de app-shell, zodat het geluid doorloopt bij navigatie.
- Vaste balk onderaan met hoes, titel, artiest en bediening.
- Geen autoplay; er klinkt pas iets na een handeling van de gebruiker.
- De balk dekt geen focus af; de pagina houdt onderaan ruimte vrij.

Prioriteit: middel · Schatting: L · Na: AXM-031

### AXM-061 — Bediening en voortgang `[extra]`

- Afspelen, pauzeren, vorige, volgende en volume.
- Voortgangsbalk is versleepbaar en toont verstreken en resterende tijd.
- Aan het eind van het fragment start automatisch het volgende nummer uit de wachtrij.
- Netwerkfouten leveren een melding op, geen stille stilte.

Prioriteit: middel · Schatting: M · Na: AXM-060

### AXM-062 — Toegankelijke speler `[extra]`

- Alle bediening is met het toetsenbord te gebruiken en heeft toegankelijke namen.
- De afspeelknop meldt zijn toestand via `aria-pressed` of een wisselende naam.
- De voortgangsbalk is een schuifregelaar met correcte waarden en is met pijltjes te bedienen.
- Het spelende nummer wordt bij wisseling beleefd aangekondigd.

Prioriteit: hoog · Schatting: M · Na: AXM-061

### AXM-063 — Wachtrij vanuit een afspeellijst `[extra]`

- "Alles afspelen" zet de hele lijst in de wachtrij in de huidige volgorde.
- Het spelende nummer is in de lijst gemarkeerd.
- De wachtrij volgt een wijziging van de volgorde.

Prioriteit: laag · Schatting: M · Na: AXM-061

---

## Epic H — Toegankelijkheid en polish

### AXM-070 — Focusbeheer `[extra]`

- Zichtbare focusindicator van minimaal 2 pixels op elk bedienbaar element, in beide thema's.
- Bij het sluiten van een dialog gaat de focus terug naar het element dat hem opende.
- Na het verwijderen van een rij landt de focus op een logische plek, niet op `body`.
- Focus wordt nooit afgedekt door de spelerbalk.

Prioriteit: hoog · Schatting: M

### AXM-071 — Meldingen via live regions `[extra]`

- Eén centrale live region voor statusmeldingen.
- Toevoegen, verwijderen, verplaatsen en zoekresultaten worden gemeld.
- Beleefd waar het kan, dringend alleen bij fouten.
- Meldingen worden niet gestapeld tot ruis.

Prioriteit: hoog · Schatting: M

### AXM-072 — Contrast valideren `[extra]`

- Alle tekst- en achtergrondcombinaties in beide thema's gemeten.
- Bodytekst haalt 4.5:1, grote tekst en UI-elementen halen 3:1.
- De uitkomsten staan in [04-design-system.md](./04-design-system.md).

Prioriteit: hoog · Schatting: S · Na: AXM-010

### AXM-073 — Animatie met respect voor voorkeuren `[extra]`

- Alle animaties worden uitgeschakeld bij `prefers-reduced-motion: reduce`.
- Zonder animatie is elke functie volledig bruikbaar.
- Niets duurt langer dan 300 ms.

Prioriteit: middel · Schatting: M

### AXM-074 — Lege, ladende en foutstatussen `[extra]`

- Elke lijst heeft een lege staat met een zinvolle vervolgstap.
- Laadstatussen gebruiken skeletons in plaats van een springende layout.
- Er is een `error.tsx` en een `not-found.tsx` in de app-routes.
- Foutmeldingen zijn in gewone taal, zonder stacktrace.

Prioriteit: middel · Schatting: M

### AXM-075 — Toegankelijkheidsaudit `[extra]`

- Automatische axe-controle op de hoofdpagina's, zonder bevindingen van niveau ernstig of kritiek.
- Handmatige doorloop met alleen het toetsenbord over de belangrijkste route.
- Steekproef met VoiceOver op de catalogus, de afspeellijst en het slepen.
- Bevindingen en oplossingen vastgelegd in `docs/`.

Prioriteit: hoog · Schatting: M · Na: alle functionele epics

---

## Epic I — Oplevering

### AXM-080 — README `[opdracht]`

- Korte uitleg van het project met een link naar de live demo.
- Instructies om lokaal te draaien, inclusief database en seed.
- Gemaakte keuzes en de onderbouwing, met verwijzing naar `docs/`.
- Expliciete lijst met wat er niet af is en wat ik als volgende stap zou doen — de opdracht vraagt hier
  om.
- Verantwoording waarom er zonder de startercode is gewerkt.

Prioriteit: hoog · Schatting: M

### AXM-081 — Demodata `[extra]`

- Seed maakt twee gebruikers, zodat samen bewerken te demonstreren is.
- Vooraf gevulde afspeellijsten: één privé, één openbaar en één gedeeld.
- De inloggegevens van het demo-account staan in de README.

Prioriteit: hoog · Schatting: S · Na: AXM-045

### AXM-082 — Demoscenario `[extra]`

- Uitgeschreven route van vijf minuten voor het gesprek: inloggen, zoeken, detail bekijken,
  toevoegen, herordenen met het toetsenbord, delen, thema wisselen, afspelen.
- Vooraf gecontroleerd op de productieomgeving.

Prioriteit: middel · Schatting: S · Na: AXM-080

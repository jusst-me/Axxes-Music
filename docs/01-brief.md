# 01 — Opdracht en scope

## Context

Axxes IT Consultancy vraagt als technisch assessment om een Spotify-achtige applicatie waarmee
collega's samen afspeellijsten kunnen samenstellen. De begeleidende tekst schetst een project dat
door een stagiair is begonnen en niet is afgemaakt; de opdracht is om het "productie-waardig" op te
leveren.

## Uitgangspunt: opnieuw opgebouwd

Er is geen bruikbare startercode of API beschikbaar gesteld, dus dit project is volledig opnieuw
opgezet in Next.js. Dat is een bewuste keuze en geen omweg:

- De opdracht vraagt om TypeScript en React. Next.js voegt daar de server-kant aan toe, waardoor
  login, autorisatie en gedeelde afspeellijsten echt kunnen werken in plaats van alleen in de browser.
- De opdracht noemt "een API die aanvullende informatie over de nummers levert". Die rol wordt
  ingevuld door de publieke iTunes Search API, waaruit de catalogus wordt geïmporteerd. Die levert
  album, genre, releasedatum, speelduur én een previewfragment van 30 seconden.

Dit staat ook in de README, zodat de beoordelaar weet waarom er van het startpunt is afgeweken.

## Wat Axxes expliciet vraagt

Uit de opdrachtomschrijving, in volgorde van de tekst:

| #   | Eis                                                          | Backlog     |
| --- | ------------------------------------------------------------ | ----------- |
| 1   | Login met e-mail en wachtwoord                               | Epic C      |
| 2   | Tonen van een lijst van beschikbare nummers                  | Epic D      |
| 3   | Een nummer toevoegen aan de afspeellijst                     | Epic F      |
| 4   | Een nummer verwijderen van de afspeellijst                   | Epic F      |
| 5   | Zoekfunctionaliteit in beide lijsten                         | Epic D en F |
| 6   | Aanvullende nummerinformatie tonen in pop-up of detailpagina | Epic D      |

En als optionele user stories:

| #   | Optionele eis                           | Backlog |
| --- | --------------------------------------- | ------- |
| 7   | Drag-and-drop tussen de lijsten         | Epic F  |
| 8   | Meerdere afspeellijsten kunnen aanmaken | Epic E  |
| 9   | Dark & light theme                      | Epic B  |

Alle negen punten zitten in de scope. De drie optionele stories zijn juist interessant om op te
pakken, omdat ze het verschil laten zien tussen "werkt" en "goed gebouwd".

## Wat ik er zelf bovenop doe

Deze punten staan niet in de opdracht maar horen bij hoe ik voor echte klanten werk. Ze zijn in de
backlog gelabeld met `[extra]` zodat ze los te laten zijn als de tijd knelt.

- **Zichtbaarheid van afspeellijsten** — privé of openbaar, plus het optioneel uitnodigen van
  collega's als mede-bewerker. Dit past bij de context uit de opdracht: één kantoor dat samen de
  muziek bepaalt. Het dwingt ook een fatsoenlijk autorisatiemodel af.
- **WCAG 2.2 AA** — met name toetsenbordbediening en contrast. Drag-and-drop is hierin het
  interessantste onderdeel, omdat sleepinteracties standaard onbruikbaar zijn zonder muis.
- **Werkende audiospeler** — previewfragmenten, met een verzorgde spelerbalk.
- **Subtiele animaties** — die respecteren `prefers-reduced-motion`.
- **Unit tests** — op de logica die er echt toe doet: autorisatie, zoeken en herordenen.
- **GitHub Actions, Husky en commitlint** — kwaliteitsbewaking die niet afhangt van discipline.
- **Deploy op Vercel** — met preview-omgevingen per pull request.
- **Axxes-huisstijl** — kleuren en typografie afgeleid van axxes.nl, zie
  [04-design-system.md](./04-design-system.md).

## Buiten scope

Bewust niet gebouwd, en als zodanig genoemd in de README:

- Echte muziekstreaming of rechten op volledige nummers. Previewfragmenten van 30 seconden zijn
  representatief en juridisch onproblematisch voor een demo.
- Wachtwoord vergeten, e-mailverificatie en OAuth-providers. Interessant, maar het voegt niets toe aan
  wat de opdracht toetst.
- Realtime samenwerking via websockets. Mede-bewerkers zien elkaars wijzigingen na een refetch, niet
  live. De reden hiervoor staat in [02-tech-stack.md](./02-tech-stack.md).
- Native mobiele app of offline-ondersteuning.

## Tijdsindicatie

De opdracht adviseert niet meer dan acht uur te besteden en het restant in de README te noteren. Die
acht uur dekt ruwweg de negen genoemde eisen. Alles met het label `[extra]` valt daarbuiten; dat is
een bewuste investering in het gesprek en wordt in de README ook zo benoemd. De backlog is zo
geordend dat de opdracht-eisen eerst af zijn.

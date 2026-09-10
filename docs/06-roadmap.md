# 06 — Volgorde, mijlpalen en Definition of Done

## Uitgangspunt van de volgorde

De volgorde is zo gekozen dat er na elke mijlpaal iets werkends staat dat gedemonstreerd kan worden.
Niet eerst alle infrastructuur en dan pas functionaliteit: dan bestaat het risico dat de demo op het
laatste moment moet ontstaan.

Twee harde afspraken:

1. **Alles wat de opdracht letterlijk vraagt, is af vóór er aan `[extra]`-werk begonnen wordt.** Loopt de
   tijd op, dan sneuvelt het extra werk, niet de opdracht.
2. **De app staat vanaf mijlpaal 1 live op Vercel.** Deployen is dan geen sluitstuk en dus geen risico.

## Mijlpalen

### M0 — Fundament

**Doel:** een lege maar gezonde applicatie, live, met kwaliteitsbewaking die werkt.

AXM-001, AXM-002, AXM-003, AXM-004, AXM-005

**Klaar als:** een pull request draait door CI, de app is bereikbaar op een Vercel-URL en er staat een
gemigreerde database met seed.

### M1 — Inloggen en huisstijl

**Doel:** de app ziet eruit als Axxes en herkent wie je bent.

AXM-010, AXM-011, AXM-013, AXM-014, AXM-020, AXM-021, AXM-022, AXM-023, AXM-024

**Klaar als:** je een account kunt aanmaken, kunt inloggen en uitloggen, en niet-ingelogde bezoekers
netjes bij de login uitkomen.

### M2 — De kern van de opdracht

**Doel:** alles wat de opdracht als hoofdeis noemt, werkt.

AXM-030, AXM-031, AXM-032, AXM-033, AXM-040, AXM-050, AXM-051, AXM-052

**Klaar als:** de zes hoofdeisen uit [01-brief.md](./01-brief.md) aantoonbaar werken. Dit is het punt
waarop de opdracht in principe ingeleverd kan worden.

### M3 — De optionele stories

**Doel:** de drie optionele user stories uit de opdracht.

AXM-012, AXM-041, AXM-053, AXM-054

**Klaar als:** meerdere afspeellijsten, slepen tussen en binnen lijsten inclusief toetsenbordbediening,
en een werkende thema-schakelaar.

### M4 — Eigen profilering

**Doel:** het werk waarmee ik me onderscheid.

AXM-042, AXM-043, AXM-044, AXM-045, AXM-046, AXM-055, AXM-060, AXM-061, AXM-062, AXM-063

**Klaar als:** afspeellijsten hebben zichtbaarheid en mede-bewerkers, en de speler werkt met echte
previewfragmenten.

### M5 — Afronden

**Doel:** oplevering waar ik achter sta.

AXM-070, AXM-071, AXM-072, AXM-073, AXM-074, AXM-075, AXM-080, AXM-081, AXM-082

**Klaar als:** de toegankelijkheidsaudit schoon is, de README compleet is inclusief restpunten, en het
demoscenario op productie is doorlopen.

> De opdracht vraagt om twee dagen vóór het gesprek klaar te zijn. M5 moet dus voor die datum af zijn,
> niet op die datum.

## Definition of Done

Een story is pas klaar als al het volgende geldt:

**Functioneel**

- [ ] Alle acceptatiecriteria uit de story zijn aantoonbaar behaald.
- [ ] Lege, ladende en foutstatussen zijn afgehandeld.

**Code**

- [ ] `pnpm check` en `pnpm typecheck` slagen zonder waarschuwingen.
- [ ] Geen `any`, geen uitgezette lint-regels zonder toelichting.
- [ ] Alle imports gebruiken het `@/`-alias.
- [ ] Geen commentaar dat herhaalt wat de code al zegt.

**Toegankelijkheid**

- [ ] Volledig bedienbaar met alleen het toetsenbord.
- [ ] Focus is zichtbaar en wordt bij statuswijzigingen bewust verplaatst.
- [ ] Contrast gecontroleerd in zowel het lichte als het donkere thema.
- [ ] Statuswijzigingen worden aangekondigd aan schermlezers.
- [ ] Geen axe-bevindingen van niveau ernstig of kritiek.

**Tests**

- [ ] Logica met vertakkingen heeft unittests, met de randgevallen erbij.
- [ ] Autorisatiewijzigingen hebben een test per rol.
- [ ] Alle tests slagen lokaal en in CI.

**Proces**

- [ ] Branch heeft de story-ID in de naam.
- [ ] Commits volgen Conventional Commits.
- [ ] CI is groen en de preview-deploy is met de hand gecontroleerd.
- [ ] Afwijkingen van de documentatie zijn in dezelfde pull request bijgewerkt.

## Risico's

| Risico                                                       | Kans   | Aanpak                                                                                     |
| ------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------ |
| Toegankelijk slepen kost meer tijd dan gedacht               | hoog   | Eerst AXM-053 binnen één lijst afmaken; AXM-054 tussen lijsten is pas daarna aan de beurt  |
| Next.js 16 wijkt af van bekende patronen                     | middel | Vóór elke taak de meegeleverde documentatie in `node_modules/next/dist/docs/` raadplegen   |
| Auth.js v5 draait op een beta-versie                         | middel | Versie vastzetten, niet meeliften op nieuwe releases tijdens het project                   |
| Scope groeit voorbij wat in de resterende tijd past          | hoog   | De mijlpaalvolgorde is bindend; `[extra]` sneuvelt eerst en komt in de README als restpunt |
| Previewfragmenten van iTunes vallen weg of blokkeren         | laag   | Fragmenten zijn niet essentieel; de app werkt zonder geluid volledig                       |
| Uitloop richting de deadline van twee dagen vóór het gesprek | middel | M2 is een volwaardig inleverpunt; alles daarna is optioneel                                |

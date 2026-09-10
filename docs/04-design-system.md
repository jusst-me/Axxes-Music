# 04 — Designsysteem en toegankelijkheid

De huisstijl is afgeleid van de stylesheet van axxes.nl. Het doel is herkenbaarheid, geen imitatie:
een beoordelaar moet bij het openen van de app meteen zien dat er over de merkcontext is nagedacht.

## Merkkleuren

Uit `axxes.nl/assets/css/main.css`, op frequentie van gebruik:

| Rol in de huisstijl | Hex       | Waarvoor bij Axxes                 |
| ------------------- | --------- | ---------------------------------- |
| Accent (oranje)     | `#E9531D` | Knoppen, accenten, hover-vlakken   |
| Donker (charcoal)   | `#1D242B` | Footer, donkere secties, bodytekst |
| Licht               | `#F9F9F9` | Paginaachtergrond                  |
| Slate               | `#313D47` | Secundaire donkere vlakken         |
| Grijs               | `#5B6770` | Secundaire tekst                   |
| Lichtgrijs          | `#A0A7AB` | Randen, uitgeschakelde elementen   |
| Teal donker         | `#035D67` | Secundair accent                   |
| Teal licht          | `#90B6BB` | Secundair accent                   |
| Oranje donker       | `#BC3F12` | Hover-variant van het accent       |

Typografie op axxes.nl is Montserrat in combinatie met objektiv-mk1. Die laatste is een
Adobe-licentiefont en gebruiken we niet; **Montserrat** via `next/font/google` draagt de huisstijl
voldoende.

## Het contrastprobleem, en hoe we het oplossen

Het merkoranje is het karakteristieke element van de huisstijl, maar het is als bodytekst niet
toegankelijk. Onderstaande verhoudingen zijn berekend volgens de WCAG-formule voor relatieve
luminantie en worden bij implementatie geverifieerd met een contrasttool.

| Combinatie             | Ratio      | AA-bodytekst (4.5:1) | AA-groot en UI (3:1) |
| ---------------------- | ---------- | -------------------- | -------------------- |
| `#E9531D` op wit       | ≈ 3.7 : 1  | onvoldoende          | voldoende            |
| `#E9531D` op `#1D242B` | ≈ 4.3 : 1  | onvoldoende          | voldoende            |
| `#BC3F12` op `#F9F9F9` | ≈ 5.4 : 1  | voldoende            | voldoende            |
| `#1D242B` op `#F9F9F9` | ≈ 14.9 : 1 | voldoende            | voldoende            |
| `#5B6770` op `#F9F9F9` | ≈ 5.5 : 1  | voldoende            | voldoende            |
| `#A0A7AB` op `#F9F9F9` | ≈ 2.3 : 1  | onvoldoende          | onvoldoende          |
| `#035D67` op wit       | ≈ 7.6 : 1  | voldoende            | voldoende            |
| `#90B6BB` op `#1D242B` | ≈ 7.2 : 1  | voldoende            | voldoende            |

Daaruit volgen drie regels die de hele UI sturen:

1. **`#E9531D` is een vlakkleur, geen tekstkleur.** Prima voor knopachtergronden met witte tekst, voor
   randen, voor focusringen en voor grote koppen. Niet voor lopende tekst of kleine links.
2. **Oranje tekst krijgt per thema een eigen tint.** In het lichte thema `#BC3F12`, in het donkere thema
   een lichtere tint rond `#FF7A45` (≈ 6.1 : 1 op charcoal).
3. **`#A0A7AB` is nooit tekst.** Alleen randen, scheidingslijnen en uitgeschakelde elementen — en zelfs
   dan met een controle of de 3:1-eis voor UI-componenten gehaald wordt.

Gelukkig haalt het merkoranje in beide thema's wél de 3:1 die WCAG voor focusindicatoren vraagt. De
focusring kan dus in beide thema's oranje blijven, wat de huisstijl juist versterkt.

## Tokens

Tailwind v4 configureert alles in CSS, dus de tokens komen in `src/app/globals.css` te staan. shadcn
werkt al met semantische variabelen (`--primary`, `--background`, `--muted`); die vullen we met de
Axxes-waarden in plaats van er nieuwe namen naast te zetten.

Toewijzing op hoofdlijnen:

| shadcn-token           | Licht thema           | Donker thema        |
| ---------------------- | --------------------- | ------------------- |
| `--background`         | `#F9F9F9`             | `#1D242B`           |
| `--foreground`         | `#1D242B`             | `#F9F9F9`           |
| `--card`, `--popover`  | wit                   | `#313D47`           |
| `--primary`            | `#E9531D`             | `#E9531D`           |
| `--primary-foreground` | wit                   | wit                 |
| `--secondary`          | `#035D67`             | `#90B6BB`           |
| `--muted-foreground`   | `#5B6770`             | lichtere grijstint  |
| `--border`, `--input`  | `#A0A7AB` transparant | wit op lage dekking |
| `--ring`               | `#E9531D`             | `#E9531D`           |

Kleuren worden genoteerd in `oklch()`, in lijn met wat shadcn genereert. Dat maakt tinten afleiden
voorspelbaarder dan met hex.

## Thema's

Licht, donker en "volg systeem", via `next-themes` met een klasse op `<html>`. De keuze wordt onthouden.
De schakelaar staat in de header en is een echte knop met een toegankelijke naam die de huidige stand
benoemt.

Belangrijk detail: de themavoorkeur moet vóór de eerste paint toegepast worden, anders flitst het
lichte thema kort door bij een donkere voorkeur. `next-themes` regelt dat met een inline script.

## Toegankelijkheidsuitgangspunten

De volledige regelset staat in `.cursor/rules/wcag.mdc`. De punten die in dit project het meeste sturen:

- **Toetsenbord voor alles.** Elke functie moet zonder muis bruikbaar zijn. Slepen is hierin de
  lastigste, en tegelijk de meest sprekende: dnd-kit levert de toetsenbordbediening, wij leveren de
  instructie en de aankondigingen.
- **Zichtbare focus.** Minimaal 2 pixels, in merkoranje, nooit weggehaald zonder alternatief, en niet
  afgedekt door de spelerbalk onderaan. Dat laatste vraagt om `scroll-padding-bottom` ter hoogte van
  de speler.
- **Meldingen die je hoort.** Nummer toegevoegd, nummer verwijderd, volgorde gewijzigd, zoekresultaten
  bijgewerkt: allemaal via een `aria-live`-gebied. Een schermlezer mag niet in stilte achterblijven.
- **Raakvlakken van minimaal 24 bij 24 pixels**, met voldoende tussenruimte. Dichte lijsten met
  icoonknoppen zijn hier het risico.
- **Eén `h1` per pagina** en een koppenstructuur die niet springt.
- **Animatie is optioneel.** Alles achter `prefers-reduced-motion`; zonder animatie moet de app
  volledig werken.

## Animatieprincipes

Animatie legt uit wat er gebeurde, en trekt geen aandacht naar zichzelf.

| Waar                     | Wat                                                     | Duur       |
| ------------------------ | ------------------------------------------------------- | ---------- |
| Nummer toegevoegd of weg | Rij schuift in of uit, omliggende rijen verschuiven mee | 150–200 ms |
| Volgorde gewijzigd       | Layout-animatie van dnd-kit en Motion                   | 200 ms     |
| Dialog en sheet          | Fade met lichte schaal                                  | 150 ms     |
| Spelerbalk verschijnt    | Schuift omhoog vanaf de onderrand                       | 250 ms     |
| Themawissel              | Korte kleurovergang op achtergrond en tekst             | 200 ms     |

Niets duurt langer dan 300 ms, en er beweegt niets zonder dat de gebruiker iets deed.

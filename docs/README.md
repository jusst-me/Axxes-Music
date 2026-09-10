# Axxes Music — projectdocumentatie

Deze map is de backlog en het projectgeheugen van dit project. Er is geen Jira of Linear; alles staat hier
als Markdown zodat het meegroeit met de code, in code review zichtbaar is, en tijdens het
sollicitatiegesprek gewoon voorgelezen kan worden.

## Leeswijzer

| Document                                     | Waarvoor                                                                     |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| [01-brief.md](./01-brief.md)                 | Wat Axxes gevraagd heeft, wat ik er bewust bij doe, en wat buiten scope valt |
| [02-tech-stack.md](./02-tech-stack.md)       | Elke technologiekeuze met onderbouwing en overwogen alternatieven            |
| [03-architecture.md](./03-architecture.md)   | Mappenindeling, datamodel, autorisatie en dataflow                           |
| [04-design-system.md](./04-design-system.md) | Axxes-huisstijl vertaald naar tokens, inclusief contrastberekeningen         |
| [05-backlog.md](./05-backlog.md)             | Alle user stories met acceptatiecriteria                                     |
| [06-roadmap.md](./06-roadmap.md)             | Volgorde van bouwen, mijlpalen en de Definition of Done                      |

## Werkafspraken

- Eén story per branch, met de story-ID in de branchnaam: `feature/axm-041-playlist-verwijderen`.
- Commits volgen [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
- Een story is pas klaar als de Definition of Done in [06-roadmap.md](./06-roadmap.md) is afgevinkt.
- Wijkt de implementatie af van wat hier staat? Dan wordt dit document bijgewerkt in dezelfde
  pull request. De documentatie mag nooit achterlopen op de code.

## Statuslegenda

Stories in de backlog dragen twee labels:

- `[opdracht]` — expliciet gevraagd in de opdrachtomschrijving van Axxes.
- `[extra]` — mijn eigen toevoeging om vakmanschap te laten zien. Deze zijn los te laten als de tijd knelt.

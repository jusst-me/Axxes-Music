# Axxes Music — project documentation

This directory holds the working documentation for the project: scope, technical decisions, backlog
and delivery plan. There is no external issue tracker, so everything lives here as Markdown. It
travels with the code, shows up in review, and stays correct because it is maintained in the same
pull requests as the changes it describes.

## Contents

| Document                                     | Purpose                                                             |
| -------------------------------------------- | ------------------------------------------------------------------- |
| [01-brief.md](./01-brief.md)                 | Client requirements, agreed scope and explicit exclusions           |
| [02-tech-stack.md](./02-tech-stack.md)       | Every technology decision, with rationale and rejected alternatives |
| [03-architecture.md](./03-architecture.md)   | Directory layout, data model, authorization and data flow           |
| [04-design-system.md](./04-design-system.md) | Axxes brand identity as design tokens, including contrast analysis  |
| [05-backlog.md](./05-backlog.md)             | User stories with acceptance criteria                               |
| [06-roadmap.md](./06-roadmap.md)             | Delivery order, milestones and the Definition of Done               |

## Working agreements

- One story per branch, with the story ID in the branch name: `feature/axm-041-delete-playlist`.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
- A story is complete only when the Definition of Done in [06-roadmap.md](./06-roadmap.md) is met.
- When an implementation diverges from these documents, the documents are updated in the same pull
  request. Documentation must never lag behind the code.
- All documentation, code comments and identifiers are written in English.

## Story labels

Backlog items carry one of three labels:

- `[required]` — explicitly requested in the client brief.
- `[required, optional]` — listed in the brief as an optional requirement.
- `[proposed]` — not requested, added because it raises the quality of the delivered product. These
  are the first candidates to drop if the schedule tightens.

# 06 — Delivery plan

## Sequencing principle

The order is chosen so that something demonstrable exists after every milestone. Not all
infrastructure first and features afterwards: that pattern leaves the working product to emerge at the
last moment, which is where delivery risk concentrates.

Two fixed rules:

1. **Everything in the client brief is complete before any `[proposed]` work starts.** If the schedule
   tightens, the proposed increment is cut, never the agreed scope.
2. **The application is deployed from milestone M0 onward.** Deployment is therefore never a final
   step, and never a surprise.

## Milestones

### M0 — Foundation

**Goal:** an empty but healthy application, deployed, with working quality gates.

AXM-001, AXM-002, AXM-003, AXM-004, AXM-005

**Complete when:** a pull request passes CI, the application is reachable on a Vercel URL, and a
migrated, seeded database exists.

### M1 — Identity, language and authentication

**Goal:** the application looks like Axxes, speaks three languages, and knows who you are.

AXM-010, AXM-011, AXM-013, AXM-014, AXM-090, AXM-091, AXM-092, AXM-093, AXM-094, AXM-095, AXM-020,
AXM-021, AXM-022, AXM-023, AXM-024, AXM-100

**Complete when:** an account can be created, sign-in and sign-out work in all three languages, and
unauthenticated visitors are routed to the sign-in page with their locale preserved.

Locale routing lands in this milestone rather than later on purpose. Moving routes under `[locale]` is
cheap while there are four of them and expensive once there are twenty, and every screen built before
the message catalogs exist is a screen whose copy has to be extracted again afterwards.

### M2 — Core requirements

**Goal:** everything the brief lists as a primary requirement.

AXM-030, AXM-031, AXM-032, AXM-033, AXM-040, AXM-050, AXM-051, AXM-052

**Complete when:** the six primary requirements in [01-brief.md](./01-brief.md) are demonstrably
working. This is a viable delivery point on its own.

### M3 — Optional requirements

**Goal:** the three optional stories from the brief.

AXM-012, AXM-041, AXM-053, AXM-054

**Complete when:** multiple playlists, dragging within and between lists including keyboard operation,
and a working theme toggle.

### M4 — Proposed increment

**Goal:** the additions that raise the product beyond the brief.

AXM-042, AXM-043, AXM-044, AXM-045, AXM-046, AXM-055, AXM-060, AXM-061, AXM-062, AXM-063, AXM-101,
AXM-102

**Complete when:** playlists support visibility and collaborators, the player works with real preview
clips, and a visitor without an account lands on a page that explains the product.

The landing page sits here rather than in M1 on purpose. Its routing rules are structural and land
early as AXM-100, but the page itself markets features that must exist before they can honestly be
shown.

### M5 — Hardening and handover

**Goal:** a delivery worth signing off on.

AXM-070, AXM-071, AXM-072, AXM-073, AXM-074, AXM-075, AXM-080, AXM-081, AXM-082

**Complete when:** the accessibility audit is clean, the README is complete including outstanding work,
and the walkthrough has been verified against production.

> M5 must be finished ahead of the agreed delivery date, not on it.

## Definition of Done

A story is complete only when all of the following hold:

**Functional**

- [ ] Every acceptance criterion in the story is demonstrably met.
- [ ] Empty, loading and error states are handled.
- [ ] All user-facing copy comes from the message catalogs, in all three languages.
- [ ] Navigation uses the locale-aware helpers from `src/i18n/navigation.ts`.

**Code**

- [ ] `pnpm check` and `pnpm typecheck` pass without warnings.
- [ ] No `any`, and no disabled lint rules without a written justification.
- [ ] All imports use the `@/` alias.
- [ ] No comments restating what the code already says.

**Accessibility**

- [ ] Fully operable with the keyboard alone.
- [ ] Focus is visible and moved deliberately on state changes.
- [ ] Contrast verified in both light and dark themes.
- [ ] State changes are announced to screen readers.
- [ ] `<html lang>` matches the active locale, and layouts hold at the longest translation.
- [ ] No serious or critical axe findings.

**Tests**

- [ ] Branching logic is covered by unit tests, including edge cases.
- [ ] Authorization changes are covered per role.
- [ ] The full suite passes locally and in CI.

**Process**

- [ ] The branch name contains the story ID.
- [ ] Commits follow Conventional Commits.
- [ ] CI is green and the preview deployment has been checked manually.
- [ ] Any divergence from the documentation is corrected in the same pull request.

## Risks

| Risk                                                 | Likelihood | Mitigation                                                                            |
| ---------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------- |
| Accessible drag and drop takes longer than estimated | high       | Finish AXM-053 within a single list first; AXM-054 across lists only afterwards       |
| Next.js 16 diverges from familiar patterns           | medium     | Consult the bundled documentation in `node_modules/next/dist/docs/` before each task  |
| Auth.js v5 is a pre-release version                  | medium     | Pin the version; do not adopt new releases mid-project                                |
| Scope grows beyond the available time                | high       | Milestone order is binding; `[proposed]` work is cut first and recorded in the README |
| iTunes preview clips become unavailable or blocked   | low        | Clips are non-essential; the application is fully functional without audio            |
| Schedule slips toward the delivery date              | medium     | M2 is a complete delivery point; everything beyond it is optional                     |
| Translations drift apart as copy is added            | medium     | A build-time check fails when the three catalogs do not expose identical keys         |
| German copy overflows layouts designed in English    | medium     | Review components at the longest translation; no fixed widths on text containers      |

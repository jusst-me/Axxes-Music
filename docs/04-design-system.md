# 04 — Design system and accessibility

The visual identity is derived from the stylesheet of axxes.nl. The goal is recognition rather than
imitation: the application should read as part of the Axxes family without pretending to be the
corporate website.

## Brand colors

Taken from `axxes.nl/assets/css/main.css`, ordered by frequency of use:

| Role            | Hex       | Usage on axxes.nl                |
| --------------- | --------- | -------------------------------- |
| Accent (orange) | `#E9531D` | Buttons, accents, hover surfaces |
| Charcoal        | `#1D242B` | Footer, dark sections, body text |
| Light           | `#F9F9F9` | Page background                  |
| Slate           | `#313D47` | Secondary dark surfaces          |
| Gray            | `#5B6770` | Secondary text                   |
| Light gray      | `#A0A7AB` | Borders, disabled elements       |
| Teal dark       | `#035D67` | Secondary accent                 |
| Teal light      | `#90B6BB` | Secondary accent                 |
| Orange dark     | `#BC3F12` | Hover variant of the accent      |

Typography on axxes.nl pairs Montserrat with objektiv-mk1. The latter is an Adobe-licensed typeface and
is not used here; **Montserrat** through `next/font/google` carries the identity well enough.

## The contrast problem, and how it is resolved

The brand orange is the defining element of the identity, but it is not accessible as body text — and,
less obviously, it is not accessible _behind_ body text either. The ratios below are computed with the
WCAG relative luminance formula and asserted in `src/app/globals.test.ts`, which reads the shipped
tokens: a color change that breaks contrast fails CI rather than reaching review.

| Combination            | Ratio      | AA body text (4.5:1) | AA large text and UI (3:1) |
| ---------------------- | ---------- | -------------------- | -------------------------- |
| `#E9531D` on white     | ≈ 3.7 : 1  | fails                | passes                     |
| White on `#E9531D`     | ≈ 3.7 : 1  | fails                | passes                     |
| `#1D242B` on `#E9531D` | ≈ 4.3 : 1  | fails                | passes                     |
| White on `#BC3F12`     | ≈ 5.4 : 1  | passes               | passes                     |
| `#1D242B` on `#FF7A45` | ≈ 6.1 : 1  | passes               | passes                     |
| `#BC3F12` on `#F9F9F9` | ≈ 5.2 : 1  | passes               | passes                     |
| `#1D242B` on `#F9F9F9` | ≈ 14.9 : 1 | passes               | passes                     |
| `#5B6770` on `#F9F9F9` | ≈ 5.5 : 1  | passes               | passes                     |
| `#A0A7AB` on `#F9F9F9` | ≈ 2.3 : 1  | fails                | fails                      |
| `#035D67` on white     | ≈ 7.6 : 1  | passes               | passes                     |
| `#90B6BB` on `#1D242B` | ≈ 7.2 : 1  | passes               | passes                     |
| `#E9531D` on `#F9F9F9` | ≈ 3.5 : 1  | fails                | passes                     |
| `#E9531D` on `#1D242B` | ≈ 4.3 : 1  | fails                | passes                     |

Four rules follow from this and govern the entire interface:

1. **`#E9531D` is neither a text color nor a filled-button color.** White on the brand orange reaches
   only 3.7 : 1, and charcoal on it 4.3 : 1, so no label of ordinary size is legible enough on top of
   it. It stays in use for borders, focus rings and large display type.
2. **Filled controls use a per-theme variant.** `#BC3F12` with white in the light theme (5.4 : 1) and
   `#FF7A45` with charcoal in the dark theme (6.1 : 1). Both are drawn from the Axxes palette, so the
   identity survives the correction.
3. **`#A0A7AB` is never text, and not an input border either.** At 2.3 : 1 it fails even the 3:1
   requirement for user interface components. Dividers use a lighter tint where nothing needs to be
   identified; form field boundaries use `#7F888E`, which clears 3 : 1.
4. **The focus ring stays brand orange.** It clears the 3:1 threshold in both themes — 3.5 : 1 on the
   light background, 4.3 : 1 on the dark one — so the most recognizable element of the identity is
   also the one accessibility requires to stand out.

## Tokens

Tailwind v4 is configured entirely in CSS, so tokens live in `src/app/globals.css`. shadcn already
works with semantic variables (`--primary`, `--background`, `--muted`); those are populated with the
Axxes values rather than introducing a parallel naming scheme.

Mapping at a high level:

| shadcn token           | Light theme | Dark theme |
| ---------------------- | ----------- | ---------- |
| `--background`         | `#F9F9F9`   | `#1D242B`  |
| `--foreground`         | `#1D242B`   | `#F9F9F9`  |
| `--card`, `--popover`  | white       | `#313D47`  |
| `--primary`            | `#BC3F12`   | `#FF7A45`  |
| `--primary-foreground` | white       | `#1D242B`  |
| `--secondary`          | `#035D67`   | `#90B6BB`  |
| `--muted`              | `#ECEEEF`   | `#313D47`  |
| `--muted-foreground`   | `#5B6770`   | `#B0B7BB`  |
| `--accent`             | `#FBE9E1`   | `#3A2A22`  |
| `--border`             | `#CDD1D4`   | `#49555F`  |
| `--input`              | `#7F888E`   | `#6F7A81`  |
| `--ring`               | `#E9531D`   | `#E9531D`  |

Alongside these there is one non-shadcn token, `--brand`, holding `#E9531D` itself for the places the
identity should surface without carrying text.

Colors are written in `oklch()`, matching what shadcn generates. Deriving tints is more predictable
there than in hexadecimal. Each declaration carries the source hex as a comment, so a value can be
traced back to the Axxes stylesheet without a conversion step.

## Themes

Light, dark and "follow system", through `next-themes` with a class on `<html>`. The preference is
persisted. The toggle sits in the header as a real button with an accessible name that states the
current mode.

One detail matters: the theme must be applied before first paint, otherwise the light theme flashes
briefly for users who prefer dark. `next-themes` handles this with an inline script.

## Accessibility principles

The full rule set lives in `.cursor/rules/wcag.mdc`. The points that drive the most decisions in this
project:

- **Everything works from the keyboard.** Drag and drop is the hardest case and the most telling:
  dnd-kit provides the keyboard interaction, the application provides the instructions and the
  announcements.
- **Focus stays visible.** A 2 pixel brand-orange outline with a 2 pixel offset, declared outside any
  cascade layer in `globals.css`. shadcn primitives set `outline-none` and substitute a
  half-transparent ring; an unlayered rule outranks every layered utility, so the indicator is
  guaranteed on components that do not exist yet. It must also never be obscured by the player bar at
  the bottom of the viewport, which requires `scroll-padding-bottom` matching the player height.
- **State changes are announced.** Track added, track removed, order changed, search results updated —
  all through an `aria-live` region. A screen reader must not be left in silence.
- **Touch targets of at least 24 by 24 pixels**, with adequate spacing. Dense list rows with icon
  buttons are the main risk.
- **One `h1` per page** and a heading structure that does not skip levels.
- **The page language is exposed programmatically.** `<html lang>` follows the active locale, and each
  option in the language switcher carries its own `lang` attribute so a screen reader pronounces
  "Deutsch" in German rather than in English.
- **Animation is optional.** Everything respects `prefers-reduced-motion`, and the application is fully
  functional without any animation at all.

## Motion principles

Animation explains what changed. It does not draw attention to itself.

| Where                  | What                                                 | Duration   |
| ---------------------- | ---------------------------------------------------- | ---------- |
| Track added or removed | Row fades and slides, surrounding rows shift to fill | 150–200 ms |
| Order changed          | Layout animation from dnd-kit and Motion             | 200 ms     |
| Dialog and sheet       | Fade with a slight scale                             | 150 ms     |
| Player bar appears     | Slides up from the bottom edge                       | 250 ms     |
| Theme change           | Short color transition on background and text        | 200 ms     |

Nothing exceeds 300 ms, and nothing moves without a user action preceding it.

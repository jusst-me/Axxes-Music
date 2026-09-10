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

The brand orange is the defining element of the identity, but it is not accessible as body text. The
ratios below are calculated using the WCAG relative luminance formula and are verified against a
contrast tool during implementation.

| Combination            | Ratio      | AA body text (4.5:1) | AA large text and UI (3:1) |
| ---------------------- | ---------- | -------------------- | -------------------------- |
| `#E9531D` on white     | ≈ 3.7 : 1  | fails                | passes                     |
| `#E9531D` on `#1D242B` | ≈ 4.3 : 1  | fails                | passes                     |
| `#BC3F12` on `#F9F9F9` | ≈ 5.4 : 1  | passes               | passes                     |
| `#1D242B` on `#F9F9F9` | ≈ 14.9 : 1 | passes               | passes                     |
| `#5B6770` on `#F9F9F9` | ≈ 5.5 : 1  | passes               | passes                     |
| `#A0A7AB` on `#F9F9F9` | ≈ 2.3 : 1  | fails                | fails                      |
| `#035D67` on white     | ≈ 7.6 : 1  | passes               | passes                     |
| `#90B6BB` on `#1D242B` | ≈ 7.2 : 1  | passes               | passes                     |

Three rules follow from this and govern the entire interface:

1. **`#E9531D` is a surface color, not a text color.** It works for button backgrounds with white text,
   for borders, for focus rings and for large headings. It does not work for body copy or small links.
2. **Orange text uses a per-theme variant.** `#BC3F12` in the light theme, a lighter tint around
   `#FF7A45` in the dark theme (approximately 6.1 : 1 on charcoal).
3. **`#A0A7AB` is never text.** Borders, dividers and disabled states only, and even then verified
   against the 3:1 requirement for UI components.

The brand orange does clear the 3:1 threshold WCAG requires for focus indicators in both themes, so the
focus ring can stay orange throughout, which reinforces the identity rather than compromising it.

## Tokens

Tailwind v4 is configured entirely in CSS, so tokens live in `src/app/globals.css`. shadcn already
works with semantic variables (`--primary`, `--background`, `--muted`); those are populated with the
Axxes values rather than introducing a parallel naming scheme.

Mapping at a high level:

| shadcn token           | Light theme          | Dark theme           |
| ---------------------- | -------------------- | -------------------- |
| `--background`         | `#F9F9F9`            | `#1D242B`            |
| `--foreground`         | `#1D242B`            | `#F9F9F9`            |
| `--card`, `--popover`  | white                | `#313D47`            |
| `--primary`            | `#E9531D`            | `#E9531D`            |
| `--primary-foreground` | white                | white                |
| `--secondary`          | `#035D67`            | `#90B6BB`            |
| `--muted-foreground`   | `#5B6770`            | lighter gray tint    |
| `--border`, `--input`  | `#A0A7AB` at opacity | white at low opacity |
| `--ring`               | `#E9531D`            | `#E9531D`            |

Colors are written in `oklch()`, matching what shadcn generates. Deriving tints is more predictable
there than in hexadecimal.

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
- **Focus stays visible.** At least 2 pixels, in brand orange, never removed without a replacement, and
  never obscured by the player bar at the bottom of the viewport. The last point requires
  `scroll-padding-bottom` matching the player height.
- **State changes are announced.** Track added, track removed, order changed, search results updated —
  all through an `aria-live` region. A screen reader must not be left in silence.
- **Touch targets of at least 24 by 24 pixels**, with adequate spacing. Dense list rows with icon
  buttons are the main risk.
- **One `h1` per page** and a heading structure that does not skip levels.
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

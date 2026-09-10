// @vitest-environment node
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { contrastRatio, readCustomProperties } from '@/lib/testing/color';

const css = readFileSync(new URL('./globals.css', import.meta.url), 'utf8');

const themes = {
  light: readCustomProperties(css, ':root'),
  dark: {
    ...readCustomProperties(css, ':root'),
    ...readCustomProperties(css, '.dark'),
  },
};

/** WCAG 2.2: 4.5:1 for body text, 3:1 for large text, user interface components and graphics. */
const TEXT_PAIRS = [
  ['foreground', 'background'],
  ['card-foreground', 'card'],
  ['popover-foreground', 'popover'],
  ['primary-foreground', 'primary'],
  ['secondary-foreground', 'secondary'],
  ['accent-foreground', 'accent'],
  ['destructive-foreground', 'destructive'],
  ['muted-foreground', 'muted'],
  ['muted-foreground', 'background'],
] as const;

const UI_PAIRS = [
  ['ring', 'background'],
  ['ring', 'card'],
  ['input', 'background'],
  ['primary', 'background'],
] as const;

describe('focus indicator', () => {
  it('is declared outside a cascade layer so component utilities cannot remove it', () => {
    const rule = /^:focus-visible \{\s*outline: 2px solid var\(--ring\);/m;

    expect(css).toMatch(rule);
    expect(css.slice(css.search(rule))).not.toContain('@layer');
  });
});

describe.each(Object.entries(themes))('%s theme', (_name, tokens) => {
  it.each(TEXT_PAIRS)(
    'renders %s on %s at 4.5:1 or better',
    (foreground, background) => {
      expect(
        contrastRatio(tokens[foreground], tokens[background]),
      ).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(UI_PAIRS)(
    'renders %s against %s at 3:1 or better',
    (foreground, background) => {
      expect(
        contrastRatio(tokens[foreground], tokens[background]),
      ).toBeGreaterThanOrEqual(3);
    },
  );
});

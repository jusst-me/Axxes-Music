// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const directory = new URL('.', import.meta.url);
const primitives = readdirSync(directory).filter(
  file => file.endsWith('.tsx') && !file.includes('.test.'),
);

const HEX = /#[0-9a-f]{3,8}\b/i;
const COLOR_FUNCTION = /\b(?:rgba?|hsla?|oklch|oklab|color-mix)\(/i;

/**
 * Tailwind's own palette, such as `bg-white` or `text-red-500`. An opacity modifier is allowed, since
 * `bg-black/10` is a scrim laid over the page rather than a surface the theme should own.
 */
const PALETTE_UTILITY =
  /\b(?:bg|text|border|ring|fill|stroke|from|via|to)-(?:white|black|(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})\b(?!\/)/;

/**
 * A literal color in a primitive is a color the theme cannot reach: it survives the theme switch, is
 * absent from the contrast assertions in globals.test.ts, and drifts from the Axxes palette the moment
 * a token changes. A color function is allowed when it derives from tokens, as shadcn's button does
 * with `color-mix(in oklch, var(--secondary), var(--foreground) 5%)`.
 */
function literalColors(source: string) {
  return source
    .split('\n')
    .map((line, index) => [index + 1, line] as const)
    .filter(
      ([, line]) =>
        HEX.test(line) ||
        PALETTE_UTILITY.test(line) ||
        (COLOR_FUNCTION.test(line) && !line.includes('var(--')),
    )
    .map(([number, line]) => `${number}: ${line.trim()}`);
}

describe.each(primitives)('%s', file => {
  it('carries no literal color, only theme tokens', () => {
    expect(
      literalColors(readFileSync(new URL(file, directory), 'utf8')),
    ).toEqual([]);
  });
});

// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { localeAlternates } from '@/lib/metadata';

describe('localeAlternates', () => {
  it('points the canonical URL at the locale being rendered', () => {
    expect(localeAlternates('nl', '/catalog')?.canonical).toBe('/nl/catalog');
  });

  it('declares every language under its region tag', () => {
    expect(localeAlternates('en', '/catalog')?.languages).toMatchObject({
      'en-GB': '/en/catalog',
      'nl-NL': '/nl/catalog',
      'de-DE': '/de/catalog',
    });
  });

  it('falls back to English for a visitor it cannot place', () => {
    expect(localeAlternates('de')?.languages?.['x-default']).toBe('/en');
  });

  it('handles the landing page, which has no path of its own', () => {
    expect(localeAlternates('de')?.canonical).toBe('/de');
  });
});

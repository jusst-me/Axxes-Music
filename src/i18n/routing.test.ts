// @vitest-environment node
import { existsSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, LOCALE_NAMES, LOCALES } from '@/constants/locales';
import { routing } from '@/i18n/routing';

const locales = Object.keys(LOCALES);

describe('routing', () => {
  it('serves English by default', () => {
    expect(routing.defaultLocale).toBe('en');
    expect(DEFAULT_LOCALE).toBe('en');
  });

  it('derives its locales from the single constant', () => {
    expect(routing.locales).toEqual(locales);
  });

  it('does not negotiate the locale from the browser', () => {
    expect(routing.localeDetection).toBe(false);
  });
});

describe.each(locales)('locale %s', locale => {
  it('has a message catalog', () => {
    expect(
      existsSync(new URL(`../dictionaries/${locale}.json`, import.meta.url)),
    ).toBe(true);
  });

  it('has a name written in its own language', () => {
    expect(LOCALE_NAMES[locale as keyof typeof LOCALE_NAMES]).toBeTruthy();
  });
});

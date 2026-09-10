// @vitest-environment node
import { createTranslator } from 'next-intl';
import { describe, expect, it } from 'vitest';

import { type Locale, LOCALES } from '@/constants/locales';
import de from '@/dictionaries/de.json';
import en from '@/dictionaries/en.json';
import nl from '@/dictionaries/nl.json';
import { formatDuration, splitDuration } from '@/lib/format/duration';
import { createAppFormatter } from '@/lib/format/formatter';

const catalogs = { en, nl, de };

function intl(locale: Locale) {
  return {
    t: createTranslator({ locale, messages: catalogs[locale] }),
    format: createAppFormatter(locale),
  };
}

const RELEASE_DATE = new Date('2001-03-12T00:00:00.000Z');

describe('splitDuration', () => {
  it('splits milliseconds into whole minutes and the remaining seconds', () => {
    expect(splitDuration(232_000)).toEqual({ minutes: 3, seconds: 52 });
  });

  it('rounds to the nearest second rather than truncating', () => {
    expect(splitDuration(59_600)).toEqual({ minutes: 1, seconds: 0 });
  });

  it('handles a duration shorter than a minute', () => {
    expect(splitDuration(30_000)).toEqual({ minutes: 0, seconds: 30 });
  });
});

describe.each(Object.keys(LOCALES) as Locale[])('%s', locale => {
  it('pads the seconds of a duration to two digits', () => {
    expect(formatDuration(184_000, locale)).toBe('3:04');
  });

  it('formats a release date with a written-out month', () => {
    const { format } = intl(locale);
    const expected = {
      en: '12 March 2001',
      nl: '12 maart 2001',
      de: '12. März 2001',
    };

    expect(format.dateTime(RELEASE_DATE, 'long')).toBe(expected[locale]);
  });

  it('describes a duration in words, with the plural rules of the locale', () => {
    const { t } = intl(locale);
    const expected = {
      en: '1 minute and 1 second',
      nl: '1 minuut en 1 seconde',
      de: '1 Minute und 1 Sekunde',
    };

    expect(t('catalog.track.durationLabel', splitDuration(61_000))).toBe(
      expected[locale],
    );
  });

  it('counts tracks through the catalog rather than by concatenation', () => {
    const { t } = intl(locale);
    const expected = {
      en: ['No tracks', '1 track', '12 tracks'],
      nl: ['Geen nummers', '1 nummer', '12 nummers'],
      de: ['Keine Titel', '1 Titel', '12 Titel'],
    };

    expect([0, 1, 12].map(count => t('catalog.trackCount', { count }))).toEqual(
      expected[locale],
    );
  });

  it('localizes a relative timestamp', () => {
    const { t, format } = intl(locale);
    const now = new Date('2026-09-10T12:00:00.000Z');
    const twoDaysAgo = new Date('2026-09-08T12:00:00.000Z');

    const expected = {
      en: 'Added 2 days ago',
      nl: '2 dagen geleden toegevoegd',
      de: 'vor 2 Tagen hinzugefügt',
    };

    expect(
      t('playlist.added', { when: format.relativeTime(twoDaysAgo, now) }),
    ).toBe(expected[locale]);
  });
});

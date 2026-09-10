// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { DEFAULT_LOCALE, type Locale, LOCALES } from '@/constants/locales';
import de from '@/dictionaries/de.json';
import en from '@/dictionaries/en.json';
import nl from '@/dictionaries/nl.json';

type Catalog = { [key: string]: string | Catalog };

const catalogs: Record<Locale, Catalog> = { en, nl, de };

/** Copy is grouped by domain; a stray top-level group means a string landed outside that structure. */
const DOMAINS = [
  'common',
  'landing',
  'auth',
  'catalog',
  'playlist',
  'player',
  'a11y',
];

function flatten(catalog: Catalog, prefix = ''): Map<string, string> {
  const entries = new Map<string, string>();

  for (const [key, value] of Object.entries(catalog)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      entries.set(path, value);
    } else {
      for (const [nested, nestedValue] of flatten(value, path)) {
        entries.set(nested, nestedValue);
      }
    }
  }

  return entries;
}

/**
 * Collects the argument names an ICU message expects. A translation that drops a placeholder fails at
 * render time rather than at build time, which is why it is compared against the English source here.
 * The trailing comma or brace is what separates an argument from the literal text inside a plural
 * option: `{count, plural, other {# tracks}}` declares `count` and nothing else.
 */
function placeholders(message: string) {
  return new Set(
    Array.from(message.matchAll(/\{\s*(\w+)\s*[,}]/g), ([, name]) => name),
  );
}

const source = flatten(catalogs[DEFAULT_LOCALE]);
const locales = Object.keys(LOCALES) as Locale[];

describe('message catalogs', () => {
  it('cover every locale the application routes to', () => {
    expect(Object.keys(catalogs)).toEqual(locales);
  });
});

describe.each(locales)('%s catalog', locale => {
  const catalog = flatten(catalogs[locale]);

  it('groups its keys by domain', () => {
    expect(Object.keys(catalogs[locale])).toEqual(DOMAINS);
  });

  it('leaves no message empty', () => {
    const empty = [...catalog]
      .filter(([, message]) => message.trim() === '')
      .map(([key]) => key);

    expect(empty).toEqual([]);
  });

  it.skipIf(locale === DEFAULT_LOCALE)(
    'translates every key English defines',
    () => {
      const missing = [...source.keys()].filter(key => !catalog.has(key));

      expect(missing).toEqual([]);
    },
  );

  it.skipIf(locale === DEFAULT_LOCALE)(
    'defines no key English does not have',
    () => {
      const extra = [...catalog.keys()].filter(key => !source.has(key));

      expect(extra).toEqual([]);
    },
  );

  it.skipIf(locale === DEFAULT_LOCALE)(
    'keeps the placeholders English declares',
    () => {
      const mismatched = [...source]
        .filter(([key, message]) => {
          const expected = placeholders(message);
          const actual = placeholders(catalog.get(key) ?? '');

          return (
            expected.size !== actual.size ||
            [...expected].some(name => !actual.has(name))
          );
        })
        .map(([key]) => key);

      expect(mismatched).toEqual([]);
    },
  );
});

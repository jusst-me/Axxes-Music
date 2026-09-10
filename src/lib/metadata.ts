import type { Metadata } from 'next';

import { DEFAULT_LOCALE, type Locale, LOCALES } from '@/constants/locales';
import { resolveLocale } from '@/i18n/locale';

/**
 * Canonical URLs must point at the production site, not at whatever preview host happens to serve the
 * page, which is why the Vercel production variable is preferred over the deployment URL.
 */
function resolveSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL);
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }

  return new URL('http://localhost:3000');
}

export const SITE_URL = resolveSiteUrl();

/**
 * Declares every language variant of a path. `x-default` points at English, which is what a search
 * engine falls back to for a visitor it cannot place.
 */
export function localeAlternates(
  requested: string,
  path = '',
): Metadata['alternates'] {
  const locale = resolveLocale(requested);
  const href = (candidate: Locale) => `/${candidate}${path}`;
  const languages = Object.fromEntries(
    (Object.keys(LOCALES) as Locale[]).map(candidate => [
      LOCALES[candidate],
      href(candidate),
    ]),
  );

  return {
    canonical: href(locale),
    languages: { ...languages, 'x-default': href(DEFAULT_LOCALE) },
  };
}

import { defineRouting } from 'next-intl/routing';

import { DEFAULT_LOCALE, type Locale, LOCALES } from '@/constants/locales';

export const routing = defineRouting({
  // Object.keys widens to string[]; the cast keeps Locale flowing into hasLocale and the navigation helpers.
  locales: Object.keys(LOCALES) as Locale[],
  defaultLocale: DEFAULT_LOCALE,
  /**
   * Detection is what makes the language switcher stick: switching writes the NEXT_LOCALE cookie, and
   * an unprefixed request is only routed by it when detection is enabled. On a first visit, with no
   * cookie yet, the Accept-Language header decides and English remains the fallback.
   */
  localeDetection: true,
});

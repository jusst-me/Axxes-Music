import { defineRouting } from 'next-intl/routing';

import { DEFAULT_LOCALE, type Locale, LOCALES } from '@/constants/locales';

export const routing = defineRouting({
  // Object.keys widens to string[]; the cast keeps Locale flowing into hasLocale and the navigation helpers.
  locales: Object.keys(LOCALES) as Locale[],
  defaultLocale: DEFAULT_LOCALE,
  localeDetection: false,
});

import { createFormatter, useLocale } from 'next-intl';
import { useMemo } from 'react';

import { type Locale, LOCALES } from '@/constants/locales';
import { FORMATS, TIME_ZONE } from '@/i18n/formats';

/**
 * Formats through the region tag rather than the routing code.
 *
 * The URL carries `en`, which Intl resolves to en-US and therefore to "March 12, 2001". This office
 * reads dates day first, which is what `en-GB` in the locale constant expresses. next-intl's own
 * `useFormatter` is bound to the routing code, so formatting goes through here instead.
 */
export function createAppFormatter(locale: Locale) {
  return createFormatter({
    // AppConfig types this field as the routing locale, which is the very distinction being made here:
    // the URL says `en` while Intl needs `en-GB`. The cast stays confined to this line.
    locale: LOCALES[locale] as unknown as Locale,
    formats: FORMATS,
    timeZone: TIME_ZONE,
  });
}

export function useAppFormatter() {
  const locale = useLocale();

  return useMemo(() => createAppFormatter(locale), [locale]);
}

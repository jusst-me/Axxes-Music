import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { DEFAULT_LOCALE } from '@/constants/locales';
import { routing } from '@/i18n/routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../dictionaries/${locale}.json`)).default,
  };
});

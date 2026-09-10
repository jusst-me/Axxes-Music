import { hasLocale } from 'next-intl';

import { DEFAULT_LOCALE, type Locale } from '@/constants/locales';
import { routing } from '@/i18n/routing';

/**
 * Narrows a route parameter to a locale the app knows. An unknown one never reaches a rendered page,
 * because the layout answers it with a 404; falling back to English here keeps that check in one place
 * instead of repeating it in every `generateMetadata`.
 */
export function resolveLocale(requested: string): Locale {
  return hasLocale(routing.locales, requested) ? requested : DEFAULT_LOCALE;
}

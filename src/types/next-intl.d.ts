import type { Locale } from '@/constants/locales';
import type messages from '@/dictionaries/en.json';

/**
 * Types the message keys against the English catalog, so a key that does not exist fails the type
 * check instead of rendering as a raw key in the interface.
 */
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}

/** Adding a language starts here: every other part of the routing derives from this map. */
export const LOCALES = {
  en: 'en-GB',
  nl: 'nl-NL',
  de: 'de-DE',
} as const;

export type Locale = keyof typeof LOCALES;

export const DEFAULT_LOCALE: Locale = 'en';

/** Written in their own language, so a screen reader with the matching lang pronounces them correctly. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  nl: 'Nederlands',
  de: 'Deutsch',
};

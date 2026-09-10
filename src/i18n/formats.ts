import type { Formats } from 'next-intl';

/**
 * The office this is built for sits in Belgium and the Netherlands. Pinning the zone keeps a date
 * identical on the server and in the browser, which is what next-intl warns about when it is left open.
 */
export const TIME_ZONE = 'Europe/Brussels';

/** Named formats, so a component asks for `long` rather than repeating an options object. */
export const FORMATS = {
  dateTime: {
    short: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
  },
} satisfies Formats;

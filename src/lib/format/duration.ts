import { type Locale, LOCALES } from '@/constants/locales';

const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

/** Splits a duration into the parts a plural message needs. */
export function splitDuration(milliseconds: number) {
  const totalSeconds = Math.round(milliseconds / MILLISECONDS_PER_SECOND);

  return {
    minutes: Math.floor(totalSeconds / SECONDS_PER_MINUTE),
    seconds: totalSeconds % SECONDS_PER_MINUTE,
  };
}

/**
 * A duration as a clock reads it, "3:52".
 *
 * `Intl.DurationFormat` expresses this directly but is absent from Safari 16, which the browserslist
 * still targets, so it cannot be relied on for anything that may render on the client. NumberFormat
 * covers what genuinely varies between locales here: the digits and the zero padding. The spoken form
 * lives in the message catalogs, where the plural rules belong.
 */
export function formatDuration(milliseconds: number, locale: Locale) {
  const { minutes, seconds } = splitDuration(milliseconds);
  const tag = LOCALES[locale];

  return [
    new Intl.NumberFormat(tag, { useGrouping: false }).format(minutes),
    new Intl.NumberFormat(tag, {
      minimumIntegerDigits: 2,
      useGrouping: false,
    }).format(seconds),
  ].join(':');
}

import { useLocale, useTranslations } from 'next-intl';

import type { Locale } from '@/constants/locales';
import { formatDuration, splitDuration } from '@/lib/format/duration';

/**
 * "3:52" reads as a clock face to anyone who can see it and as nonsense to anyone who cannot, so the
 * spoken form is spelled out and the digits are hidden from the accessibility tree.
 */
export default function TrackDuration({
  milliseconds,
}: {
  milliseconds: number;
}) {
  const t = useTranslations('catalog.track');
  const locale = useLocale() as Locale;

  return (
    <>
      <span aria-hidden>{formatDuration(milliseconds, locale)}</span>
      <span className="sr-only">
        {t('durationLabel', splitDuration(milliseconds))}
      </span>
    </>
  );
}

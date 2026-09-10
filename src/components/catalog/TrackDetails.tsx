'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Fragment } from 'react';

import TrackArtwork from '@/components/catalog/TrackArtwork';
import { buttonVariants } from '@/components/ui/button';
import type { Locale } from '@/constants/locales';
import type { CatalogTrack } from '@/lib/data/tracks';
import { formatDuration, splitDuration } from '@/lib/format/duration';
import { useAppFormatter } from '@/lib/format/formatter';
import { cn } from '@/lib/utils';

/** `spoken` replaces the written value for a screen reader, where "3:52" reads as nonsense. */
type Fact = { label: string; value: string; spoken?: string };

/**
 * Everything known about a track, minus its name.
 *
 * The title and artist are left to the caller: on the dedicated route they are the page heading, and
 * inside the dialog they are the accessible name of the dialog itself. Rendering them here would
 * leave one of the two with a heading at the wrong level.
 */
export default function TrackDetails({ track }: { track: CatalogTrack }) {
  const t = useTranslations('catalog.track');
  const locale = useLocale() as Locale;
  const format = useAppFormatter();

  const facts: Fact[] = [];

  if (track.album) {
    facts.push({ label: t('album'), value: track.album });
  }

  if (track.genre) {
    facts.push({ label: t('genre'), value: track.genre });
  }

  if (track.releaseDate) {
    facts.push({
      label: t('releaseDate'),
      value: format.dateTime(track.releaseDate, 'long'),
    });
  }

  if (track.durationMs !== null) {
    facts.push({
      label: t('duration'),
      value: formatDuration(track.durationMs, locale),
      spoken: t('durationLabel', splitDuration(track.durationMs)),
    });
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      <TrackArtwork src={track.artworkUrl} size="detail" />

      <div className="min-w-0 flex-1">
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          {facts.map(fact => (
            <Fragment key={fact.label}>
              <dt className="text-muted-foreground">{fact.label}</dt>
              <dd className="min-w-0 break-words">
                {fact.spoken ? (
                  <>
                    <span aria-hidden>{fact.value}</span>
                    <span className="sr-only">{fact.spoken}</span>
                  </>
                ) : (
                  fact.value
                )}
              </dd>
            </Fragment>
          ))}
        </dl>

        {track.appleMusicUrl && (
          <a
            href={track.appleMusicUrl}
            rel="noreferrer"
            className={cn(buttonVariants({ variant: 'outline' }), 'mt-6')}
          >
            {t('openInAppleMusic')}
          </a>
        )}
      </div>
    </div>
  );
}

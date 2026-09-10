import { useLocale, useTranslations } from 'next-intl';

import TrackArtwork from '@/components/catalog/TrackArtwork';
import type { Locale } from '@/constants/locales';
import type { CatalogTrack } from '@/lib/data/tracks';
import { formatDuration, splitDuration } from '@/lib/format/duration';

export default function TrackRow({ track }: { track: CatalogTrack }) {
  const t = useTranslations('catalog.track');
  const locale = useLocale() as Locale;

  return (
    <li className="flex items-center gap-4 px-4 py-3">
      <TrackArtwork src={track.artworkUrl} />

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{track.title}</p>
        <p className="text-muted-foreground truncate text-sm">
          {track.album ? `${track.artist} · ${track.album}` : track.artist}
        </p>
      </div>

      {track.durationMs !== null && (
        <p className="text-muted-foreground shrink-0 text-sm tabular-nums">
          {/*
           * "3:52" reads as a clock face to anyone who can see it and as nonsense to anyone who cannot,
           * so the spoken form is spelled out and the digits are hidden from the accessibility tree.
           */}
          <span aria-hidden>{formatDuration(track.durationMs, locale)}</span>
          <span className="sr-only">
            {t('durationLabel', splitDuration(track.durationMs))}
          </span>
        </p>
      )}
    </li>
  );
}

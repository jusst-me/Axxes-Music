'use client';

import { XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Ref } from 'react';

import TrackArtwork from '@/components/catalog/TrackArtwork';
import TrackDuration from '@/components/catalog/TrackDuration';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import type { PlaylistEntry } from '@/lib/data/playlists';

type PlaylistTrackRowProps = {
  entry: PlaylistEntry;
  onRemove: (entry: PlaylistEntry) => void;
  removeRef?: Ref<HTMLButtonElement>;
};

export default function PlaylistTrackRow({
  entry,
  onRemove,
  removeRef,
}: PlaylistTrackRowProps) {
  const t = useTranslations('playlist');
  const { track } = entry;

  return (
    <li className="flex items-center gap-4 px-4 py-3">
      <TrackArtwork src={track.artworkUrl} />

      <div className="min-w-0 flex-1">
        {/*
         * A link rather than the dialog the catalog uses: from inside a playlist the details are a
         * place to go, and going there leaves a URL that can be shared or returned to.
         */}
        <Link
          href={`/tracks/${track.id}`}
          className="focus-visible:ring-ring/50 block truncate rounded-sm font-medium hover:underline focus-visible:ring-3 focus-visible:outline-none"
        >
          {track.title}
        </Link>
        <p className="text-muted-foreground truncate text-sm">
          {track.album ? `${track.artist} · ${track.album}` : track.artist}
        </p>
      </div>

      {track.durationMs !== null && (
        <p className="text-muted-foreground shrink-0 text-sm tabular-nums">
          <TrackDuration milliseconds={track.durationMs} />
        </p>
      )}

      <Button
        ref={removeRef}
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t('removeTrack', { title: track.title })}
        onClick={() => onRemove(entry)}
      >
        <XIcon aria-hidden />
      </Button>
    </li>
  );
}

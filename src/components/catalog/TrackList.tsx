'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState, useTransition } from 'react';

import TrackRow from '@/components/catalog/TrackRow';
import { Button } from '@/components/ui/button';
import { loadMoreTracksAction } from '@/lib/catalog/actions';
import type { CatalogTrack } from '@/lib/data/tracks';

type TrackListProps = {
  tracks: CatalogTrack[];
  hasMore: boolean;
  total: number;
};

export default function TrackList({
  tracks: initial,
  hasMore: initiallyHasMore,
  total,
}: TrackListProps) {
  const t = useTranslations('catalog');
  const [tracks, setTracks] = useState(initial);
  const [hasMore, setHasMore] = useState(initiallyHasMore);
  const [isPending, startTransition] = useTransition();
  const statusRef = useRef<HTMLParagraphElement>(null);

  function loadMore() {
    startTransition(async () => {
      const next = await loadMoreTracksAction(tracks.length);

      setTracks(current => [...current, ...next.tracks]);
      setHasMore(next.hasMore);

      // The button leaves with the last slice, and focus would go with it. The count stays, so it
      // takes over: the reader hears what just happened rather than landing back at the top.
      if (!next.hasMore) {
        statusRef.current?.focus();
      }
    });
  }

  if (total === 0) {
    return (
      <div className="border-border mt-8 rounded-lg border border-dashed px-6 py-12 text-center">
        <h2 className="font-semibold">{t('empty.title')}</h2>
        <p className="text-muted-foreground mt-2">{t('empty.description')}</p>
      </div>
    );
  }

  return (
    <>
      <ul className="divide-border border-border mt-8 divide-y rounded-lg border">
        {tracks.map(track => (
          <TrackRow key={track.id} track={track} />
        ))}
      </ul>

      <div className="mt-6 flex flex-col items-center gap-3">
        {/*
         * Polite rather than assertive: appending tracks is the visitor's own doing, so it should be
         * mentioned once the screen reader finishes what it was saying rather than cut across it.
         */}
        <p
          ref={statusRef}
          tabIndex={-1}
          aria-live="polite"
          className="text-muted-foreground text-sm"
        >
          {t('showing', { shown: tracks.length, total })}
        </p>

        {hasMore && (
          <Button variant="outline" onClick={loadMore} disabled={isPending}>
            {isPending ? t('loadMorePending') : t('loadMore')}
          </Button>
        )}
      </div>
    </>
  );
}

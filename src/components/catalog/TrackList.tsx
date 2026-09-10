'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState, useTransition } from 'react';

import TrackRow from '@/components/catalog/TrackRow';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { loadMoreTracksAction } from '@/lib/catalog/actions';
import type { CatalogTrack } from '@/lib/data/tracks';
import { cn } from '@/lib/utils';

type TrackListProps = {
  tracks: CatalogTrack[];
  hasMore: boolean;
  total: number;
  query: string;
};

export default function TrackList({
  tracks: initial,
  hasMore: initiallyHasMore,
  total,
  query,
}: TrackListProps) {
  const t = useTranslations('catalog');
  const [slice, setSlice] = useState({
    query,
    tracks: initial,
    hasMore: initiallyHasMore,
  });
  const [isPending, startTransition] = useTransition();
  const statusRef = useRef<HTMLParagraphElement>(null);

  // A new search starts from the first slice again. Resetting here rather than remounting on a key
  // keeps the status below in the document, which is the only reason a live region gets to speak.
  if (slice.query !== query) {
    setSlice({ query, tracks: initial, hasMore: initiallyHasMore });
  }

  function loadMore() {
    startTransition(async () => {
      const next = await loadMoreTracksAction({
        skip: slice.tracks.length,
        query,
      });

      setSlice(current => ({
        ...current,
        tracks: [...current.tracks, ...next.tracks],
        hasMore: next.hasMore,
      }));

      // The button leaves with the last slice, and focus would go with it. The count stays, so it
      // takes over: the reader hears what just happened rather than landing back at the top.
      if (!next.hasMore) {
        statusRef.current?.focus();
      }
    });
  }

  return (
    <>
      {total === 0 ? (
        <div className="border-border mt-8 rounded-lg border border-dashed px-6 py-12 text-center">
          <h2 className="font-semibold">{t('empty.title')}</h2>
          <p className="text-muted-foreground mt-2">{t('empty.description')}</p>
          {query && (
            <Button
              variant="outline"
              className="mt-6"
              render={<Link href="/catalog" />}
            >
              {t('search.clear')}
            </Button>
          )}
        </div>
      ) : (
        <ul className="divide-border border-border mt-8 divide-y rounded-lg border">
          {slice.tracks.map(track => (
            <TrackRow key={track.id} track={track} />
          ))}
        </ul>
      )}

      <div className="mt-6 flex flex-col items-center gap-3">
        {/*
         * Polite rather than assertive: searching and paging are the visitor's own doing, so the
         * result should be mentioned once the screen reader finishes what it was saying rather than
         * cut across it. With nothing found the empty state above says the same thing on screen, so
         * this is hidden visually and left in place to speak.
         */}
        <p
          ref={statusRef}
          tabIndex={-1}
          aria-live="polite"
          className={cn(
            'text-muted-foreground text-sm',
            total === 0 && 'sr-only',
          )}
        >
          {total === 0
            ? t('empty.title')
            : t('showing', { shown: slice.tracks.length, total })}
        </p>

        {slice.hasMore && (
          <Button variant="outline" onClick={loadMore} disabled={isPending}>
            {isPending ? t('loadMorePending') : t('loadMore')}
          </Button>
        )}
      </div>
    </>
  );
}

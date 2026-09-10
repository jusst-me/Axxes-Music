'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import PlaylistSearch from '@/components/playlists/PlaylistSearch';
import PlaylistTrackRow from '@/components/playlists/PlaylistTrackRow';
import { Button } from '@/components/ui/button';
import type { PlaylistEntry } from '@/lib/data/playlists';
import { removeTrackAction, restoreTrackAction } from '@/lib/playlists/actions';
import { matchesPlaylistQuery } from '@/lib/playlists/filter';
import { cn } from '@/lib/utils';

type PlaylistTracksProps = {
  playlistId: string;
  playlistName: string;
  entries: PlaylistEntry[];
};

export default function PlaylistTracks({
  playlistId,
  playlistName,
  entries,
}: PlaylistTracksProps) {
  const t = useTranslations('playlist');
  const a11y = useTranslations('a11y');
  const common = useTranslations('common');
  const message = useTranslations('playlist.errors');
  const [baseline, setBaseline] = useState(entries);
  const [rows, setRows] = useState(entries);
  const [query, setQuery] = useState('');
  const statusRef = useRef<HTMLParagraphElement>(null);
  const removeRefs = useRef(new Map<string, HTMLButtonElement>());
  const visible = rows.filter(row => matchesPlaylistQuery(row.track, query));
  const filtering = query.trim() !== '';

  /*
   * The server is the source of truth once it has caught up. Until then the optimistic list stands,
   * otherwise a render that still carries the old props would put the row back for a frame.
   */
  if (entries !== baseline) {
    setBaseline(entries);
    setRows(entries);
  }

  function focusAfterRemoval(removedId: string, remaining: PlaylistEntry[]) {
    const shown = remaining.filter(row =>
      matchesPlaylistQuery(row.track, query),
    );
    const index = visible.findIndex(row => row.id === removedId);
    const neighbour = shown[index] ?? shown[index - 1];

    // The button that was pressed is gone. The next row, the previous one, or the count that stays
    // on the page takes over, so focus never drops onto `body`.
    requestAnimationFrame(() => {
      if (neighbour) {
        removeRefs.current.get(neighbour.id)?.focus();
      } else {
        statusRef.current?.focus();
      }
    });
  }

  function restore(entry: PlaylistEntry) {
    setRows(current =>
      [...current, entry].sort((left, right) => left.position - right.position),
    );

    void restoreTrackAction({
      playlistId,
      trackId: entry.track.id,
      position: entry.position,
    }).then(result => {
      if (result.restored) {
        return;
      }

      setRows(current => current.filter(row => row.id !== entry.id));
      toast.error(message(result.reason));
    });
  }

  function remove(entry: PlaylistEntry) {
    const remaining = rows.filter(row => row.id !== entry.id);

    setRows(remaining);
    focusAfterRemoval(entry.id, remaining);

    void removeTrackAction({
      playlistId,
      trackId: entry.track.id,
    }).then(result => {
      if (!result.removed) {
        setRows(current =>
          [...current, entry].sort(
            (left, right) => left.position - right.position,
          ),
        );
        toast.error(message(result.reason));
        return;
      }

      toast.success(
        t('trackRemoved', { title: entry.track.title, playlist: playlistName }),
        {
          action: {
            label: common('undo'),
            onClick: () => restore(entry),
          },
        },
      );
    });
  }

  const empty = rows.length === 0;
  const noMatches = filtering && visible.length === 0;

  let list;

  if (empty) {
    list = (
      <div className="border-border mt-8 rounded-lg border border-dashed px-6 py-12 text-center">
        <h2 className="font-semibold">{t('empty.title')}</h2>
        <p className="text-muted-foreground mt-2">{t('empty.description')}</p>
      </div>
    );
  } else if (noMatches) {
    list = (
      <div className="border-border mt-8 rounded-lg border border-dashed px-6 py-12 text-center">
        <h2 className="font-semibold">{t('noMatches.title')}</h2>
        <p className="text-muted-foreground mt-2">
          {t('noMatches.description')}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6"
          onClick={() => setQuery('')}
        >
          {t('search.clear')}
        </Button>
      </div>
    );
  } else {
    list = (
      <ul className="divide-border border-border mt-8 divide-y rounded-lg border">
        {visible.map(entry => (
          <PlaylistTrackRow
            key={entry.id}
            entry={entry}
            onRemove={remove}
            removeRef={node => {
              if (node) {
                removeRefs.current.set(entry.id, node);
              } else {
                removeRefs.current.delete(entry.id);
              }
            }}
          />
        ))}
      </ul>
    );
  }

  return (
    <>
      {(rows.length > 0 || filtering) && (
        <PlaylistSearch query={query} onQueryChange={setQuery} />
      )}

      {filtering && (
        <p className="text-muted-foreground mt-3 text-sm">
          {t('reorderDisabled')}
        </p>
      )}

      {list}

      <p
        ref={statusRef}
        tabIndex={-1}
        aria-live="polite"
        className={cn(
          'text-muted-foreground mt-6 text-center text-sm',
          (empty || noMatches) && 'sr-only',
        )}
      >
        {filtering
          ? a11y('searchResults', { count: visible.length })
          : t('trackCount', { count: rows.length })}
      </p>
    </>
  );
}

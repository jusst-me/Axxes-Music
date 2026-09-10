'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

import PlaylistTrackRow from '@/components/playlists/PlaylistTrackRow';
import type { PlaylistEntry } from '@/lib/data/playlists';
import { removeTrackAction, restoreTrackAction } from '@/lib/playlists/actions';
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
  const common = useTranslations('common');
  const message = useTranslations('playlist.errors');
  const [baseline, setBaseline] = useState(entries);
  const [rows, setRows] = useState(entries);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const removeRefs = useRef(new Map<string, HTMLButtonElement>());

  /*
   * The server is the source of truth once it has caught up. Until then the optimistic list stands,
   * otherwise a render that still carries the old props would put the row back for a frame.
   */
  if (entries !== baseline) {
    setBaseline(entries);
    setRows(entries);
  }

  function focusAfterRemoval(removedId: string, remaining: PlaylistEntry[]) {
    const index = rows.findIndex(row => row.id === removedId);
    const neighbour = remaining[index] ?? remaining[index - 1];

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

  return (
    <>
      {rows.length === 0 ? (
        <div className="border-border mt-8 rounded-lg border border-dashed px-6 py-12 text-center">
          <h2 className="font-semibold">{t('empty.title')}</h2>
          <p className="text-muted-foreground mt-2">{t('empty.description')}</p>
        </div>
      ) : (
        <ul className="divide-border border-border mt-8 divide-y rounded-lg border">
          {rows.map(entry => (
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
      )}

      <p
        ref={statusRef}
        tabIndex={-1}
        aria-live="polite"
        className={cn(
          'text-muted-foreground mt-6 text-center text-sm',
          rows.length === 0 && 'sr-only',
        )}
      >
        {t('trackCount', { count: rows.length })}
      </p>
    </>
  );
}

'use client';

import { CheckIcon, ListPlusIcon, PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import CreatePlaylistDialog from '@/components/playlists/CreatePlaylistDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PlaylistSummary } from '@/lib/data/playlists';
import type { CatalogTrack } from '@/lib/data/tracks';
import { addTrackAction } from '@/lib/playlists/actions';

type AddToPlaylistMenuProps = {
  track: CatalogTrack;
  playlists: PlaylistSummary[];
  /**
   * A row has no space for a sentence and enough context to do without one; a detail view has both.
   * Where the words are on screen they are also the accessible name, so what is said matches what
   * is read and voice control can ask for either.
   */
  appearance?: 'icon' | 'labelled';
};

function holdsTrack(playlist: PlaylistSummary, trackId: string) {
  return playlist.tracks.some(entry => entry.trackId === trackId);
}

function withTrack(playlist: PlaylistSummary, trackId: string) {
  if (holdsTrack(playlist, trackId)) {
    return playlist;
  }

  return {
    ...playlist,
    tracks: [...playlist.tracks, { trackId }],
    _count: { tracks: playlist._count.tracks + 1 },
  };
}

export default function AddToPlaylistMenu({
  track,
  playlists: initial,
  appearance = 'icon',
}: AddToPlaylistMenuProps) {
  const t = useTranslations('catalog');
  const playlistCopy = useTranslations('playlist');
  const message = useTranslations('playlist.errors');
  const [baseline, setBaseline] = useState(initial);
  const [playlists, setPlaylists] = useState(initial);
  const [creating, setCreating] = useState(false);
  const [createKey, setCreateKey] = useState(0);
  const [isPending, startTransition] = useTransition();

  if (initial !== baseline) {
    setBaseline(initial);
    setPlaylists(initial);
  }

  const saved = playlists.some(candidate => holdsTrack(candidate, track.id));
  const labelled = appearance === 'labelled';

  let triggerName;

  if (!labelled) {
    triggerName = saved
      ? t('trackInPlaylists', { title: track.title })
      : t('addTrackToPlaylist', { title: track.title });
  }

  const control = {
    variant: labelled ? ('outline' as const) : ('ghost' as const),
    size: labelled ? ('default' as const) : ('icon-sm' as const),
    disabled: isPending,
    'aria-label': triggerName,
  };

  function remember(playlistId: string) {
    setPlaylists(current =>
      current.map(candidate =>
        candidate.id === playlistId
          ? withTrack(candidate, track.id)
          : candidate,
      ),
    );
  }

  function add(playlistId: string, alreadyThere: boolean) {
    if (alreadyThere) {
      toast.info(playlistCopy('duplicate', { title: track.title }));
      return;
    }

    startTransition(async () => {
      const result = await addTrackAction({ playlistId, trackId: track.id });

      if (result.added) {
        remember(playlistId);
        toast.success(
          playlistCopy('trackAdded', {
            title: track.title,
            playlist: result.playlistName,
          }),
        );
        return;
      }

      if (result.reason === 'duplicate') {
        remember(playlistId);
        toast.info(playlistCopy('duplicate', { title: track.title }));
        return;
      }

      toast.error(message(result.reason));
    });
  }

  function handleOpenChange(next: boolean) {
    setCreating(next);

    // Remount only once the dialog has left, so a leftover `created` cannot open a fresh form
    // while this one is still marked as open.
    if (!next) {
      setCreateKey(key => key + 1);
    }
  }

  function handleCreated(created: { id: string; name: string }) {
    setPlaylists(current => [
      ...current,
      {
        id: created.id,
        name: created.name,
        description: null,
        visibility: 'PRIVATE',
        _count: { tracks: 0 },
        tracks: [],
      },
    ]);
    handleOpenChange(false);
    add(created.id, false);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={control['aria-label']}
          disabled={isPending}
          render={<Button variant={control.variant} size={control.size} />}
        >
          {saved ? <CheckIcon aria-hidden /> : <ListPlusIcon aria-hidden />}
          {labelled && (saved ? t('inAPlaylist') : t('addToPlaylist'))}
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-auto min-w-56">
          {playlists.map(candidate => {
            const alreadyThere = holdsTrack(candidate, track.id);

            return (
              <DropdownMenuItem
                key={candidate.id}
                aria-label={
                  alreadyThere
                    ? `${candidate.name}, ${playlistCopy('alreadyContains')}`
                    : candidate.name
                }
                onClick={() => add(candidate.id, alreadyThere)}
              >
                {alreadyThere ? (
                  <CheckIcon aria-hidden className="text-primary" />
                ) : (
                  <span aria-hidden className="size-4" />
                )}
                <span className="min-w-0 flex-1 truncate">
                  {candidate.name}
                </span>
                {alreadyThere && (
                  <span className="text-muted-foreground text-xs">
                    {playlistCopy('alreadyContains')}
                  </span>
                )}
              </DropdownMenuItem>
            );
          })}

          {playlists.length > 0 && <DropdownMenuSeparator />}

          <DropdownMenuItem onClick={() => setCreating(true)}>
            <PlusIcon aria-hidden />
            {playlistCopy('create')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreatePlaylistDialog
        key={createKey}
        open={creating}
        onOpenChange={handleOpenChange}
        onCreated={handleCreated}
      />
    </>
  );
}

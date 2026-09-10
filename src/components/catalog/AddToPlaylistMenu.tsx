'use client';

import { ListPlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/navigation';
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

export default function AddToPlaylistMenu({
  track,
  playlists,
  appearance = 'icon',
}: AddToPlaylistMenuProps) {
  const t = useTranslations('catalog');
  const playlist = useTranslations('playlist');
  const message = useTranslations('playlist.errors');
  const [isPending, startTransition] = useTransition();

  const labelled = appearance === 'labelled';

  const control = {
    variant: labelled ? ('outline' as const) : ('ghost' as const),
    size: labelled ? ('default' as const) : ('icon-sm' as const),
    disabled: isPending,
    'aria-label': labelled
      ? undefined
      : t('addTrackToPlaylist', { title: track.title }),
  };

  const content = (
    <>
      <ListPlusIcon aria-hidden />
      {labelled && t('addToPlaylist')}
    </>
  );

  function add(playlistId: string) {
    startTransition(async () => {
      const result = await addTrackAction({ playlistId, trackId: track.id });

      // Sonner speaks through its own live region, so the outcome is heard as well as seen.
      if (result.added) {
        toast.success(
          playlist('trackAdded', {
            title: track.title,
            playlist: result.playlistName,
          }),
        );
      } else if (result.reason === 'duplicate') {
        toast.info(playlist('duplicate', { title: track.title }));
      } else {
        toast.error(message(result.reason));
      }
    });
  }

  /*
   * One playlist means there is nothing to choose between, so pressing the control adds the track
   * rather than opening a menu over a single option.
   */
  if (playlists.length === 1) {
    return (
      <Button {...control} onClick={() => add(playlists[0].id)}>
        {content}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={control['aria-label']}
        disabled={isPending}
        render={<Button variant={control.variant} size={control.size} />}
      >
        {content}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-auto min-w-56">
        {playlists.length === 0 ? (
          // Nowhere to add it yet, so the menu offers the one thing that would change that.
          <DropdownMenuItem render={<Link href="/playlists" />}>
            {playlist('create')}
          </DropdownMenuItem>
        ) : (
          playlists.map(candidate => (
            <DropdownMenuItem
              key={candidate.id}
              onClick={() => add(candidate.id)}
            >
              {candidate.name}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

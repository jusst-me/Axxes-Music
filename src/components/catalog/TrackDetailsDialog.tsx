'use client';

import { useTranslations } from 'next-intl';

import AddToPlaylistMenu from '@/components/catalog/AddToPlaylistMenu';
import TrackDetails from '@/components/catalog/TrackDetails';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { PlaylistSummary } from '@/lib/data/playlists';
import type { CatalogTrack } from '@/lib/data/tracks';

type TrackDetailsDialogProps = {
  track: CatalogTrack;
  playlists: PlaylistSummary[];
};

/**
 * The title of a track, and the details behind it.
 *
 * Focus trapping, escape and the return of focus to this trigger all come from the dialog primitive.
 * The same details are linkable at /tracks/[trackId] for anyone who wants to share them.
 */
export default function TrackDetailsDialog({
  track,
  playlists,
}: TrackDetailsDialogProps) {
  const t = useTranslations('catalog.track');

  return (
    <Dialog>
      {/*
       * The title alone says nothing about what pressing it does, so the accessible name says it. It
       * still opens with the words on screen, which is what lets a voice-control user ask for the
       * track by the name they can see.
       */}
      <DialogTrigger
        aria-label={t('detailsFor', { title: track.title })}
        className="focus-visible:ring-ring/50 block w-full truncate rounded-sm text-left font-medium hover:underline focus-visible:ring-3 focus-visible:outline-none"
      >
        {track.title}
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-lg">{track.title}</DialogTitle>
          <DialogDescription>{track.artist}</DialogDescription>
        </DialogHeader>

        <TrackDetails track={track} />

        <DialogFooter>
          <AddToPlaylistMenu
            track={track}
            playlists={playlists}
            appearance="labelled"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

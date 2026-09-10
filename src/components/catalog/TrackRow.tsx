import AddToPlaylistMenu from '@/components/catalog/AddToPlaylistMenu';
import TrackArtwork from '@/components/catalog/TrackArtwork';
import TrackDetailsDialog from '@/components/catalog/TrackDetailsDialog';
import TrackDuration from '@/components/catalog/TrackDuration';
import type { PlaylistSummary } from '@/lib/data/playlists';
import type { CatalogTrack } from '@/lib/data/tracks';

type TrackRowProps = {
  track: CatalogTrack;
  playlists: PlaylistSummary[];
};

export default function TrackRow({ track, playlists }: TrackRowProps) {
  return (
    <li className="flex items-center gap-4 px-4 py-3">
      <TrackArtwork src={track.artworkUrl} />

      <div className="min-w-0 flex-1">
        <TrackDetailsDialog track={track} playlists={playlists} />
        <p className="text-muted-foreground truncate text-sm">
          {track.album ? `${track.artist} · ${track.album}` : track.artist}
        </p>
      </div>

      {track.durationMs !== null && (
        <p className="text-muted-foreground shrink-0 text-sm tabular-nums">
          <TrackDuration milliseconds={track.durationMs} />
        </p>
      )}

      <AddToPlaylistMenu track={track} playlists={playlists} />
    </li>
  );
}

type SearchableTrack = {
  title: string;
  artist: string;
  album: string | null;
};

/**
 * Title, artist or album, matched anywhere and without regard to case.
 *
 * The playlist is already in memory, so this stays on the client: a keystroke should not cost a
 * round trip, and clearing it must put the same rows back in the same order.
 */
export function matchesPlaylistQuery(track: SearchableTrack, query: string) {
  const needle = query.trim().toLowerCase();

  if (!needle) {
    return true;
  }

  return [track.title, track.artist, track.album ?? ''].some(value =>
    value.toLowerCase().includes(needle),
  );
}

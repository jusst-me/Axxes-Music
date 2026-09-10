import { describe, expect, it } from 'vitest';

import { matchesPlaylistQuery } from '@/lib/playlists/filter';

const track = {
  title: 'Around the World',
  artist: 'Daft Punk',
  album: 'Homework',
};

describe('matchesPlaylistQuery', () => {
  it('keeps every track when nothing was typed', () => {
    expect(matchesPlaylistQuery(track, '')).toBe(true);
    expect(matchesPlaylistQuery(track, '   ')).toBe(true);
  });

  it('matches a title, an artist and an album, whatever the casing', () => {
    expect(matchesPlaylistQuery(track, 'WORLD')).toBe(true);
    expect(matchesPlaylistQuery(track, 'daft')).toBe(true);
    expect(matchesPlaylistQuery(track, 'home')).toBe(true);
  });

  it('treats a missing album as nothing rather than as the word null', () => {
    expect(matchesPlaylistQuery({ ...track, album: null }, 'homework')).toBe(
      false,
    );
  });

  it('rejects a query that sits in none of the three fields', () => {
    expect(matchesPlaylistQuery(track, 'radiohead')).toBe(false);
  });
});

// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getPlaylist, listPlaylists } from '@/lib/data/playlists';

const db = vi.hoisted(() => ({
  findMany: vi.fn(),
  findFirst: vi.fn(),
  requireSession: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({ requireSession: db.requireSession }));

vi.mock('@/lib/data/prisma', () => ({
  prisma: { playlist: { findMany: db.findMany, findFirst: db.findFirst } },
}));

beforeEach(() => {
  vi.clearAllMocks();
  db.requireSession.mockResolvedValue({ user: { id: 'user-1' } });
  db.findMany.mockResolvedValue([]);
  db.findFirst.mockResolvedValue(null);
});

describe('listPlaylists', () => {
  it('refuses to read playlists without a session', async () => {
    db.requireSession.mockRejectedValue(new Error('nope'));

    await expect(listPlaylists()).rejects.toThrow('nope');
    expect(db.findMany).not.toHaveBeenCalled();
  });

  it('reads only the playlists the signed-in visitor owns', async () => {
    await listPlaylists();

    expect(db.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { ownerId: 'user-1' } }),
    );
  });

  it('orders on a unique field last, so the list cannot reshuffle between requests', async () => {
    await listPlaylists();

    expect(db.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ name: 'asc' }, { id: 'asc' }] }),
    );
  });

  it('reads which tracks sit in each playlist, so the catalog can mark what is already there', async () => {
    await listPlaylists();

    const [query] = db.findMany.mock.calls[0];

    expect(query.select.tracks).toEqual({ select: { trackId: true } });
  });
});

describe('getPlaylist', () => {
  it('refuses to read a playlist without a session', async () => {
    db.requireSession.mockRejectedValue(new Error('nope'));

    await expect(getPlaylist('playlist-1')).rejects.toThrow('nope');
    expect(db.findFirst).not.toHaveBeenCalled();
  });

  it('makes ownership part of the query rather than a check afterwards', async () => {
    await getPlaylist('playlist-1');

    expect(db.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'playlist-1', ownerId: 'user-1' },
      }),
    );
  });

  it("answers with nothing for someone else's playlist, so a 404 confirms nothing", async () => {
    await expect(getPlaylist('playlist-1')).resolves.toBeNull();
  });

  it('returns the tracks in playlist order rather than in insertion order', async () => {
    await getPlaylist('playlist-1');

    const [query] = db.findFirst.mock.calls[0];

    expect(query.select.tracks.orderBy).toEqual({ position: 'asc' });
  });
});

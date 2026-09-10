// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { listTracks, TRACKS_PER_REQUEST } from '@/lib/data/tracks';

const db = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
  requireSession: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({ requireSession: db.requireSession }));

vi.mock('@/lib/data/prisma', () => ({
  prisma: { track: { findMany: db.findMany, count: db.count } },
}));

function rows(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `track-${index}`,
  }));
}

beforeEach(() => {
  vi.clearAllMocks();
  db.requireSession.mockResolvedValue({ user: { id: 'user-1' } });
  db.count.mockResolvedValue(100);
  db.findMany.mockResolvedValue(rows(TRACKS_PER_REQUEST + 1));
});

describe('listTracks', () => {
  it('refuses to read the catalog without a session', async () => {
    db.requireSession.mockRejectedValue(new Error('nope'));

    await expect(listTracks()).rejects.toThrow('nope');
    expect(db.findMany).not.toHaveBeenCalled();
  });

  it('asks for one row more than it returns, so a second query is not needed', async () => {
    const { tracks, hasMore } = await listTracks();

    expect(db.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: TRACKS_PER_REQUEST + 1, skip: 0 }),
    );
    expect(tracks).toHaveLength(TRACKS_PER_REQUEST);
    expect(hasMore).toBe(true);
  });

  it('reports that the catalog is exhausted when the extra row is absent', async () => {
    db.findMany.mockResolvedValue(rows(TRACKS_PER_REQUEST));

    const { tracks, hasMore } = await listTracks();

    expect(tracks).toHaveLength(TRACKS_PER_REQUEST);
    expect(hasMore).toBe(false);
  });

  it('orders on a unique field last, so paging cannot repeat or lose a row', async () => {
    await listTracks({ skip: 48 });

    expect(db.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 48,
        orderBy: [{ artist: 'asc' }, { title: 'asc' }, { id: 'asc' }],
      }),
    );
  });
});

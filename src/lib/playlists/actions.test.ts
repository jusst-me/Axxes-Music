// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Prisma } from '@/generated/prisma/client';
import {
  addTrackAction,
  removeTrackAction,
  restoreTrackAction,
} from '@/lib/playlists/actions';

const db = vi.hoisted(() => ({
  requireSession: vi.fn(),
  playlistFindFirst: vi.fn(),
  playlistCreate: vi.fn(),
  trackFindFirst: vi.fn(),
  trackFindUnique: vi.fn(),
  trackCreate: vi.fn(),
  trackDelete: vi.fn(),
  trackUpdateMany: vi.fn(),
  transaction: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: db.revalidatePath }));

vi.mock('@/lib/auth/session', () => ({ requireSession: db.requireSession }));

vi.mock('@/lib/data/prisma', () => ({
  prisma: {
    playlist: {
      findFirst: db.playlistFindFirst,
      create: db.playlistCreate,
    },
    playlistTrack: {
      findFirst: db.trackFindFirst,
      findUnique: db.trackFindUnique,
      create: db.trackCreate,
      delete: db.trackDelete,
      updateMany: db.trackUpdateMany,
    },
    $transaction: db.transaction,
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  db.requireSession.mockResolvedValue({ user: { id: 'user-1' } });
  db.playlistFindFirst.mockResolvedValue({ id: 'playlist-1', name: 'Friday' });
  db.trackFindFirst.mockResolvedValue({ position: 2 });
  db.trackFindUnique.mockResolvedValue({ position: 1 });
  db.trackCreate.mockResolvedValue({});
  db.trackDelete.mockResolvedValue({});
  db.trackUpdateMany.mockResolvedValue({ count: 1 });
  db.transaction.mockImplementation(async (ops: Promise<unknown>[]) =>
    Promise.all(ops),
  );
});

describe('addTrackAction', () => {
  it('refuses to write without a session', async () => {
    db.requireSession.mockRejectedValue(new Error('nope'));

    await expect(
      addTrackAction({ playlistId: 'playlist-1', trackId: 'track-1' }),
    ).rejects.toThrow('nope');
    expect(db.trackCreate).not.toHaveBeenCalled();
  });

  it("answers notFound for someone else's playlist, so a 404 confirms nothing", async () => {
    db.playlistFindFirst.mockResolvedValue(null);

    await expect(
      addTrackAction({ playlistId: 'playlist-1', trackId: 'track-1' }),
    ).resolves.toEqual({ added: false, reason: 'notFound' });
  });

  it('appends after the last position rather than disturbing the order', async () => {
    db.trackCreate.mockResolvedValue({});

    await expect(
      addTrackAction({ playlistId: 'playlist-1', trackId: 'track-1' }),
    ).resolves.toEqual({ added: true, playlistName: 'Friday' });

    expect(db.trackCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ position: 3, addedById: 'user-1' }),
      }),
    );
  });

  it('starts at the beginning of an empty playlist', async () => {
    db.trackFindFirst.mockResolvedValue(null);

    await addTrackAction({ playlistId: 'playlist-1', trackId: 'track-1' });

    expect(db.trackCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ position: 0 }),
      }),
    );
  });

  it('reports a duplicate as an answer rather than as a fault', async () => {
    db.trackCreate.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint', {
        code: 'P2002',
        clientVersion: '7.10.0',
      }),
    );

    await expect(
      addTrackAction({ playlistId: 'playlist-1', trackId: 'track-1' }),
    ).resolves.toEqual({ added: false, reason: 'duplicate' });
  });
});

describe('removeTrackAction', () => {
  it('closes the gap in the same transaction, so no reader sees a hole', async () => {
    await expect(
      removeTrackAction({ playlistId: 'playlist-1', trackId: 'track-1' }),
    ).resolves.toEqual({ removed: true, position: 1 });

    expect(db.transaction).toHaveBeenCalled();
    expect(db.trackUpdateMany).toHaveBeenCalledWith({
      where: { playlistId: 'playlist-1', position: { gt: 1 } },
      data: { position: { decrement: 1 } },
    });
  });

  it('answers notFound when the track is no longer there', async () => {
    db.trackFindUnique.mockResolvedValue(null);

    await expect(
      removeTrackAction({ playlistId: 'playlist-1', trackId: 'track-1' }),
    ).resolves.toEqual({ removed: false, reason: 'notFound' });
    expect(db.transaction).not.toHaveBeenCalled();
  });
});

describe('restoreTrackAction', () => {
  it('puts the track back where it was, not at the end', async () => {
    await expect(
      restoreTrackAction({
        playlistId: 'playlist-1',
        trackId: 'track-1',
        position: 1,
      }),
    ).resolves.toEqual({ restored: true });

    expect(db.trackUpdateMany).toHaveBeenCalledWith({
      where: { playlistId: 'playlist-1', position: { gte: 1 } },
      data: { position: { increment: 1 } },
    });
    expect(db.trackCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ position: 1, trackId: 'track-1' }),
      }),
    );
  });
});

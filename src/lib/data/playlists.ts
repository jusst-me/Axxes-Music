import 'server-only';

import { cache } from 'react';

import type { Prisma } from '@/generated/prisma/client';
import { requireSession } from '@/lib/auth/session';
import { prisma } from '@/lib/data/prisma';
import { trackSelect } from '@/lib/data/tracks';

const playlistSummarySelect = {
  id: true,
  name: true,
  description: true,
  visibility: true,
  _count: { select: { tracks: true } },
  // Track ids travel with the summary so a catalog row can tell which playlists already hold it,
  // without a query per row.
  tracks: { select: { trackId: true } },
} satisfies Prisma.PlaylistSelect;

const playlistDetailSelect = {
  id: true,
  name: true,
  description: true,
  visibility: true,
  tracks: {
    select: { id: true, position: true, track: { select: trackSelect } },
    orderBy: { position: 'asc' },
  },
} satisfies Prisma.PlaylistSelect;

export type PlaylistSummary = Prisma.PlaylistGetPayload<{
  select: typeof playlistSummarySelect;
}>;

export type PlaylistDetail = Prisma.PlaylistGetPayload<{
  select: typeof playlistDetailSelect;
}>;

export type PlaylistEntry = PlaylistDetail['tracks'][number];

/**
 * The playlists this visitor owns, in alphabetical order.
 *
 * Ordering on the name rather than on when it was touched means a playlist stays where it was left,
 * which matters more in a list someone picks from than recency does. The id breaks a tie between two
 * playlists named the same, so the order cannot drift between two requests.
 */
export async function listPlaylists() {
  const session = await requireSession();

  return prisma.playlist.findMany({
    where: { ownerId: session.user.id },
    select: playlistSummarySelect,
    orderBy: [{ name: 'asc' }, { id: 'asc' }],
  });
}

/**
 * One playlist with its tracks in order, or `null`.
 *
 * Ownership is part of the query rather than a check afterwards, so a playlist belonging to someone
 * else is indistinguishable from one that never existed. That is what keeps a 404 from confirming
 * that an identifier is real, and it is the behaviour AXM-043 will need when sharing arrives.
 *
 * Cached for the duration of the request, because the route asks for the same playlist twice: once
 * to title the page and once to render it.
 */
export const getPlaylist = cache(async (playlistId: string) => {
  const session = await requireSession();

  return prisma.playlist.findFirst({
    where: { id: playlistId, ownerId: session.user.id },
    select: playlistDetailSelect,
  });
});

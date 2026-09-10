import 'server-only';

import type { Prisma } from '@/generated/prisma/client';
import { requireSession } from '@/lib/auth/session';
import { prisma } from '@/lib/data/prisma';

/** Enough to fill a first screen without sending a thousand rows nobody asked for. */
export const TRACKS_PER_REQUEST = 24;

const trackSelect = {
  id: true,
  title: true,
  artist: true,
  album: true,
  artworkUrl: true,
  durationMs: true,
} satisfies Prisma.TrackSelect;

export type CatalogTrack = Prisma.TrackGetPayload<{
  select: typeof trackSelect;
}>;

/**
 * Artist first, then title, then id. The last one carries no meaning to a reader; it is there because
 * two tracks can share the first two, and without a tiebreaker the database is free to order them
 * differently between queries, which would make a row appear twice or not at all while paging.
 */
const trackOrder = [
  { artist: 'asc' },
  { title: 'asc' },
  { id: 'asc' },
] satisfies Prisma.TrackOrderByWithRelationInput[];

/** The three fields a listener searches by, matched case-insensitively and anywhere in the value. */
function matching(query: string): Prisma.TrackWhereInput {
  if (!query) {
    return {};
  }

  const contains = { contains: query, mode: 'insensitive' } as const;

  return {
    OR: [{ title: contains }, { artist: contains }, { album: contains }],
  };
}

/**
 * A slice of the catalog, along with whether asking again would yield anything.
 *
 * Skipping rows rather than carrying a cursor is deliberate: the catalog is seeded once and does not
 * change while someone is reading it, and at this size the database counts past the offset faster than
 * the page can render. A cursor would buy correctness against inserts that never happen.
 */
export async function listTracks({ skip = 0, query = '' } = {}) {
  await requireSession();

  const where = matching(query);

  const [tracks, total] = await Promise.all([
    prisma.track.findMany({
      where,
      select: trackSelect,
      orderBy: trackOrder,
      skip,
      // One more than asked for, which answers whether there is a next slice without a second query.
      take: TRACKS_PER_REQUEST + 1,
    }),
    prisma.track.count({ where }),
  ]);

  return {
    tracks: tracks.slice(0, TRACKS_PER_REQUEST),
    hasMore: tracks.length > TRACKS_PER_REQUEST,
    total,
  };
}

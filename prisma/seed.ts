import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client';
import { hashPassword } from '../src/lib/auth/password';

const DEMO_USER = {
  email: 'demo@axxes.music',
  name: 'Demo Listener',
  password: 'axxes-music-demo',
};

/**
 * Spread over genres, regions and decades. A catalog of one taste makes searching and browsing look
 * like they work while proving nothing, so the terms deliberately pull in music that has little in
 * common beyond being findable.
 */
const CATALOG_QUERIES = [
  'daft punk',
  'fleetwood mac',
  'kendrick lamar',
  'nina simone',
  'radiohead',
  'tame impala',
  'afrobeat',
  'ambient electronic',
  'baroque concerto',
  'blues legends',
  'bossa nova',
  'disco classics',
  'drum and bass',
  'flamenco guitar',
  'house music',
  'jazz standards',
  'k-pop',
  'metal classics',
  'motown',
  'reggae roots',
  'salsa',
  'singer songwriter folk',
  'soul ballads',
  'synthpop eighties',
];

const RESULTS_PER_QUERY = 50;

/** What the catalog has to amount to before it is worth browsing at all. */
const MINIMUM_CATALOG_SIZE = 200;

type ITunesTrack = {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  primaryGenreName?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  trackTimeMillis?: number;
  releaseDate?: string;
  trackViewUrl?: string;
};

async function searchITunes(term: string): Promise<ITunesTrack[]> {
  const url = new URL('https://itunes.apple.com/search');
  url.searchParams.set('term', term);
  url.searchParams.set('entity', 'song');
  url.searchParams.set('limit', String(RESULTS_PER_QUERY));

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `iTunes search for "${term}" failed with status ${response.status}`,
    );
  }

  const { results } = (await response.json()) as { results: ITunesTrack[] };
  return results;
}

async function fetchCatalog() {
  const byTrackId = new Map<number, ITunesTrack>();
  let withoutPreview = 0;

  for (const term of CATALOG_QUERIES) {
    /*
     * One term at a time. The Search API is public and unauthenticated, which means it is rate
     * limited; a seed that takes a few seconds longer is a better trade than one that trips a 403
     * halfway through and leaves the catalog half filled.
     */

    for (const track of await searchITunes(term)) {
      // A track that cannot be played is of no use here, so it never reaches the database.
      if (!track.previewUrl) {
        withoutPreview += 1;
        continue;
      }

      byTrackId.set(track.trackId, track);
    }
  }

  const tracks = [...byTrackId.values()];

  if (tracks.length < MINIMUM_CATALOG_SIZE) {
    throw new Error(
      `The search returned ${tracks.length} playable tracks, fewer than the ${MINIMUM_CATALOG_SIZE} this catalog needs. Widen CATALOG_QUERIES or try again later.`,
    );
  }

  return { tracks, withoutPreview };
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/** Kept well under the connection pool, so the batch is faster without saturating it. */
const UPSERTS_PER_BATCH = 20;

function* batches<T>(items: T[], size: number) {
  for (let index = 0; index < items.length; index += size) {
    yield items.slice(index, index + size);
  }
}

function upsertTrack(track: ITunesTrack) {
  const data = {
    title: track.trackName,
    artist: track.artistName,
    album: track.collectionName ?? null,
    genre: track.primaryGenreName ?? null,
    // The API returns a 100px thumbnail; the same path serves larger renditions.
    artworkUrl: track.artworkUrl100?.replace('100x100bb', '600x600bb') ?? null,
    previewUrl: track.previewUrl ?? null,
    durationMs: track.trackTimeMillis ?? null,
    releaseDate: track.releaseDate ? new Date(track.releaseDate) : null,
    appleMusicUrl: track.trackViewUrl ?? null,
  };

  return prisma.track.upsert({
    where: { externalId: String(track.trackId) },
    update: data,
    create: { externalId: String(track.trackId), ...data },
  });
}

async function main() {
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: { name: DEMO_USER.name },
    create: {
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      passwordHash: await hashPassword(DEMO_USER.password),
    },
  });

  const { tracks, withoutPreview } = await fetchCatalog();

  for (const batch of batches(tracks, UPSERTS_PER_BATCH)) {
    await Promise.all(batch.map(upsertTrack));
  }

  const genres = new Set(tracks.map(track => track.primaryGenreName));

  console.info(
    `Seeded ${tracks.length} tracks across ${genres.size} genres and the demo account ${user.email}.`,
  );

  if (withoutPreview > 0) {
    console.info(
      `Left out ${withoutPreview} tracks the API offered no preview clip for.`,
    );
  }
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

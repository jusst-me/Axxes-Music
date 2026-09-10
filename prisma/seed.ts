import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../src/generated/prisma/client';
import { hashPassword } from '../src/lib/auth/password';

const DEMO_USER = {
  email: 'demo@axxes.music',
  name: 'Demo Listener',
  password: 'axxes-music-demo',
};

const CATALOG_QUERIES = [
  'daft punk',
  'fleetwood mac',
  'kendrick lamar',
  'nina simone',
  'radiohead',
  'tame impala',
];

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
  url.searchParams.set('limit', '20');

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `iTunes search for "${term}" failed with status ${response.status}`,
    );
  }

  const { results } = (await response.json()) as { results: ITunesTrack[] };
  return results.filter(result => result.previewUrl);
}

async function fetchCatalog() {
  const responses = await Promise.all(CATALOG_QUERIES.map(searchITunes));
  const byTrackId = new Map<number, ITunesTrack>();

  for (const track of responses.flat()) {
    byTrackId.set(track.trackId, track);
  }

  return [...byTrackId.values()];
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

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

  const tracks = await fetchCatalog();

  for (const track of tracks) {
    const data = {
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName ?? null,
      genre: track.primaryGenreName ?? null,
      // The API returns a 100px thumbnail; the same path serves larger renditions.
      artworkUrl:
        track.artworkUrl100?.replace('100x100bb', '600x600bb') ?? null,
      previewUrl: track.previewUrl ?? null,
      durationMs: track.trackTimeMillis ?? null,
      releaseDate: track.releaseDate ? new Date(track.releaseDate) : null,
      appleMusicUrl: track.trackViewUrl ?? null,
    };

    await prisma.track.upsert({
      where: { externalId: String(track.trackId) },
      update: data,
      create: { externalId: String(track.trackId), ...data },
    });
  }

  console.info(
    `Seeded ${tracks.length} tracks and the demo account ${user.email}.`,
  );
}

main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

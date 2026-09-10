'use server';

import { listTracks } from '@/lib/data/tracks';

/**
 * The next slice of the catalog for a browser that has already rendered some of it.
 *
 * It goes through the same data function as the first slice, so the session is verified here too: an
 * action is a public endpoint, and the page having rendered once proves nothing about this call.
 */
export async function loadMoreTracksAction(skip: number) {
  return listTracks({ skip });
}

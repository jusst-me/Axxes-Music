'use server';

import { revalidatePath } from 'next/cache';

import { Prisma } from '@/generated/prisma/client';
import { requireSession } from '@/lib/auth/session';
import { prisma } from '@/lib/data/prisma';
import { fieldErrors, text } from '@/lib/forms/formData';
import { type PlaylistErrorKey, playlistSchema } from '@/lib/playlists/schemas';

/** Every route a playlist is visible on, so a change to one is not read from a stale copy. */
function revalidatePlaylists() {
  revalidatePath('/[locale]/playlists', 'page');
  revalidatePath('/[locale]/playlists/[playlistId]', 'page');
}

/**
 * The playlist under this id, if it belongs to whoever is asking.
 *
 * Ownership is part of the query rather than a check afterwards. An action is a public endpoint:
 * the page having rendered proves nothing about who is calling it now.
 */
async function ownedPlaylist(playlistId: string) {
  const session = await requireSession();

  const playlist = await prisma.playlist.findFirst({
    where: { id: playlistId, ownerId: session.user.id },
    select: { id: true, name: true },
  });

  return { userId: session.user.id, playlist };
}

/**
 * `created` is what the browser needs to confirm the result and move on. Returning it rather than
 * redirecting from here keeps the confirmation in the client, which is the only place that can raise
 * it: a redirect replaces the page before anything could be said about what happened.
 *
 * `values` carries back what was typed, so a rejected attempt does not cost it.
 */
export type CreatePlaylistState = {
  errors?: Partial<Record<'name' | 'description' | 'form', PlaylistErrorKey>>;
  values?: { name?: string; description?: string };
  created?: { id: string; name: string };
};

export async function createPlaylistAction(
  _previous: CreatePlaylistState,
  formData: FormData,
): Promise<CreatePlaylistState> {
  const session = await requireSession();
  const values = {
    name: text(formData, 'name'),
    description: text(formData, 'description'),
  };

  const parsed = playlistSchema.safeParse({
    name: formData.get('name') ?? '',
    description: formData.get('description') ?? '',
  });

  if (!parsed.success) {
    return { errors: fieldErrors<PlaylistErrorKey>(parsed.error), values };
  }

  // Visibility is left to the column default, which is private. A playlist becomes shared by a
  // deliberate act in AXM-043, never by forgetting to say otherwise.
  const created = await prisma.playlist.create({
    data: { ...parsed.data, ownerId: session.user.id },
    select: { id: true, name: true },
  });

  revalidatePlaylists();

  return { created };
}

/**
 * What the browser needs to say what happened: the playlist it happened to, or why it did not.
 *
 * A duplicate is an answer rather than a fault, so it comes back as one. Letting the unique
 * constraint surface would put a stack trace in front of someone who pressed the same button twice.
 */
export type AddTrackResult =
  | { added: true; playlistName: string }
  | { added: false; reason: PlaylistErrorKey };

export async function addTrackAction({
  playlistId,
  trackId,
}: {
  playlistId: string;
  trackId: string;
}): Promise<AddTrackResult> {
  const { userId, playlist } = await ownedPlaylist(playlistId);

  if (!playlist) {
    return { added: false, reason: 'notFound' };
  }

  const last = await prisma.playlistTrack.findFirst({
    where: { playlistId },
    orderBy: { position: 'desc' },
    select: { position: true },
  });

  try {
    await prisma.playlistTrack.create({
      data: {
        playlistId,
        trackId,
        // Appended, so the order someone arranged is never disturbed by an addition.
        position: (last?.position ?? -1) + 1,
        addedById: userId,
      },
    });
  } catch (error) {
    /*
     * The unique constraint on (playlistId, trackId) is what actually answers this: a query
     * beforehand can only report what was true a moment ago.
     */
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return { added: false, reason: 'duplicate' };
    }

    throw error;
  }

  revalidatePlaylists();

  return { added: true, playlistName: playlist.name };
}

'use server';

import { revalidatePath } from 'next/cache';

import { requireSession } from '@/lib/auth/session';
import { prisma } from '@/lib/data/prisma';
import { fieldErrors, text } from '@/lib/forms/formData';
import { type PlaylistErrorKey, playlistSchema } from '@/lib/playlists/schemas';

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

  revalidatePath('/[locale]/playlists', 'page');

  return { created };
}

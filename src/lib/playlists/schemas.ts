import { z } from 'zod';

/** Long enough for a title, short enough to stay readable in a list. The brief asks for 100. */
export const PLAYLIST_NAME_MAX_LENGTH = 100;

export const PLAYLIST_DESCRIPTION_MAX_LENGTH = 500;

/**
 * Validation returns keys, not sentences. The same schema runs in the browser and on the server,
 * where there is no active locale, so the message is looked up where it is rendered.
 */
export const playlistSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: 'nameRequired' })
    .max(PLAYLIST_NAME_MAX_LENGTH, { error: 'nameTooLong' }),
  description: z
    .string()
    .trim()
    .max(PLAYLIST_DESCRIPTION_MAX_LENGTH, { error: 'descriptionTooLong' })
    // An empty box means no description, which the column stores as absent rather than as blank.
    .transform(value => value || null),
});

export type PlaylistInput = z.infer<typeof playlistSchema>;

/** Every message the playlist flows can produce, so a component can look one up type-safely. */
export type PlaylistErrorKey =
  | 'nameRequired'
  | 'nameTooLong'
  | 'descriptionTooLong'
  | 'notFound'
  | 'duplicate';

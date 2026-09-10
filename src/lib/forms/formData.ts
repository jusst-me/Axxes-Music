import type { z } from 'zod';
import { flattenError } from 'zod';

/** What was typed into a text field, or nothing when the form did not carry it. */
export function text(formData: FormData, field: string) {
  const value = formData.get(field);

  return typeof value === 'string' ? value : undefined;
}

/**
 * The first complaint per field, as the key the schema returned rather than as a sentence.
 *
 * Schemas produce keys because they run on the server too, where there is no active locale. Turning
 * them into copy is the rendering component's job.
 */
export function fieldErrors<Key extends string>(
  error: z.ZodError<Record<string, unknown>>,
) {
  return Object.fromEntries(
    Object.entries(flattenError(error).fieldErrors).flatMap(
      ([field, messages]) =>
        messages?.[0] ? [[field, messages[0] as Key]] : [],
    ),
  );
}

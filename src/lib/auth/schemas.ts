import { z } from 'zod';

/** Long enough to survive an offline attack on the hash, which is what OWASP asks a passphrase to do. */
export const PASSWORD_MIN_LENGTH = 12;

/**
 * Validation returns keys, not sentences. The same schema runs in the browser and on the server, where
 * there is no active locale, so the message is looked up where it is rendered.
 */
export const signInSchema = z.object({
  email: z.email({ error: 'emailInvalid' }),
  password: z.string().min(1, { error: 'passwordRequired' }),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(1, { error: 'nameRequired' }),
  email: z.email({ error: 'emailInvalid' }),
  password: z.string().min(PASSWORD_MIN_LENGTH, { error: 'passwordTooShort' }),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;

/** Every message the authentication flow can produce, so a component can look one up type-safely. */
export type AuthErrorKey =
  | 'nameRequired'
  | 'emailInvalid'
  | 'emailTaken'
  | 'passwordRequired'
  | 'passwordTooShort'
  | 'invalidCredentials';

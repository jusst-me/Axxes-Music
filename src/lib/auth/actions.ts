'use server';

import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { getLocale } from 'next-intl/server';
import { z } from 'zod';

import { signIn } from '@/lib/auth/auth';
import { safeCallbackUrl } from '@/lib/auth/routes';
import { type AuthErrorKey, signInSchema } from '@/lib/auth/schemas';

export type SignInField = 'email' | 'password';

/** `form` holds what is wrong with the attempt as a whole rather than with one field. */
export type SignInState = {
  errors?: Partial<Record<SignInField | 'form', AuthErrorKey>>;
};

function fieldErrors(error: z.ZodError<{ email: string; password: string }>) {
  return Object.fromEntries(
    Object.entries(z.flattenError(error).fieldErrors).flatMap(
      ([field, messages]) =>
        messages?.[0] ? [[field, messages[0] as AuthErrorKey]] : [],
    ),
  );
}

export async function signInAction(
  _previous: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  /*
   * Auth.js signals a rejected attempt by throwing: asked for a raw response, it re-throws the
   * AuthError rather than turning it into a redirect. A wrong password and an unknown address arrive
   * here identically, so the answer says nothing about whether the account exists. Anything that is
   * not an AuthError is a genuine fault and is left to surface.
   */
  try {
    await signIn('credentials', { ...parsed.data, redirect: false });
  } catch (error) {
    if (!(error instanceof AuthError)) {
      throw error;
    }

    return { errors: { form: 'invalidCredentials' } };
  }

  const locale = await getLocale();

  // Outside the try, because redirect signals through an exception the framework is meant to catch.
  redirect(safeCallbackUrl(formData.get('callbackUrl')?.toString(), locale));
}

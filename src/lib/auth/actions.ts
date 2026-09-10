'use server';

import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { getLocale } from 'next-intl/server';
import { z } from 'zod';

import { Prisma } from '@/generated/prisma/client';
import { signIn } from '@/lib/auth/auth';
import { hashPassword } from '@/lib/auth/password';
import { LIBRARY_PATH, safeCallbackUrl } from '@/lib/auth/routes';
import {
  type AuthErrorKey,
  signInSchema,
  signUpSchema,
} from '@/lib/auth/schemas';
import { prisma } from '@/lib/data/prisma';

export type SignInField = 'email' | 'password';
export type SignUpField = 'name' | SignInField;

/** `form` holds what is wrong with the attempt as a whole rather than with one field. */
export type SignInState = {
  errors?: Partial<Record<SignInField | 'form', AuthErrorKey>>;
};

export type SignUpState = {
  errors?: Partial<Record<SignUpField | 'form', AuthErrorKey>>;
};

function fieldErrors<T extends Record<string, unknown>>(error: z.ZodError<T>) {
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

export async function signUpAction(
  _previous: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error) };
  }

  const { name, email, password } = parsed.data;

  try {
    await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password) },
    });
  } catch (error) {
    /*
     * The unique constraint is what actually answers this: a query beforehand can only report what was
     * true a moment ago, and between that answer and the insert someone else can take the address.
     */
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return { errors: { email: 'emailTaken' } };
    }

    throw error;
  }

  await signIn('credentials', { email, password, redirect: false });

  const locale = await getLocale();

  redirect(`/${locale}${LIBRARY_PATH}`);
}

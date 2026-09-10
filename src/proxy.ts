import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import createIntlMiddleware from 'next-intl/middleware';

import { routing } from '@/i18n/routing';
import { authConfig } from '@/lib/auth/config';
import { authRedirect } from '@/lib/auth/routes';

const handleLocale = createIntlMiddleware(routing);

/** Reads the session cookie only; the credentials provider and its database access stay out of here. */
const { auth } = NextAuth(authConfig);

/**
 * This check is optimistic, in the sense the Next.js documentation means: it keeps a visitor without a
 * session away from a private page, but it is not what protects the data. Every server action and data
 * function verifies the session again, because a cookie is all this sees.
 */
export default auth(request => {
  const redirectTo = authRedirect({
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    isAuthenticated: Boolean(request.auth),
  });

  if (redirectTo) {
    return NextResponse.redirect(new URL(redirectTo, request.nextUrl));
  }

  return handleLocale(request);
});

export const config = {
  /*
   * Auth.js callback URLs are fixed and must not be locale-prefixed, so /api stays out. Anything with
   * a file extension is excluded too, otherwise public assets would be redirected to /en/logo.svg.
   */
  matcher: '/((?!api|_next|.well-known|.*\\..*).*)',
};

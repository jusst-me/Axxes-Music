import createIntlMiddleware from 'next-intl/middleware';

import { routing } from '@/i18n/routing';

export default createIntlMiddleware(routing);

export const config = {
  /*
   * Auth.js callback URLs are fixed and must not be locale-prefixed, so /api stays out. Anything with
   * a file extension is excluded too, otherwise public assets would be redirected to /en/logo.svg.
   */
  matcher: '/((?!api|_next|.well-known|.*\\..*).*)',
};

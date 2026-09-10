import { hasLocale } from 'next-intl';

import type { Locale } from '@/constants/locales';
import { routing } from '@/i18n/routing';

/**
 * The only paths reachable without a session. Everything absent from this list requires one, so a route
 * added later is private until someone deliberately opens it up.
 */
export const PUBLIC_PATHS = ['/', '/login', '/register'];

export const SIGN_IN_PATH = '/login';

/** Where someone with a session belongs when they have not asked for anything in particular. */
export const LIBRARY_PATH = '/playlists';

/** Carries the page the visitor was after, so signing in continues rather than starts over. */
export const CALLBACK_PARAM = 'callbackUrl';

/** Splits `/nl/playlists/42` into the locale and the path the rest of the app reasons about. */
export function splitLocale(pathname: string) {
  const [, first = '', ...rest] = pathname.split('/');

  if (!hasLocale(routing.locales, first)) {
    return { locale: null, path: pathname };
  }

  return { locale: first, path: `/${rest.join('/')}` };
}

export function isPublicPath(path: string) {
  return PUBLIC_PATHS.some(
    publicPath => path === publicPath || path.startsWith(`${publicPath}/`),
  );
}

/**
 * A callback URL arrives from the query string, where anyone can put anything. Only a path within this
 * application is accepted; an absolute URL, or the `//host` form a browser reads as one, is discarded.
 */
export function safeCallbackUrl(
  value: string | null | undefined,
  locale: Locale,
) {
  if (value?.startsWith('/') && !value.startsWith('//')) {
    return value;
  }

  return `/${locale}`;
}

type Visit = {
  pathname: string;
  search?: string;
  isAuthenticated: boolean;
};

/**
 * Where an unauthenticated visitor should be sent, or `null` when the request may continue.
 *
 * A path without a locale prefix is left alone: the intl middleware adds the prefix first, and the
 * request comes back around with a locale this can preserve.
 */
export function authRedirect({
  pathname,
  search = '',
  isAuthenticated,
}: Visit) {
  const { locale, path } = splitLocale(pathname);

  if (!locale || isAuthenticated || isPublicPath(path)) {
    return null;
  }

  const destination = new URLSearchParams({
    [CALLBACK_PARAM]: `${pathname}${search}`,
  });

  return `/${locale}${SIGN_IN_PATH}?${destination}`;
}

// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  authRedirect,
  isPublicPath,
  safeCallbackUrl,
  splitLocale,
} from '@/lib/auth/routes';

describe('splitLocale', () => {
  it('separates a known locale from the rest of the path', () => {
    expect(splitLocale('/nl/playlists/42')).toEqual({
      locale: 'nl',
      path: '/playlists/42',
    });
  });

  it('reports no locale when the first segment is not one', () => {
    expect(splitLocale('/playlists')).toEqual({
      locale: null,
      path: '/playlists',
    });
  });

  it('reads a bare locale as the landing page', () => {
    expect(splitLocale('/de')).toEqual({ locale: 'de', path: '/' });
  });
});

describe('isPublicPath', () => {
  it.each(['/', '/login', '/register'])(
    'lets %s through without a session',
    path => {
      expect(isPublicPath(path)).toBe(true);
    },
  );

  it.each(['/catalog', '/playlists', '/playlists/42'])(
    'keeps %s behind a session',
    path => {
      expect(isPublicPath(path)).toBe(false);
    },
  );

  it('does not mistake a private path for a public one that starts the same way', () => {
    expect(isPublicPath('/logins')).toBe(false);
  });
});

describe('authRedirect', () => {
  it('sends an unauthenticated visitor to the sign-in page of their language', () => {
    expect(
      authRedirect({ pathname: '/de/playlists', isAuthenticated: false }),
    ).toBe('/de/login?callbackUrl=%2Fde%2Fplaylists');
  });

  it('remembers the query string of the page that was asked for', () => {
    expect(
      authRedirect({
        pathname: '/en/catalog',
        search: '?q=bowie',
        isAuthenticated: false,
      }),
    ).toBe('/en/login?callbackUrl=%2Fen%2Fcatalog%3Fq%3Dbowie');
  });

  it('leaves a signed-in visitor alone', () => {
    expect(
      authRedirect({ pathname: '/nl/playlists', isAuthenticated: true }),
    ).toBeNull();
  });

  it.each(['/nl', '/nl/login', '/nl/register'])(
    'takes a signed-in visitor from %s to their library',
    pathname => {
      expect(authRedirect({ pathname, isAuthenticated: true })).toBe(
        '/nl/playlists',
      );
    },
  );

  it('leaves a public page alone', () => {
    expect(
      authRedirect({ pathname: '/nl/login', isAuthenticated: false }),
    ).toBeNull();
  });

  it('waits for the locale prefix before deciding', () => {
    expect(
      authRedirect({ pathname: '/playlists', isAuthenticated: false }),
    ).toBeNull();
  });
});

describe('safeCallbackUrl', () => {
  it('keeps a path within the application', () => {
    expect(safeCallbackUrl('/nl/playlists', 'nl')).toBe('/nl/playlists');
  });

  it.each(['https://example.com', '//example.com', '', null, undefined])(
    'refuses %s and falls back to the landing page',
    value => {
      expect(safeCallbackUrl(value, 'de')).toBe('/de');
    },
  );
});

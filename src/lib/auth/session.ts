import 'server-only';

import { auth } from '@/lib/auth/auth';

export class UnauthenticatedError extends Error {
  constructor() {
    super('This action requires a signed-in user.');
    this.name = 'UnauthenticatedError';
  }
}

/**
 * The session, or an error. Every data function and server action calls this for itself: the proxy has
 * seen nothing but a cookie, so it can keep a page from rendering but it cannot vouch for a request.
 */
export async function requireSession() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthenticatedError();
  }

  return session;
}

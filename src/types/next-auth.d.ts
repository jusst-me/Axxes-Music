import type { DefaultSession } from 'next-auth';

/** Puts the user id on the session, so a server action knows whose data it is looking at. */
declare module 'next-auth' {
  interface Session {
    user: { id: string } & DefaultSession['user'];
  }
}

import type { NextAuthConfig } from 'next-auth';

/**
 * The half of the configuration that carries no database access, so the proxy can read a session
 * without pulling Prisma and Argon2 into a module that runs on every request.
 */
export const authConfig = {
  providers: [],
  session: { strategy: 'jwt' },
  callbacks: {
    session({ session, token }) {
      // Auth.js stores the user id in the standard `sub` claim; the session exposes it under a name
      // the rest of the application can read without knowing that.
      if (token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { authConfig } from '@/lib/auth/config';
import { verifyPassword } from '@/lib/auth/password';
import { signInSchema } from '@/lib/auth/schemas';
import { prisma } from '@/lib/data/prisma';

/**
 * Verified against when the email address is unknown. Without it, a missing account would answer in a
 * fraction of the time a wrong password takes, and that difference is enough to enumerate addresses.
 */
const ABSENT_USER_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$eYp+uxboVecM2RfFttmJUg$De0oy9w6SzUu29XR8itsKahHu3gKkQ5mpyLsLhxyTBI';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        const matches = await verifyPassword(
          user?.passwordHash ?? ABSENT_USER_HASH,
          parsed.data.password,
        );

        if (!user || !matches) {
          return null;
        }

        // The hash stays on the server: only what the session needs is returned.
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
});

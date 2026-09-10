// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { requireSession, UnauthenticatedError } from '@/lib/auth/session';

const session = vi.hoisted(() => ({ current: null as unknown }));

vi.mock('@/lib/auth/auth', () => ({
  auth: () => Promise.resolve(session.current),
}));

beforeEach(() => {
  session.current = null;
});

describe('requireSession', () => {
  it('refuses to run without a session', async () => {
    await expect(requireSession()).rejects.toThrow(UnauthenticatedError);
  });

  it('refuses a session that carries no user', async () => {
    session.current = { expires: '2099-01-01' };

    await expect(requireSession()).rejects.toThrow(UnauthenticatedError);
  });

  it('returns the session when a user is signed in', async () => {
    session.current = {
      user: { id: 'user-1', name: 'Ada', email: 'ada@example.com' },
    };

    await expect(requireSession()).resolves.toMatchObject({
      user: { id: 'user-1' },
    });
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import UserMenu from '@/components/layout/UserMenu';
import messages from '@/dictionaries/en.json';
import { axe } from '@/lib/testing/axe';

const signOut = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth/actions', () => ({
  signOutAction: () => signOut(),
}));

function renderMenu() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <UserMenu name="Ada Lovelace" email="ada@example.com" />
    </NextIntlClientProvider>,
  );
}

/**
 * Base UI opens its menu on pointer events that jsdom does not emulate faithfully, so the menu is
 * opened the way a keyboard user would. That is the path worth guarding anyway; the pointer path is
 * verified in a real browser.
 */
async function openMenu() {
  await userEvent.tab();
  await userEvent.keyboard('{Enter}');
}

beforeEach(() => {
  signOut.mockReset();
});

describe('UserMenu', () => {
  it('has an accessible name that does not depend on the initial', () => {
    renderMenu();

    expect(
      screen.getByRole('button', { name: 'Account menu' }),
    ).toBeInTheDocument();
  });

  it('shows who is signed in', async () => {
    renderMenu();
    await openMenu();

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
  });

  it('signs out from the keyboard', async () => {
    renderMenu();
    await openMenu();

    await userEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }));

    expect(signOut).toHaveBeenCalledOnce();
  });

  it('returns focus to the trigger when the menu closes', async () => {
    renderMenu();
    await openMenu();

    await userEvent.keyboard('{Escape}');

    expect(screen.getByRole('button', { name: 'Account menu' })).toHaveFocus();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderMenu();

    expect(await axe(container)).toHaveNoViolations();
  });
});

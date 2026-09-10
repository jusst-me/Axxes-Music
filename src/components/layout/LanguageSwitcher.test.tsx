import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import messages from '@/dictionaries/en.json';
import { axe } from '@/lib/testing/axe';

const replace = vi.hoisted(() => vi.fn());

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/playlists/summer-mix',
  useRouter: () => ({ replace }),
}));

function renderSwitcher() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <LanguageSwitcher />
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

describe('LanguageSwitcher', () => {
  it('names the language that is currently active', () => {
    renderSwitcher();

    expect(
      screen.getByRole('button', { name: 'Language, currently English' }),
    ).toBeInTheDocument();
  });

  it('offers each language in its own language, marked with a lang attribute', async () => {
    renderSwitcher();
    await openMenu();

    expect(
      screen.getByRole('menuitemradio', { name: 'English' }),
    ).toHaveAttribute('lang', 'en-GB');
    expect(
      screen.getByRole('menuitemradio', { name: 'Nederlands' }),
    ).toHaveAttribute('lang', 'nl-NL');
    expect(
      screen.getByRole('menuitemradio', { name: 'Deutsch' }),
    ).toHaveAttribute('lang', 'de-DE');
  });

  it('marks the active language as checked', async () => {
    renderSwitcher();
    await openMenu();

    expect(
      screen.getByRole('menuitemradio', { name: 'English' }),
    ).toBeChecked();
    expect(
      screen.getByRole('menuitemradio', { name: 'Deutsch' }),
    ).not.toBeChecked();
  });

  it('keeps the visitor on the current page when switching', async () => {
    renderSwitcher();
    await openMenu();

    await userEvent.click(
      screen.getByRole('menuitemradio', { name: 'Deutsch' }),
    );

    expect(replace).toHaveBeenCalledWith('/playlists/summer-mix', {
      locale: 'de',
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = renderSwitcher();

    expect(await axe(container)).toHaveNoViolations();
  });
});

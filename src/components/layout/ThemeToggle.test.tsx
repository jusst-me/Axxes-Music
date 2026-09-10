import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import ThemeToggle from '@/components/layout/ThemeToggle';
import messages from '@/dictionaries/en.json';
import { axe } from '@/lib/testing/axe';

const setTheme = vi.hoisted(() => vi.fn());
const theme = vi.hoisted(() => ({ current: 'system' }));

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: theme.current, setTheme }),
}));

function renderToggle(current: string) {
  theme.current = current;

  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ThemeToggle />
    </NextIntlClientProvider>,
  );
}

/** Base UI opens on pointer events jsdom does not emulate; see LanguageSwitcher.test.tsx. */
async function openMenu() {
  await userEvent.tab();
  await userEvent.keyboard('{Enter}');
}

describe('ThemeToggle', () => {
  it('names the mode that is currently active', () => {
    renderToggle('dark');

    expect(
      screen.getByRole('button', { name: 'Theme, currently Dark' }),
    ).toBeInTheDocument();
  });

  it('offers light, dark and system', async () => {
    renderToggle('system');
    await openMenu();

    expect(
      screen.getByRole('menuitemradio', { name: 'Light' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitemradio', { name: 'Dark' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('menuitemradio', { name: 'System' })).toBeChecked();
  });

  it('falls back to system for a mode it does not offer', () => {
    renderToggle('solarized');

    expect(
      screen.getByRole('button', { name: 'Theme, currently System' }),
    ).toBeInTheDocument();
  });

  it('stores the chosen mode', async () => {
    renderToggle('system');
    await openMenu();

    await userEvent.click(screen.getByRole('menuitemradio', { name: 'Dark' }));

    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderToggle('light');

    expect(await axe(container)).toHaveNoViolations();
  });
});

import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';

import MainNav from '@/components/layout/MainNav';
import messages from '@/dictionaries/en.json';
import { axe } from '@/lib/testing/axe';

const pathname = vi.hoisted(() => ({ current: '/catalog' }));

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => pathname.current,
  Link: ({ href, ...props }: ComponentProps<'a'>) => (
    <a href={href} {...props} />
  ),
}));

function renderNav(currentPath: string) {
  pathname.current = currentPath;

  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <MainNav />
    </NextIntlClientProvider>,
  );
}

describe('MainNav', () => {
  it('is a navigation landmark with an accessible name', () => {
    renderNav('/catalog');

    expect(
      screen.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeInTheDocument();
  });

  it('marks only the current page', () => {
    renderNav('/catalog');

    expect(screen.getByRole('link', { name: 'Catalog' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Playlists' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('treats a nested route as being on that section', () => {
    renderNav('/playlists/summer-mix');

    expect(screen.getByRole('link', { name: 'Playlists' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('marks nothing on a route outside the navigation', () => {
    renderNav('/');

    for (const link of screen.getAllByRole('link')) {
      expect(link).not.toHaveAttribute('aria-current');
    }
  });

  it('has no accessibility violations', async () => {
    const { container } = renderNav('/catalog');

    expect(await axe(container)).toHaveNoViolations();
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CatalogSearch from '@/components/catalog/CatalogSearch';
import messages from '@/dictionaries/en.json';
import { axe } from '@/lib/testing/axe';

const replace = vi.hoisted(() => vi.fn());

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/catalog',
  useRouter: () => ({ replace }),
}));

function renderSearch(query = '') {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <CatalogSearch query={query} />
    </NextIntlClientProvider>,
  );
}

function field() {
  return screen.getByRole('searchbox', { name: 'Search the catalog' });
}

beforeEach(() => {
  replace.mockReset();
});

describe('CatalogSearch', () => {
  it('starts from the query the URL carries, so a shared link opens on its results', () => {
    renderSearch('daft punk');

    expect(field()).toHaveValue('daft punk');
  });

  it('puts the query in the URL rather than in component state', async () => {
    renderSearch();

    await userEvent.type(field(), 'daft');

    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        { pathname: '/catalog', query: { q: 'daft' } },
        { scroll: false },
      ),
    );
  });

  it('waits for the typing to stop rather than searching per keystroke', async () => {
    renderSearch();

    await userEvent.type(field(), 'daft');

    await waitFor(() => expect(replace).toHaveBeenCalledTimes(1));
  });

  it('keeps the field focused while the query travels to the URL', async () => {
    renderSearch();

    await userEvent.type(field(), 'daft');
    await waitFor(() => expect(replace).toHaveBeenCalled());

    expect(field()).toHaveFocus();
  });

  it('searches immediately when the typist presses enter', async () => {
    renderSearch();

    await userEvent.type(field(), 'daft{Enter}');

    expect(replace).toHaveBeenCalledWith(
      { pathname: '/catalog', query: { q: 'daft' } },
      { scroll: false },
    );
  });

  it('drops the query from the URL rather than leaving an empty one behind', async () => {
    renderSearch('daft');

    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(replace).toHaveBeenCalledWith(
      { pathname: '/catalog', query: {} },
      { scroll: false },
    );
  });

  it('returns focus to the field after clearing, so typing can continue', async () => {
    renderSearch('daft');

    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(field()).toHaveFocus();
    expect(field()).toHaveValue('');
  });

  it('offers nothing to clear while the field is empty', () => {
    renderSearch();

    expect(
      screen.queryByRole('button', { name: 'Clear search' }),
    ).not.toBeInTheDocument();
  });

  it('follows the URL when the visitor navigates back to another query', () => {
    const { rerender } = renderSearch('daft');

    rerender(
      <NextIntlClientProvider locale="en" messages={messages}>
        <CatalogSearch query="" />
      </NextIntlClientProvider>,
    );

    expect(field()).toHaveValue('');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderSearch('daft');

    expect(await axe(container)).toHaveNoViolations();
  });
});

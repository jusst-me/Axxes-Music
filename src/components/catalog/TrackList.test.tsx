import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import TrackList from '@/components/catalog/TrackList';
import messages from '@/dictionaries/en.json';
import type { CatalogTrack } from '@/lib/data/tracks';
import { axe } from '@/lib/testing/axe';

const loadMore = vi.hoisted(() =>
  vi.fn<(request: { skip: number; query: string }) => unknown>(),
);

vi.mock('@/lib/catalog/actions', () => ({
  loadMoreTracksAction: (request: { skip: number; query: string }) =>
    loadMore(request),
}));

// next-intl's client navigation reaches for `next/navigation`, which does not resolve under Vitest.
// The locale prefixing it adds is covered in src/i18n/routing.test.ts; here only the anchor matters.
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, ...props }: { href: string }) => <a href={href} {...props} />,
}));

function track(overrides: Partial<CatalogTrack> = {}): CatalogTrack {
  return {
    id: 'track-1',
    title: 'Around the World',
    artist: 'Daft Punk',
    album: 'Homework',
    genre: 'Electronic',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/cover.jpg',
    durationMs: 429_000,
    releaseDate: new Date('1997-01-20T00:00:00.000Z'),
    appleMusicUrl: 'https://music.apple.com/album/homework/697194953',
    ...overrides,
  };
}

function renderList(props: Partial<Parameters<typeof TrackList>[0]> = {}) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <TrackList
        tracks={[track()]}
        hasMore={false}
        total={1}
        query=""
        {...props}
      />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  loadMore.mockReset();
});

describe('TrackList', () => {
  it('renders the catalog as a genuine list', () => {
    renderList();

    expect(
      within(screen.getByRole('list')).getAllByRole('listitem'),
    ).toHaveLength(1);
  });

  it('shows what a listener chooses on: title, artist, album and duration', () => {
    renderList();

    const row = screen.getByRole('listitem');

    expect(
      within(row).getByRole('button', { name: /Around the World/ }),
    ).toBeInTheDocument();
    expect(within(row).getByText('Daft Punk · Homework')).toBeInTheDocument();
    expect(within(row).getByText('7:09')).toBeInTheDocument();
  });

  it('spells the duration out for anyone who cannot see the clock face', () => {
    renderList();

    expect(screen.getByText('7 minutes and 9 seconds')).toBeInTheDocument();
  });

  it('says a track has no artwork rather than leaving a gap', () => {
    renderList({ tracks: [track({ artworkUrl: null })] });

    expect(
      screen.getByRole('img', { name: 'No artwork available' }),
    ).toBeInTheDocument();
  });

  it('leaves artwork out of the accessibility tree when the row already names the track', () => {
    renderList();

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('offers nothing to load when the catalog fits on the page', () => {
    renderList();

    expect(
      screen.queryByRole('button', { name: 'Load more tracks' }),
    ).not.toBeInTheDocument();
  });

  it('appends the next slice rather than replacing what is on screen', async () => {
    loadMore.mockResolvedValue({
      tracks: [track({ id: 'track-2', title: 'Digital Love' })],
      hasMore: true,
      total: 3,
    });

    renderList({ hasMore: true, total: 3 });

    await userEvent.click(
      screen.getByRole('button', { name: 'Load more tracks' }),
    );

    await waitFor(() =>
      expect(screen.getAllByRole('listitem')).toHaveLength(2),
    );
    expect(screen.getByText('Around the World')).toBeInTheDocument();
    expect(screen.getByText('Showing 2 of 3 tracks')).toBeInTheDocument();
  });

  it('asks for the slice after the one it already has', async () => {
    loadMore.mockResolvedValue({ tracks: [], hasMore: false, total: 1 });

    renderList({ hasMore: true, total: 3 });

    await userEvent.click(
      screen.getByRole('button', { name: 'Load more tracks' }),
    );

    expect(loadMore).toHaveBeenCalledWith({ skip: 1, query: '' });
  });

  it('pages through the search rather than through the whole catalog', async () => {
    loadMore.mockResolvedValue({ tracks: [], hasMore: false, total: 1 });

    renderList({ hasMore: true, total: 3, query: 'daft' });

    await userEvent.click(
      screen.getByRole('button', { name: 'Load more tracks' }),
    );

    expect(loadMore).toHaveBeenCalledWith({ skip: 1, query: 'daft' });
  });

  it('catches focus when the last slice takes the button away', async () => {
    loadMore.mockResolvedValue({
      tracks: [track({ id: 'track-2', title: 'Digital Love' })],
      hasMore: false,
      total: 2,
    });

    renderList({ hasMore: true, total: 2 });

    await userEvent.click(
      screen.getByRole('button', { name: 'Load more tracks' }),
    );

    await waitFor(() =>
      expect(screen.getByText('Showing 2 of 2 tracks')).toHaveFocus(),
    );
  });

  it('offers a way forward when the catalog is empty', () => {
    renderList({ tracks: [], hasMore: false, total: 0 });

    expect(
      screen.getByRole('heading', { name: 'No tracks found' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('offers a way out of a search that found nothing', () => {
    renderList({ tracks: [], hasMore: false, total: 0, query: 'zzz' });

    expect(
      screen.getByRole('link', { name: 'Clear search' }),
    ).toBeInTheDocument();
  });

  it('leaves the clear control out when there is no search to clear', () => {
    renderList({ tracks: [], hasMore: false, total: 0 });

    expect(
      screen.queryByRole('link', { name: 'Clear search' }),
    ).not.toBeInTheDocument();
  });

  it('keeps the live region in the document when a search finds nothing', () => {
    const { container } = renderList({
      tracks: [],
      hasMore: false,
      total: 0,
      query: 'zzz',
    });

    expect(container.querySelector('[aria-live="polite"]')).toHaveTextContent(
      'No tracks found',
    );
  });

  it('starts over rather than appending when the search changes', async () => {
    loadMore.mockResolvedValue({
      tracks: [track({ id: 'track-2', title: 'Digital Love' })],
      hasMore: false,
      total: 2,
    });

    const { rerender } = renderList({ hasMore: true, total: 2 });

    await userEvent.click(
      screen.getByRole('button', { name: 'Load more tracks' }),
    );
    await waitFor(() =>
      expect(screen.getAllByRole('listitem')).toHaveLength(2),
    );

    rerender(
      <NextIntlClientProvider locale="en" messages={messages}>
        <TrackList
          tracks={[track({ id: 'track-3', title: 'One More Time' })]}
          hasMore={false}
          total={1}
          query="one"
        />
      </NextIntlClientProvider>,
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('One More Time')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderList({ hasMore: true, total: 3 });

    expect(await axe(container)).toHaveNoViolations();
  });
});

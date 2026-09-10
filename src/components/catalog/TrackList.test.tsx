import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import TrackList from '@/components/catalog/TrackList';
import messages from '@/dictionaries/en.json';
import type { CatalogTrack } from '@/lib/data/tracks';
import { axe } from '@/lib/testing/axe';

const loadMore = vi.hoisted(() => vi.fn());

vi.mock('@/lib/catalog/actions', () => ({
  loadMoreTracksAction: (skip: number) => loadMore(skip),
}));

function track(overrides: Partial<CatalogTrack> = {}): CatalogTrack {
  return {
    id: 'track-1',
    title: 'Around the World',
    artist: 'Daft Punk',
    album: 'Homework',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/cover.jpg',
    durationMs: 429_000,
    ...overrides,
  };
}

function renderList(props: Partial<Parameters<typeof TrackList>[0]> = {}) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <TrackList tracks={[track()]} hasMore={false} total={1} {...props} />
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

    expect(within(row).getByText('Around the World')).toBeInTheDocument();
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

    expect(loadMore).toHaveBeenCalledWith(1);
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

  it('has no accessibility violations', async () => {
    const { container } = renderList({ hasMore: true, total: 3 });

    expect(await axe(container)).toHaveNoViolations();
  });
});

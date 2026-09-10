import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PlaylistTracks from '@/components/playlists/PlaylistTracks';
import messages from '@/dictionaries/en.json';
import type { PlaylistEntry } from '@/lib/data/playlists';
import { axe } from '@/lib/testing/axe';

const removeTrack = vi.hoisted(() => vi.fn());
const restoreTrack = vi.hoisted(() => vi.fn());
const toasts = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock('@/lib/playlists/actions', () => ({
  removeTrackAction: (request: { playlistId: string; trackId: string }) =>
    removeTrack(request),
  restoreTrackAction: (request: {
    playlistId: string;
    trackId: string;
    position: number;
  }) => restoreTrack(request),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, ...props }: { href: string }) => <a href={href} {...props} />,
}));

vi.mock('sonner', () => ({ toast: toasts }));

function entry(
  overrides: Partial<PlaylistEntry> & {
    title?: string;
    position?: number;
  } = {},
): PlaylistEntry {
  const { title = 'Around the World', position = 0, ...rest } = overrides;

  return {
    id: `entry-${title}`,
    position,
    track: {
      id: `track-${title}`,
      title,
      artist: 'Daft Punk',
      album: 'Homework',
      genre: 'Electronic',
      artworkUrl: null,
      durationMs: 429_000,
      releaseDate: null,
      appleMusicUrl: null,
    },
    ...rest,
  };
}

function renderList(entries: PlaylistEntry[] = [entry()]) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <PlaylistTracks
        playlistId="playlist-1"
        playlistName="Friday afternoon"
        entries={entries}
      />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  removeTrack.mockResolvedValue({ removed: true, position: 0 });
  restoreTrack.mockResolvedValue({ restored: true });
});

describe('PlaylistTracks', () => {
  it('names the track a remove control would take away', () => {
    renderList();

    expect(
      screen.getByRole('button', {
        name: 'Remove Around the World from this playlist',
      }),
    ).toBeInTheDocument();
  });

  it('takes the row off the page immediately, before the server answers', async () => {
    removeTrack.mockReturnValue(new Promise(() => undefined));

    renderList([entry(), entry({ title: 'Digital Love', position: 1 })]);

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Remove Around the World from this playlist',
      }),
    );

    expect(screen.queryByText('Around the World')).not.toBeInTheDocument();
    expect(screen.getByText('Digital Love')).toBeInTheDocument();
    expect(screen.getByText('1 track')).toBeInTheDocument();
  });

  it('puts the row back when the server refuses', async () => {
    removeTrack.mockResolvedValue({ removed: false, reason: 'notFound' });

    renderList();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Remove Around the World from this playlist',
      }),
    );

    await waitFor(() =>
      expect(screen.getByText('Around the World')).toBeInTheDocument(),
    );
    expect(toasts.error).toHaveBeenCalledWith(
      'That playlist no longer exists.',
    );
  });

  it('offers undo through the confirmation, and putting it back uses the old position', async () => {
    renderList();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Remove Around the World from this playlist',
      }),
    );

    await waitFor(() => expect(toasts.success).toHaveBeenCalled());

    const [[message, options]] = toasts.success.mock.calls;

    expect(message).toBe('Around the World was removed from Friday afternoon.');
    expect(options.action.label).toBe('Undo');

    options.action.onClick();

    await waitFor(() =>
      expect(restoreTrack).toHaveBeenCalledWith({
        playlistId: 'playlist-1',
        trackId: 'track-Around the World',
        position: 0,
      }),
    );
    expect(screen.getByText('Around the World')).toBeInTheDocument();
  });

  it('moves focus to the next remove control so it does not land on the document', async () => {
    renderList([entry(), entry({ title: 'Digital Love', position: 1 })]);

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Remove Around the World from this playlist',
      }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole('button', {
          name: 'Remove Digital Love from this playlist',
        }),
      ).toHaveFocus(),
    );
  });

  it('catches focus on the count when the last row leaves', async () => {
    renderList();

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Remove Around the World from this playlist',
      }),
    );

    await waitFor(() => expect(screen.getByText('No tracks')).toHaveFocus());
  });

  it('filters on the client by title, artist and album', async () => {
    renderList([
      entry(),
      entry({ title: 'Digital Love', position: 1 }),
      {
        ...entry({ title: 'Get Lucky', position: 2 }),
        track: {
          ...entry().track,
          id: 'track-get-lucky',
          title: 'Get Lucky',
          album: 'Random Access Memories',
        },
      },
    ]);

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Search this playlist' }),
      'digital',
    );

    expect(screen.getByText('Digital Love')).toBeInTheDocument();
    expect(screen.queryByText('Around the World')).not.toBeInTheDocument();
    expect(screen.queryByText('Get Lucky')).not.toBeInTheDocument();
  });

  it('announces how many tracks the filter left', async () => {
    renderList([entry(), entry({ title: 'Digital Love', position: 1 })]);

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Search this playlist' }),
      'digital',
    );

    expect(screen.getByText('1 track found')).toBeInTheDocument();
  });

  it('explains why the order cannot change while a filter is active', async () => {
    renderList([entry(), entry({ title: 'Digital Love', position: 1 })]);

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Search this playlist' }),
      'digital',
    );

    expect(
      screen.getByText(
        'The order cannot be changed while a search is active. Clear the search to rearrange the tracks.',
      ),
    ).toBeInTheDocument();
  });

  it('puts the full list back when the filter is cleared', async () => {
    renderList([entry(), entry({ title: 'Digital Love', position: 1 })]);

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Search this playlist' }),
      'digital',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(screen.getByText('Around the World')).toBeInTheDocument();
    expect(screen.getByText('Digital Love')).toBeInTheDocument();
    expect(screen.getByText('2 tracks')).toBeInTheDocument();
  });

  it('offers a way out of a filter that found nothing', async () => {
    renderList();

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Search this playlist' }),
      'zzzzz',
    );

    expect(
      screen.getByRole('heading', { name: 'No tracks match' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Clear search' })[0],
    );

    expect(screen.getByText('Around the World')).toBeInTheDocument();
  });

  it('leaves the search field out of an empty playlist', () => {
    renderList([]);

    expect(
      screen.queryByRole('searchbox', { name: 'Search this playlist' }),
    ).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderList([
      entry(),
      entry({ title: 'Digital Love', position: 1 }),
    ]);

    expect(await axe(container)).toHaveNoViolations();
  });
});

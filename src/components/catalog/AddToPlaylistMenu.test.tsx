import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AddToPlaylistMenu from '@/components/catalog/AddToPlaylistMenu';
import messages from '@/dictionaries/en.json';
import type { PlaylistSummary } from '@/lib/data/playlists';
import type { CatalogTrack } from '@/lib/data/tracks';
import { axe } from '@/lib/testing/axe';

const addTrack = vi.hoisted(() => vi.fn());
const toasts = vi.hoisted(() => ({
  success: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
}));

vi.mock('@/lib/playlists/actions', () => ({
  addTrackAction: (request: { playlistId: string; trackId: string }) =>
    addTrack(request),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, ...props }: { href: string }) => <a href={href} {...props} />,
}));

vi.mock('sonner', () => ({ toast: toasts }));

const TRACK = {
  id: 'track-1',
  title: 'Around the World',
  artist: 'Daft Punk',
  album: 'Homework',
  genre: 'Electronic',
  artworkUrl: null,
  durationMs: 429_000,
  releaseDate: null,
  appleMusicUrl: null,
} satisfies CatalogTrack;

function playlist(id: string, name: string): PlaylistSummary {
  return {
    id,
    name,
    description: null,
    visibility: 'PRIVATE',
    _count: { tracks: 0 },
  };
}

function renderMenu(playlists: PlaylistSummary[]) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <AddToPlaylistMenu track={TRACK} playlists={playlists} />
    </NextIntlClientProvider>,
  );
}

function control() {
  return screen.getByRole('button', {
    name: 'Add Around the World to a playlist',
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  addTrack.mockResolvedValue({ added: true, playlistName: 'Friday afternoon' });
});

describe('AddToPlaylistMenu', () => {
  it('names the track it would add, so a row is never ambiguous', () => {
    renderMenu([playlist('playlist-1', 'Friday afternoon')]);

    expect(control()).toBeInTheDocument();
  });

  it('adds straight away when there is only one playlist to add to', async () => {
    renderMenu([playlist('playlist-1', 'Friday afternoon')]);

    await userEvent.click(control());

    expect(addTrack).toHaveBeenCalledWith({
      playlistId: 'playlist-1',
      trackId: 'track-1',
    });
  });

  it('asks which one when there is a choice to make', async () => {
    renderMenu([
      playlist('playlist-1', 'Friday afternoon'),
      playlist('playlist-2', 'Deep focus'),
    ]);

    await userEvent.click(control());

    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Deep focus' }),
    );

    expect(addTrack).toHaveBeenCalledWith({
      playlistId: 'playlist-2',
      trackId: 'track-1',
    });
  });

  it('offers the way to make one when there is nowhere to add it yet', async () => {
    renderMenu([]);

    await userEvent.click(control());

    expect(
      await screen.findByRole('menuitem', { name: 'New playlist' }),
    ).toHaveAttribute('href', '/playlists');
  });

  it('says where the track went', async () => {
    renderMenu([playlist('playlist-1', 'Friday afternoon')]);

    await userEvent.click(control());

    await waitFor(() =>
      expect(toasts.success).toHaveBeenCalledWith(
        'Around the World was added to Friday afternoon.',
      ),
    );
  });

  it('reports a track that is already there as an answer, not as a failure', async () => {
    addTrack.mockResolvedValue({ added: false, reason: 'duplicate' });

    renderMenu([playlist('playlist-1', 'Friday afternoon')]);

    await userEvent.click(control());

    await waitFor(() =>
      expect(toasts.info).toHaveBeenCalledWith(
        'Around the World is already in this playlist.',
      ),
    );
    expect(toasts.error).not.toHaveBeenCalled();
  });

  it('speaks plainly when the playlist has gone', async () => {
    addTrack.mockResolvedValue({ added: false, reason: 'notFound' });

    renderMenu([playlist('playlist-1', 'Friday afternoon')]);

    await userEvent.click(control());

    await waitFor(() =>
      expect(toasts.error).toHaveBeenCalledWith(
        'That playlist no longer exists.',
      ),
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = renderMenu([
      playlist('playlist-1', 'Friday afternoon'),
      playlist('playlist-2', 'Deep focus'),
    ]);

    expect(await axe(container)).toHaveNoViolations();
  });
});

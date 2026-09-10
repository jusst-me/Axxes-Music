import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AddToPlaylistMenu from '@/components/catalog/AddToPlaylistMenu';
import messages from '@/dictionaries/en.json';
import type { PlaylistSummary } from '@/lib/data/playlists';
import type { CatalogTrack } from '@/lib/data/tracks';
import { axe } from '@/lib/testing/axe';

const addTrack = vi.hoisted(() => vi.fn());
const createPlaylist = vi.hoisted(() => vi.fn());
const toasts = vi.hoisted(() => ({
  success: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
}));

vi.mock('@/lib/playlists/actions', () => ({
  addTrackAction: (request: { playlistId: string; trackId: string }) =>
    addTrack(request),
  createPlaylistAction: (previous: unknown, formData: FormData) =>
    createPlaylist(previous, formData),
}));

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, ...props }: { href: string }) => <a href={href} {...props} />,
  useRouter: () => ({ push: vi.fn() }),
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

function playlist(
  id: string,
  name: string,
  trackIds: string[] = [],
): PlaylistSummary {
  return {
    id,
    name,
    description: null,
    visibility: 'PRIVATE',
    _count: { tracks: trackIds.length },
    tracks: trackIds.map(trackId => ({ trackId })),
  };
}

function renderMenu(playlists: PlaylistSummary[]) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <AddToPlaylistMenu track={TRACK} playlists={playlists} />
    </NextIntlClientProvider>,
  );
}

function control(saved = false) {
  return screen.getByRole('button', {
    name: saved
      ? 'Around the World is in a playlist. Add to another'
      : 'Add Around the World to a playlist',
  });
}

async function open(playlists: PlaylistSummary[]) {
  renderMenu(playlists);
  await userEvent.click(
    control(
      playlists.some(item =>
        item.tracks.some(entry => entry.trackId === TRACK.id),
      ),
    ),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  addTrack.mockResolvedValue({ added: true, playlistName: 'Friday afternoon' });
  createPlaylist.mockResolvedValue({});
});

describe('AddToPlaylistMenu', () => {
  it('names the track it would add, so a row is never ambiguous', () => {
    renderMenu([playlist('playlist-1', 'Friday afternoon')]);

    expect(control()).toBeInTheDocument();
  });

  it('opens a menu even when there is only one playlist, so a new one can still be made', async () => {
    await open([playlist('playlist-1', 'Friday afternoon')]);

    expect(
      await screen.findByRole('menuitem', { name: 'Friday afternoon' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'New playlist' }),
    ).toBeInTheDocument();
    expect(addTrack).not.toHaveBeenCalled();
  });

  it('adds only after a playlist is chosen', async () => {
    await open([
      playlist('playlist-1', 'Friday afternoon'),
      playlist('playlist-2', 'Deep focus'),
    ]);

    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Deep focus' }),
    );

    expect(addTrack).toHaveBeenCalledWith({
      playlistId: 'playlist-2',
      trackId: 'track-1',
    });
  });

  it('marks a playlist that already holds the track', async () => {
    await open([
      playlist('playlist-1', 'Friday afternoon', ['track-1']),
      playlist('playlist-2', 'Deep focus'),
    ]);

    expect(
      await screen.findByRole('menuitem', {
        name: 'Friday afternoon, Added',
      }),
    ).toBeInTheDocument();
  });

  it('shows on the row that the track is already saved', () => {
    renderMenu([playlist('playlist-1', 'Friday afternoon', ['track-1'])]);

    expect(control(true)).toBeInTheDocument();
  });

  it('does not ask the server again for a playlist that already has the track', async () => {
    await open([playlist('playlist-1', 'Friday afternoon', ['track-1'])]);

    await userEvent.click(
      await screen.findByRole('menuitem', {
        name: 'Friday afternoon, Added',
      }),
    );

    expect(addTrack).not.toHaveBeenCalled();
    expect(toasts.info).toHaveBeenCalledWith(
      'Around the World is already in this playlist.',
    );
  });

  it('offers a way to make a playlist from the menu, including when some already exist', async () => {
    await open([playlist('playlist-1', 'Friday afternoon')]);

    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'New playlist' }),
    );

    expect(
      await screen.findByRole('dialog', { name: 'New playlist' }),
    ).toBeInTheDocument();
  });

  it('does not open the form again after the playlist has been made', async () => {
    createPlaylist.mockResolvedValue({
      created: { id: 'playlist-new', name: 'Late night' },
    });
    addTrack.mockResolvedValue({ added: true, playlistName: 'Late night' });

    await open([playlist('playlist-1', 'Friday afternoon')]);
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'New playlist' }),
    );

    const dialog = await screen.findByRole('dialog', { name: 'New playlist' });

    await userEvent.type(within(dialog).getByLabelText('Name'), 'Late night');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Create playlist' }),
    );

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(addTrack).toHaveBeenCalledTimes(1);
    expect(addTrack).toHaveBeenCalledWith({
      playlistId: 'playlist-new',
      trackId: 'track-1',
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('says where the track went and then marks the row as saved', async () => {
    await open([playlist('playlist-1', 'Friday afternoon')]);

    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Friday afternoon' }),
    );

    await waitFor(() =>
      expect(toasts.success).toHaveBeenCalledWith(
        'Around the World was added to Friday afternoon.',
      ),
    );
    expect(control(true)).toBeInTheDocument();
  });

  it('speaks plainly when the playlist has gone', async () => {
    addTrack.mockResolvedValue({ added: false, reason: 'notFound' });

    await open([playlist('playlist-1', 'Friday afternoon')]);

    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Friday afternoon' }),
    );

    await waitFor(() =>
      expect(toasts.error).toHaveBeenCalledWith(
        'That playlist no longer exists.',
      ),
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = renderMenu([
      playlist('playlist-1', 'Friday afternoon', ['track-1']),
      playlist('playlist-2', 'Deep focus'),
    ]);

    expect(await axe(container)).toHaveNoViolations();
  });
});

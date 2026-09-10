import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';

import TrackDetailsDialog from '@/components/catalog/TrackDetailsDialog';
import messages from '@/dictionaries/en.json';
import type { CatalogTrack } from '@/lib/data/tracks';
import { axe } from '@/lib/testing/axe';

// next-intl's client navigation reaches for `next/navigation` and a 'use server' module drags
// Prisma in behind it; neither resolves under Vitest. Adding is covered in
// src/components/catalog/AddToPlaylistMenu.test.tsx.
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, ...props }: { href: string }) => <a href={href} {...props} />,
}));

vi.mock('@/lib/playlists/actions', () => ({ addTrackAction: vi.fn() }));

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

function renderDialog(overrides: Partial<CatalogTrack> = {}) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <TrackDetailsDialog track={track(overrides)} playlists={[]} />
    </NextIntlClientProvider>,
  );
}

function trigger() {
  return screen.getByRole('button', {
    name: 'Around the World, track details',
  });
}

async function open(overrides: Partial<CatalogTrack> = {}) {
  renderDialog(overrides);
  await userEvent.click(trigger());

  return screen.findByRole('dialog');
}

describe('TrackDetailsDialog', () => {
  it('names the track and what pressing it does, in that order', () => {
    renderDialog();

    expect(trigger()).toBeInTheDocument();
  });

  it('keeps the details out of the document until they are asked for', () => {
    renderDialog();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('titles the dialog with the track, so a reader knows what opened', async () => {
    const dialog = await open();

    expect(
      within(dialog).getByRole('heading', { name: 'Around the World' }),
    ).toBeInTheDocument();
    expect(within(dialog).getByText('Daft Punk')).toBeInTheDocument();
  });

  it('shows what the brief asks for: album, genre, release date and duration', async () => {
    const dialog = await open();

    expect(within(dialog).getByText('Homework')).toBeInTheDocument();
    expect(within(dialog).getByText('Electronic')).toBeInTheDocument();
    expect(within(dialog).getByText('20 January 1997')).toBeInTheDocument();
    expect(within(dialog).getByText('7:09')).toBeInTheDocument();
  });

  it('spells the duration out rather than leaving a clock face to be guessed at', async () => {
    const dialog = await open();

    expect(
      within(dialog).getByText('7 minutes and 9 seconds'),
    ).toBeInTheDocument();
  });

  it('links onward to Apple Music', async () => {
    const dialog = await open();

    expect(
      within(dialog).getByRole('link', { name: 'Open in Apple Music' }),
    ).toHaveAttribute(
      'href',
      'https://music.apple.com/album/homework/697194953',
    );
  });

  it('leaves out what the catalog does not know rather than showing a blank', async () => {
    const dialog = await open({ album: null, genre: null, releaseDate: null });

    expect(within(dialog).queryByText('Album')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('Genre')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('Released')).not.toBeInTheDocument();
    expect(within(dialog).getByText('Duration')).toBeInTheDocument();
  });

  it('offers no link when the catalog has no Apple Music address', async () => {
    const dialog = await open({ appleMusicUrl: null });

    expect(
      within(dialog).queryByRole('link', { name: 'Open in Apple Music' }),
    ).not.toBeInTheDocument();
  });

  it('closes on escape and hands focus back to the row that opened it', async () => {
    await open();

    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(trigger()).toHaveFocus();
  });

  it('offers a close control named in the active language', async () => {
    const dialog = await open();

    expect(
      within(dialog).getByRole('button', { name: 'Close' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations once open', async () => {
    await open();

    expect(await axe(document.body)).toHaveNoViolations();
  });
});

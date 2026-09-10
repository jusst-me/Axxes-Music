import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import PlaylistTracks from '@/components/playlists/PlaylistTracks';
import { Button } from '@/components/ui/button';
import { resolveLocale } from '@/i18n/locale';
import { Link } from '@/i18n/navigation';
import { getPlaylist } from '@/lib/data/playlists';
import { localeAlternates } from '@/lib/metadata';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/playlists/[playlistId]'>): Promise<Metadata> {
  const { locale: requested, playlistId } = await params;
  const locale = resolveLocale(requested);
  const playlist = await getPlaylist(playlistId);

  if (!playlist) {
    return {};
  }

  return {
    title: playlist.name,
    description: playlist.description ?? undefined,
    alternates: localeAlternates(locale, `/playlists/${playlistId}`),
  };
}

export default async function PlaylistPage({
  params,
}: PageProps<'/[locale]/playlists/[playlistId]'>) {
  const { playlistId } = await params;
  const playlist = await getPlaylist(playlistId);

  // A playlist belonging to someone else is answered the same way as one that never existed, so a
  // 404 confirms nothing about which identifiers are real.
  if (!playlist) {
    notFound();
  }

  const t = await getTranslations('playlist');

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <Button variant="ghost" size="sm" render={<Link href="/playlists" />}>
        <ArrowLeftIcon aria-hidden />
        {t('backToPlaylists')}
      </Button>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">
        {playlist.name}
      </h1>

      {playlist.description && (
        <p className="text-muted-foreground mt-3 max-w-prose">
          {playlist.description}
        </p>
      )}

      <p className="text-muted-foreground mt-3 text-sm">
        {t('trackCount', { count: playlist.tracks.length })}
        {' · '}
        {t(
          playlist.visibility === 'PUBLIC'
            ? 'visibility.shared'
            : 'visibility.private',
        )}
      </p>

      <PlaylistTracks
        playlistId={playlist.id}
        playlistName={playlist.name}
        entries={playlist.tracks}
      />
    </div>
  );
}

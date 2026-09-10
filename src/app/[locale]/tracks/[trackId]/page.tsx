import { ArrowLeftIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import AddToPlaylistMenu from '@/components/catalog/AddToPlaylistMenu';
import TrackDetails from '@/components/catalog/TrackDetails';
import { Button } from '@/components/ui/button';
import { resolveLocale } from '@/i18n/locale';
import { Link } from '@/i18n/navigation';
import { listPlaylists } from '@/lib/data/playlists';
import { getTrack } from '@/lib/data/tracks';
import { localeAlternates } from '@/lib/metadata';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/tracks/[trackId]'>): Promise<Metadata> {
  const { locale: requested, trackId } = await params;
  const locale = resolveLocale(requested);
  const track = await getTrack(trackId);

  if (!track) {
    return {};
  }

  return {
    title: `${track.title} — ${track.artist}`,
    description: track.album ?? track.artist,
    alternates: localeAlternates(locale, `/tracks/${trackId}`),
  };
}

export default async function TrackPage({
  params,
}: PageProps<'/[locale]/tracks/[trackId]'>) {
  const { trackId } = await params;
  const [track, playlists] = await Promise.all([
    getTrack(trackId),
    listPlaylists(),
  ]);

  if (!track) {
    notFound();
  }

  const t = await getTranslations('catalog');

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Button variant="ghost" size="sm" render={<Link href="/catalog" />}>
        <ArrowLeftIcon aria-hidden />
        {t('backToCatalog')}
      </Button>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">{track.title}</h1>
      <p className="text-muted-foreground mt-2 text-lg">{track.artist}</p>

      <div className="mt-8">
        <TrackDetails track={track} />
      </div>

      <div className="mt-8">
        <AddToPlaylistMenu
          track={track}
          playlists={playlists}
          appearance="labelled"
        />
      </div>
    </div>
  );
}

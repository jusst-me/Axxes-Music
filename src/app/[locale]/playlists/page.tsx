import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import CreatePlaylistDialog from '@/components/playlists/CreatePlaylistDialog';
import PlaylistCard from '@/components/playlists/PlaylistCard';
import { resolveLocale } from '@/i18n/locale';
import { listPlaylists } from '@/lib/data/playlists';
import { localeAlternates } from '@/lib/metadata';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/playlists'>): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'playlist' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: localeAlternates(locale, '/playlists'),
  };
}

export default async function PlaylistsPage() {
  const t = await getTranslations('playlist');
  const playlists = await listPlaylists();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-3 max-w-prose">
            {t('description')}
          </p>
        </div>

        <CreatePlaylistDialog />
      </div>

      {playlists.length === 0 ? (
        <div className="border-border mt-8 rounded-lg border border-dashed px-6 py-12 text-center">
          <h2 className="font-semibold">{t('noPlaylists.title')}</h2>
          <p className="text-muted-foreground mt-2">
            {t('noPlaylists.description')}
          </p>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map(playlist => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </ul>
      )}
    </div>
  );
}

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import TrackList from '@/components/catalog/TrackList';
import TrackListSkeleton from '@/components/catalog/TrackListSkeleton';
import { resolveLocale } from '@/i18n/locale';
import { listTracks } from '@/lib/data/tracks';
import { localeAlternates } from '@/lib/metadata';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/catalog'>): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'catalog' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: localeAlternates(locale, '/catalog'),
  };
}

async function CatalogTracks() {
  const { tracks, hasMore, total } = await listTracks();

  return <TrackList tracks={tracks} hasMore={hasMore} total={total} />;
}

export default async function CatalogPage() {
  const t = await getTranslations('catalog');

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      <p className="text-muted-foreground mt-3 max-w-prose">
        {t('description')}
      </p>

      {/* The heading is on screen while the query runs, rather than the whole page waiting on it. */}
      <Suspense fallback={<TrackListSkeleton />}>
        <CatalogTracks />
      </Suspense>
    </div>
  );
}

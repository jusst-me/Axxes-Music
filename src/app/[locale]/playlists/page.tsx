import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { resolveLocale } from '@/i18n/locale';
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

export default function PlaylistsPage() {
  const t = useTranslations('playlist');

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      <p className="text-muted-foreground mt-3 max-w-prose">
        {t('empty.description')}
      </p>
    </div>
  );
}

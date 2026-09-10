import { useTranslations } from 'next-intl';

export default function CatalogPage() {
  const t = useTranslations('catalog');

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      <p className="text-muted-foreground mt-3 max-w-prose">
        {t('empty.description')}
      </p>
    </div>
  );
}

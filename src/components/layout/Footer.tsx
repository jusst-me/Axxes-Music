import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('common');

  return (
    <footer className="border-border mt-auto border-t">
      <div className="text-muted-foreground mx-auto w-full max-w-6xl px-4 py-6 text-sm sm:px-6">
        {t('appName')}
      </div>
    </footer>
  );
}

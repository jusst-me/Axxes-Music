import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';

import { buttonVariants } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { localeAlternates } from '@/lib/metadata';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params;

  return { alternates: localeAlternates(locale) };
}

export default function Home() {
  const t = useTranslations();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          {t('landing.title')}
        </h1>
        <p className="text-muted-foreground max-w-prose text-lg">
          {t('landing.intro')}
        </p>
        {/* Links rather than buttons: both of these go somewhere, and a link is what announces that. */}
        <div className="flex flex-wrap gap-3">
          <Link href="/register" className={buttonVariants({ size: 'lg' })}>
            {t('landing.createAccount')}
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ size: 'lg', variant: 'outline' })}
          >
            {t('landing.signIn')}
          </Link>
        </div>
      </div>
    </div>
  );
}

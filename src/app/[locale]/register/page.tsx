import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import SignUpForm from '@/components/auth/SignUpForm';
import { resolveLocale } from '@/i18n/locale';
import { Link } from '@/i18n/navigation';
import { localeAlternates } from '@/lib/metadata';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/register'>): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'auth.signUp' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: localeAlternates(locale, '/register'),
  };
}

export default async function RegisterPage({
  params,
}: PageProps<'/[locale]/register'>) {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'auth.signUp' });

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      <p className="text-muted-foreground mt-3">{t('description')}</p>
      <SignUpForm />
      <p className="text-muted-foreground mt-8 text-sm">
        {t('hasAccount')}{' '}
        <Link
          href="/login"
          className="text-foreground font-medium underline underline-offset-4"
        >
          {t('signIn')}
        </Link>
      </p>
    </div>
  );
}

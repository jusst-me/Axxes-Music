import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import SignInForm from '@/components/auth/SignInForm';
import { resolveLocale } from '@/i18n/locale';
import { safeCallbackUrl } from '@/lib/auth/routes';
import { localeAlternates } from '@/lib/metadata';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/login'>): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const t = await getTranslations({ locale, namespace: 'auth.signIn' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: localeAlternates(locale, '/login'),
  };
}

export default async function LoginPage({
  params,
  searchParams,
}: PageProps<'/[locale]/login'>) {
  const locale = resolveLocale((await params).locale);
  const { callbackUrl } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'auth.signIn' });

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
      <p className="text-muted-foreground mt-3">{t('description')}</p>
      <SignInForm
        callbackUrl={safeCallbackUrl(
          typeof callbackUrl === 'string' ? callbackUrl : null,
          locale,
        )}
      />
    </div>
  );
}

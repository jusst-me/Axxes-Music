import '@/app/globals.css';

import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';

import { LOCALES } from '@/constants/locales';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Axxes Music',
  description:
    'Browse a music catalog, build playlists together, and listen to previews.',
};

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={LOCALES[locale]}
      className={cn('h-full antialiased', montserrat.variable)}
    >
      <body className="flex min-h-full flex-col font-sans">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}

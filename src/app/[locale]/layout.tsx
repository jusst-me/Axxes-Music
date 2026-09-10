import '@/app/globals.css';

import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';

import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import SkipLink, { MAIN_CONTENT_ID } from '@/components/layout/SkipLink';
import ThemeProvider from '@/components/layout/ThemeProvider';
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
    // next-themes sets the class on <html> before paint, which React would otherwise flag as a mismatch.
    <html
      lang={LOCALES[locale]}
      className={cn('h-full antialiased', montserrat.variable)}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col font-sans">
        <NextIntlClientProvider>
          <ThemeProvider>
            <SkipLink />
            <Header />
            <main
              id={MAIN_CONTENT_ID}
              tabIndex={-1}
              className="flex flex-1 flex-col"
            >
              {children}
            </main>
            <Footer />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

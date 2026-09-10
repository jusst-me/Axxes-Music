import './globals.css';

import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';

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

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={cn('h-full antialiased', montserrat.variable)}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}

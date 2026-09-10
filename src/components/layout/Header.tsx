import { getTranslations } from 'next-intl/server';

import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import MainNav from '@/components/layout/MainNav';
import ThemeToggle from '@/components/layout/ThemeToggle';
import UserMenu from '@/components/layout/UserMenu';
import { Link } from '@/i18n/navigation';
import { auth } from '@/lib/auth/auth';

export default async function Header() {
  const t = await getTranslations('common');
  const session = await auth();

  return (
    <header className="bg-background/85 border-border sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-1 px-4 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="text-primary flex min-h-11 items-center rounded-md pr-2 text-sm font-bold tracking-widest uppercase"
        >
          {t('appName')}
        </Link>
        {/* The catalog and the playlists need a session, so they are not offered before there is one. */}
        {session?.user && <MainNav />}
        <div className="ml-auto flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          {session?.user?.name && session.user.email && (
            <UserMenu name={session.user.name} email={session.user.email} />
          )}
        </div>
      </div>
    </header>
  );
}

import { useTranslations } from 'next-intl';

import LanguageSwitcher from '@/components/layout/LanguageSwitcher';
import MainNav from '@/components/layout/MainNav';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { Link } from '@/i18n/navigation';

export default function Header() {
  const t = useTranslations('common');

  return (
    <header className="bg-background/85 border-border sticky top-0 z-40 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-1 px-4 sm:gap-4 sm:px-6">
        <Link
          href="/"
          className="text-primary flex min-h-11 items-center rounded-md pr-2 text-sm font-bold tracking-widest uppercase"
        >
          {t('appName')}
        </Link>
        <MainNav />
        <div className="ml-auto flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

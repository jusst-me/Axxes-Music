'use client';

import { useTranslations } from 'next-intl';

import { NAV_ITEMS } from '@/constants/navigation';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export default function MainNav() {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <nav aria-label={t('a11y.mainNavigation')}>
      <ul className="flex items-center">
        {NAV_ITEMS.map(item => {
          const isCurrent =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isCurrent ? 'page' : undefined}
                className={cn(
                  'relative flex min-h-11 items-center rounded-md px-2 text-sm font-medium transition-colors sm:px-3',
                  // The underline carries the same meaning as the color change, which on its own
                  // would leave the current page indistinguishable to anyone who cannot see it.
                  isCurrent
                    ? 'text-foreground after:bg-primary after:absolute after:inset-x-2 after:bottom-2 after:h-0.5 after:rounded-full sm:after:inset-x-3'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t(item.label)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

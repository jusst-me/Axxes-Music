'use client';

import { GlobeIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Locale, LOCALE_NAMES, LOCALES } from '@/constants/locales';
import { usePathname, useRouter } from '@/i18n/navigation';

export default function LanguageSwitcher() {
  const t = useTranslations('a11y');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function selectLocale(value: string) {
    // usePathname strips the locale prefix, so replacing it keeps the visitor on the same page.
    startTransition(() =>
      router.replace(pathname, { locale: value as Locale }),
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t('languageSwitcher', { language: LOCALE_NAMES[locale] })}
        disabled={isPending}
        className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors sm:px-3"
      >
        <GlobeIcon aria-hidden className="size-4" />
        <span className="sr-only sm:not-sr-only">{LOCALE_NAMES[locale]}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-40">
        <DropdownMenuRadioGroup value={locale} onValueChange={selectLocale}>
          {Object.entries(LOCALE_NAMES).map(([value, name]) => (
            <DropdownMenuRadioItem
              key={value}
              value={value}
              lang={LOCALES[value as Locale]}
            >
              {name}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

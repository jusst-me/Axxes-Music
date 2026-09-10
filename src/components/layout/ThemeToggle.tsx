'use client';

import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const THEMES = [
  { value: 'light', Icon: SunIcon },
  { value: 'dark', Icon: MoonIcon },
  { value: 'system', Icon: MonitorIcon },
] as const;

type ThemeValue = (typeof THEMES)[number]['value'];

const noopSubscribe = () => () => {};

/** False while rendering on the server and during the first client render, true from then on. */
function useIsHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export default function ThemeToggle() {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();
  /**
   * The chosen theme lives in localStorage, so the server cannot know it. Rendering the icon and the
   * accessible name only once hydrated keeps the markup identical on both sides; the button reserves
   * its space in the meantime so the header does not shift.
   */
  const isHydrated = useIsHydrated();

  const current = THEMES.find(option => option.value === theme) ?? THEMES[2];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={
          isHydrated
            ? t('a11y.themeSwitcher', {
                theme: t(`common.theme.${current.value}`),
              })
            : t('a11y.theme')
        }
        className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex size-11 items-center justify-center rounded-md transition-colors"
      >
        {isHydrated && <current.Icon aria-hidden className="size-4" />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-40">
        <DropdownMenuRadioGroup
          value={current.value}
          onValueChange={value => setTheme(value as ThemeValue)}
        >
          {THEMES.map(({ value, Icon }) => (
            <DropdownMenuRadioItem key={value} value={value}>
              <Icon aria-hidden className="size-4" />
              {t(`common.theme.${value}`)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

'use client';

import { LogOutIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOutAction } from '@/lib/auth/actions';

/** First letter of the name, which is enough to tell one colleague from another at this size. */
function initial(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

export default function UserMenu({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const t = useTranslations('auth');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t('userMenu')}
        className="bg-primary text-primary-foreground hover:bg-primary/90 flex size-11 items-center justify-center rounded-full text-sm font-semibold transition-colors"
      >
        <span aria-hidden>{initial(name)}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-muted-foreground text-xs">{email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => void signOutAction()}>
          <LogOutIcon aria-hidden className="size-4" />
          {t('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

'use client';

import { SearchIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PlaylistSearchProps = {
  query: string;
  onQueryChange: (query: string) => void;
};

export default function PlaylistSearch({
  query,
  onQueryChange,
}: PlaylistSearchProps) {
  const t = useTranslations('playlist.search');
  const id = useId();
  const input = useRef<HTMLInputElement>(null);

  function clear() {
    onQueryChange('');
    input.current?.focus();
  }

  return (
    <form
      role="search"
      className="mt-8 max-w-md"
      onSubmit={event => event.preventDefault()}
    >
      <Label htmlFor={id}>{t('label')}</Label>

      <div className="relative mt-2">
        <SearchIcon
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
        />
        <Input
          ref={input}
          id={id}
          type="search"
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          placeholder={t('placeholder')}
          autoComplete="off"
          className="h-10 pr-11 pl-8 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={t('clear')}
            onClick={clear}
            className="absolute top-1/2 right-1 -translate-y-1/2"
          >
            <XIcon aria-hidden />
          </Button>
        )}
      </div>
    </form>
  );
}

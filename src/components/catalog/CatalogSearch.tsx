'use client';

import { SearchIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePathname, useRouter } from '@/i18n/navigation';

/** Long enough that a typist is not chased by a request per keystroke, short enough to feel immediate. */
const DEBOUNCE_MS = 300;

export default function CatalogSearch({ query }: { query: string }) {
  const t = useTranslations('catalog.search');
  const router = useRouter();
  const pathname = usePathname();
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [value, setValue] = useState(query);
  const [urlQuery, setUrlQuery] = useState(query);

  useEffect(() => () => clearTimeout(debounce.current), []);

  /*
   * The URL leads and the field follows, so a shared link, the back button and the clear control in
   * the empty state all arrive here. Keystrokes still waiting on the debounce are the exception: the
   * URL is a word behind at that point, and adopting it would take characters back out of the field.
   */
  if (query !== urlQuery) {
    setUrlQuery(query);

    if (debounce.current === undefined) {
      setValue(query);
    }
  }

  function search(next: string) {
    clearTimeout(debounce.current);
    debounce.current = undefined;

    // Replacing rather than pushing: a history entry per keystroke would make the back button useless,
    // while the search itself still survives leaving the page and coming back to it.
    router.replace(
      { pathname, query: next ? { q: next } : {} },
      { scroll: false },
    );
  }

  function handleChange(next: string) {
    setValue(next);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(next.trim()), DEBOUNCE_MS);
  }

  function clear() {
    setValue('');
    search('');
    input.current?.focus();
  }

  return (
    <form
      role="search"
      className="mt-8 max-w-md"
      onSubmit={event => {
        event.preventDefault();
        search(value.trim());
      }}
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
          value={value}
          onChange={event => handleChange(event.target.value)}
          placeholder={t('placeholder')}
          autoComplete="off"
          // The native clear affordance of a search field has no accessible name and no tab stop, so
          // it is hidden in favour of the button beside it.
          className="h-10 pr-11 pl-8 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {value && (
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

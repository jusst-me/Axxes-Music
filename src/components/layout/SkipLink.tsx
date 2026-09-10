import { useTranslations } from 'next-intl';

/** Target of this link; the layout puts it on the main landmark. */
export const MAIN_CONTENT_ID = 'main-content';

export default function SkipLink() {
  const t = useTranslations('a11y');

  return (
    <a
      href={`#${MAIN_CONTENT_ID}`}
      className="bg-background text-foreground border-border sr-only rounded-md border px-4 py-3 text-sm font-medium shadow-lg focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-50"
    >
      {t('skipToContent')}
    </a>
  );
}

import { useTranslations } from 'next-intl';

import { Skeleton } from '@/components/ui/skeleton';

const PLACEHOLDER_ROWS = 8;

/** Mirrors the shape of a row, so the page does not jump once the tracks arrive. */
export default function TrackListSkeleton() {
  const t = useTranslations('a11y');

  return (
    <div
      role="status"
      aria-label={t('loading')}
      className="divide-border border-border mt-8 divide-y rounded-lg border"
    >
      {Array.from({ length: PLACEHOLDER_ROWS }, (_, index) => (
        <div key={index} className="flex items-center gap-4 px-4 py-3">
          <Skeleton className="size-14 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-4 w-10 shrink-0" />
        </div>
      ))}
    </div>
  );
}

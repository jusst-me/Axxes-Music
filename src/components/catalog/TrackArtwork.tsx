import { DiscIcon } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

/** A row wants a thumbnail and the detail view wants the cover; nothing in between is needed. */
const SIZES = {
  row: { pixels: 56, box: 'size-14', icon: 'size-6' },
  detail: { pixels: 224, box: 'size-56', icon: 'size-16' },
} as const;

type TrackArtworkProps = {
  src: string | null;
  size?: keyof typeof SIZES;
};

/**
 * Cover art, or a stand-in when the catalog has none.
 *
 * The artwork says nothing the title and artist beside it do not already say, so it is decorative and
 * carries an empty alt. The placeholder is not: a listener should be able to tell that this track has
 * no cover rather than be left wondering whether an image failed to load.
 */
export default function TrackArtwork({ src, size = 'row' }: TrackArtworkProps) {
  const t = useTranslations('catalog.track');
  const { pixels, box, icon } = SIZES[size];

  if (!src) {
    return (
      <div
        role="img"
        aria-label={t('noArtwork')}
        className={cn(
          'bg-muted text-muted-foreground flex shrink-0 items-center justify-center rounded-md',
          box,
        )}
      >
        <DiscIcon aria-hidden className={icon} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt=""
      width={pixels}
      height={pixels}
      className={cn('bg-muted shrink-0 rounded-md object-cover', box)}
    />
  );
}

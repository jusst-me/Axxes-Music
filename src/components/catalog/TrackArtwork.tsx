import { DiscIcon } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

const SIZE = 56;

/**
 * Cover art, or a stand-in when the catalog has none.
 *
 * The artwork says nothing the title and artist beside it do not already say, so it is decorative and
 * carries an empty alt. The placeholder is not: a listener should be able to tell that this track has
 * no cover rather than be left wondering whether an image failed to load.
 */
export default function TrackArtwork({ src }: { src: string | null }) {
  const t = useTranslations('catalog.track');

  if (!src) {
    return (
      <div
        role="img"
        aria-label={t('noArtwork')}
        className="bg-muted text-muted-foreground flex size-14 shrink-0 items-center justify-center rounded-md"
      >
        <DiscIcon aria-hidden className="size-6" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt=""
      width={SIZE}
      height={SIZE}
      className="bg-muted size-14 shrink-0 rounded-md object-cover"
    />
  );
}

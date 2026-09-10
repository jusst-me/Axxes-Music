import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import type { PlaylistSummary } from '@/lib/data/playlists';

export default function PlaylistCard({
  playlist,
}: {
  playlist: PlaylistSummary;
}) {
  const t = useTranslations('playlist');

  return (
    <li className="border-border rounded-lg border">
      {/*
       * The whole card is the link rather than the name alone: a card-sized target is easier to hit,
       * and it leaves one tab stop per playlist instead of one per thing written on it.
       */}
      <Link
        href={`/playlists/${playlist.id}`}
        className="focus-visible:ring-ring/50 hover:bg-muted/50 flex h-full flex-col rounded-lg p-5 transition-colors focus-visible:ring-3 focus-visible:outline-none"
      >
        <h2 className="font-semibold">{playlist.name}</h2>

        {playlist.description && (
          <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
            {playlist.description}
          </p>
        )}

        <p className="text-muted-foreground mt-auto pt-4 text-sm">
          {t('trackCount', { count: playlist._count.tracks })}
          {' · '}
          {t(
            playlist.visibility === 'PUBLIC'
              ? 'visibility.shared'
              : 'visibility.private',
          )}
        </p>
      </Link>
    </li>
  );
}

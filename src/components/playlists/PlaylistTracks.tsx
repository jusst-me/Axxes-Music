'use client';

import { useTranslations } from 'next-intl';

import PlaylistTrackRow from '@/components/playlists/PlaylistTrackRow';
import type { PlaylistEntry } from '@/lib/data/playlists';

type PlaylistTracksProps = {
  entries: PlaylistEntry[];
};

export default function PlaylistTracks({ entries }: PlaylistTracksProps) {
  const t = useTranslations('playlist');

  if (entries.length === 0) {
    return (
      <div className="border-border mt-8 rounded-lg border border-dashed px-6 py-12 text-center">
        <h2 className="font-semibold">{t('empty.title')}</h2>
        <p className="text-muted-foreground mt-2">{t('empty.description')}</p>
      </div>
    );
  }

  return (
    <ul className="divide-border border-border mt-8 divide-y rounded-lg border">
      {entries.map(entry => (
        <PlaylistTrackRow key={entry.id} entry={entry} />
      ))}
    </ul>
  );
}

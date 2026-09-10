'use client';

import { PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import TextField from '@/components/forms/TextField';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FieldGroup } from '@/components/ui/field';
import { useRouter } from '@/i18n/navigation';
import {
  createPlaylistAction,
  type CreatePlaylistState,
} from '@/lib/playlists/actions';
import {
  PLAYLIST_DESCRIPTION_MAX_LENGTH,
  PLAYLIST_NAME_MAX_LENGTH,
} from '@/lib/playlists/schemas';

const NOTHING_SUBMITTED: CreatePlaylistState = {};

type CreatePlaylistDialogProps = {
  /**
   * When set, the dialog is opened from elsewhere (the add-to-playlist menu) and has no trigger of
   * its own. The playlists page leaves this unset and shows the "New playlist" button.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * The catalog stays where it is and adds the track it was holding. The playlists page leaves this
   * unset and walks over to the new playlist instead.
   */
  onCreated?: (playlist: { id: string; name: string }) => void;
};

export default function CreatePlaylistDialog({
  open: openProp,
  onOpenChange,
  onCreated,
}: CreatePlaylistDialogProps = {}) {
  const t = useTranslations('playlist');
  const common = useTranslations('common');
  const message = useTranslations('playlist.errors');
  const router = useRouter();
  const [requested, setRequested] = useState(false);
  const [state, submit, isPending] = useActionState(
    createPlaylistAction,
    NOTHING_SUBMITTED,
  );
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const { name, description } = state.errors ?? {};
  const { created } = state;
  const setOpen = onOpenChange ?? setRequested;
  const requestedOpen = openProp ?? requested;
  const handled = useRef<string | null>(null);
  const onCreatedRef = useRef(onCreated);

  // On the playlists page the dialog closes itself once the playlist exists, so it cannot return
  // over the page that is about to replace it. From the catalog the parent owns the open state:
  // deriving it here from `created` closed the dialog while the parent still thought it was open,
  // and the next render remounted a fresh form on top of that.
  const open = onCreated ? requestedOpen : requestedOpen && !created;

  useEffect(() => {
    onCreatedRef.current = onCreated;
  }, [onCreated]);

  useEffect(() => {
    if (name) {
      nameRef.current?.focus();
    } else if (description) {
      descriptionRef.current?.focus();
    }
  }, [name, description]);

  useEffect(() => {
    if (!created || handled.current === created.id) {
      return;
    }

    handled.current = created.id;

    if (onCreatedRef.current) {
      onCreatedRef.current(created);
      return;
    }

    // The playlist itself is the confirmation, and the message says which one was made, because by
    // the time it is read the form that named it is gone.
    toast.success(t('created', { name: created.name }));
    router.push(`/playlists/${created.id}`);
  }, [created, router, t]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {openProp === undefined && (
        <DialogTrigger render={<Button />}>
          <PlusIcon aria-hidden />
          {t('create')}
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg">
            {t('createDialog.title')}
          </DialogTitle>
          <DialogDescription>{t('createDialog.description')}</DialogDescription>
        </DialogHeader>

        <form action={submit} noValidate>
          <FieldGroup>
            {/*
             * React empties an uncontrolled form once the action settles, so a rejected attempt would
             * cost what was typed. Handing the values back as defaults restores them, and the key
             * makes each attempt a freshly initialised field rather than one whose default changed
             * underneath Base UI.
             */}
            <TextField
              key={`name-${state.values?.name ?? ''}`}
              ref={nameRef}
              id="playlist-name"
              name="name"
              required
              maxLength={PLAYLIST_NAME_MAX_LENGTH}
              label={t('fields.name')}
              description={t('fields.nameHint')}
              error={name && message(name)}
              defaultValue={state.values?.name}
            />

            <TextField
              key={`description-${state.values?.description ?? ''}`}
              multiline
              ref={descriptionRef}
              id="playlist-description"
              name="description"
              rows={3}
              maxLength={PLAYLIST_DESCRIPTION_MAX_LENGTH}
              label={t('fields.description')}
              description={t('fields.descriptionOptional')}
              error={description && message(description)}
              defaultValue={state.values?.description}
            />
          </FieldGroup>

          <DialogFooter className="mt-7">
            <DialogClose render={<Button type="button" variant="outline" />}>
              {common('cancel')}
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? t('createDialog.pending') : t('createDialog.submit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

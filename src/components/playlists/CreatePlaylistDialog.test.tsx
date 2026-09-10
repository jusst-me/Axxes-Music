import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CreatePlaylistDialog from '@/components/playlists/CreatePlaylistDialog';
import messages from '@/dictionaries/en.json';
import type { CreatePlaylistState } from '@/lib/playlists/actions';
import { axe } from '@/lib/testing/axe';

const action = vi.hoisted(() => vi.fn());
const push = vi.hoisted(() => vi.fn());
const success = vi.hoisted(() => vi.fn());

vi.mock('@/lib/playlists/actions', () => ({
  createPlaylistAction: (previous: CreatePlaylistState, formData: FormData) =>
    action(previous, formData),
}));

vi.mock('@/i18n/navigation', () => ({ useRouter: () => ({ push }) }));

vi.mock('sonner', () => ({ toast: { success } }));

function renderDialog() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <CreatePlaylistDialog />
    </NextIntlClientProvider>,
  );
}

async function open() {
  renderDialog();
  await userEvent.click(screen.getByRole('button', { name: 'New playlist' }));

  return screen.findByRole('dialog');
}

async function submit(state: CreatePlaylistState) {
  action.mockResolvedValue(state);

  await userEvent.click(
    screen.getByRole('button', { name: 'Create playlist' }),
  );
}

beforeEach(() => {
  action.mockReset();
  action.mockResolvedValue({});
  push.mockReset();
  success.mockReset();
});

describe('CreatePlaylistDialog', () => {
  it('keeps the form out of the way until a playlist is wanted', () => {
    renderDialog();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('asks for a name and offers a description alongside it', async () => {
    await open();

    expect(screen.getByLabelText('Name')).toBeRequired();
    expect(screen.getByLabelText('Description')).toHaveAccessibleDescription(
      'Optional.',
    );
  });

  it('states the length limit before the field rather than after a rejection', async () => {
    await open();

    expect(screen.getByLabelText('Name')).toHaveAccessibleDescription(
      'Up to 100 characters.',
    );
  });

  it('reports a missing name on the field itself', async () => {
    await open();

    await submit({ errors: { name: 'nameRequired' } });

    const name = await screen.findByLabelText('Name');

    await waitFor(() => expect(name).toHaveFocus());
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription(
      'Up to 100 characters. Give the playlist a name.',
    );
  });

  it('does not make the visitor type everything again after a rejection', async () => {
    await open();

    await submit({
      errors: { description: 'descriptionTooLong' },
      values: { name: 'Friday afternoon', description: 'Far too long' },
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Name')).toHaveValue('Friday afternoon'),
    );
    expect(screen.getByLabelText('Description')).toHaveValue('Far too long');
  });

  it('says which playlist was made and opens it', async () => {
    await open();

    await submit({ created: { id: 'playlist-1', name: 'Friday afternoon' } });

    await waitFor(() =>
      expect(success).toHaveBeenCalledWith('Friday afternoon was created.'),
    );
    expect(push).toHaveBeenCalledWith('/playlists/playlist-1');
  });

  it('closes itself once the playlist exists', async () => {
    await open();

    await submit({ created: { id: 'playlist-1', name: 'Friday afternoon' } });

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('leaves the form open and untouched when the attempt was rejected', async () => {
    await open();

    await submit({ errors: { name: 'nameRequired' } });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('has no accessibility violations, including while showing an error', async () => {
    await open();

    await submit({ errors: { name: 'nameRequired' } });
    await screen.findByRole('alert');

    expect(await axe(document.body)).toHaveNoViolations();
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SignUpForm from '@/components/auth/SignUpForm';
import messages from '@/dictionaries/en.json';
import type { SignUpState } from '@/lib/auth/actions';
import { axe } from '@/lib/testing/axe';

const action = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth/actions', () => ({
  signUpAction: (previous: SignUpState, formData: FormData) =>
    action(previous, formData),
}));

function renderForm() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SignUpForm />
    </NextIntlClientProvider>,
  );
}

async function submit(state: SignUpState) {
  action.mockResolvedValue(state);

  await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
}

beforeEach(() => {
  action.mockReset();
  action.mockResolvedValue({});
});

describe('SignUpForm', () => {
  it('states the password requirement before the field rather than after a rejection', () => {
    renderForm();

    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
      'At least 12 characters.',
    );
  });

  it('asks a password manager for a new password rather than a stored one', () => {
    renderForm();

    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'autocomplete',
      'new-password',
    );
  });

  it('reports a taken email address on the field itself', async () => {
    renderForm();

    await submit({ errors: { email: 'emailTaken' } });

    const email = await screen.findByLabelText('Email address');

    await waitFor(() => expect(email).toHaveFocus());
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription(
      'An account with this email address already exists.',
    );
  });

  it('keeps the requirement readable next to the error that follows from it', async () => {
    renderForm();

    await submit({ errors: { password: 'passwordTooShort' } });

    await screen.findByText('Use at least 12 characters.');

    expect(screen.getByLabelText('Password')).toHaveAccessibleDescription(
      'At least 12 characters. Use at least 12 characters.',
    );
  });

  it('does not make the visitor type everything again after a rejection', async () => {
    renderForm();

    await userEvent.type(screen.getByLabelText('Name'), 'Ada');
    await userEvent.type(
      screen.getByLabelText('Email address'),
      'ada@example.com',
    );
    await userEvent.type(
      screen.getByLabelText('Password'),
      'correct horse battery',
    );

    await submit({
      errors: { email: 'emailTaken' },
      values: { name: 'Ada', email: 'ada@example.com' },
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Name')).toHaveValue('Ada'),
    );
    expect(screen.getByLabelText('Email address')).toHaveValue(
      'ada@example.com',
    );
    // The password is the one thing that should not come back from the server.
    expect(screen.getByLabelText('Password')).toHaveValue('');
  });

  it('moves focus to the first field that is wrong', async () => {
    renderForm();

    await submit({ errors: { name: 'nameRequired', email: 'emailInvalid' } });

    await waitFor(() => expect(screen.getByLabelText('Name')).toHaveFocus());
  });

  it('has no accessibility violations, including while showing an error', async () => {
    const { container } = renderForm();

    await submit({ errors: { email: 'emailTaken' } });
    await screen.findByRole('alert');

    expect(await axe(container)).toHaveNoViolations();
  });
});

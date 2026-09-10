import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import SignInForm from '@/components/auth/SignInForm';
import messages from '@/dictionaries/en.json';
import type { SignInState } from '@/lib/auth/actions';
import { axe } from '@/lib/testing/axe';

const action = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth/actions', () => ({
  signInAction: (previous: SignInState, formData: FormData) =>
    action(previous, formData),
}));

function renderForm() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SignInForm callbackUrl="/en/playlists" />
    </NextIntlClientProvider>,
  );
}

async function submit(state: SignInState) {
  action.mockResolvedValue(state);

  await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
}

beforeEach(() => {
  action.mockReset();
  action.mockResolvedValue({});
});

describe('SignInForm', () => {
  it('labels both fields and lets a password manager fill them', () => {
    renderForm();

    expect(screen.getByLabelText('Email address')).toHaveAttribute(
      'autocomplete',
      'email',
    );
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'autocomplete',
      'current-password',
    );
  });

  it('sends the page the visitor was after along with the credentials', async () => {
    renderForm();

    await userEvent.type(
      screen.getByLabelText('Email address'),
      'ada@example.com',
    );
    await userEvent.type(
      screen.getByLabelText('Password'),
      'correct horse battery',
    );
    await submit({});

    await waitFor(() => expect(action).toHaveBeenCalled());

    const formData = action.mock.calls[0][1] as FormData;

    expect(Object.fromEntries(formData)).toEqual({
      email: 'ada@example.com',
      password: 'correct horse battery',
      callbackUrl: '/en/playlists',
    });
  });

  it('keeps the email address on screen after a rejected attempt', async () => {
    renderForm();

    await userEvent.type(
      screen.getByLabelText('Email address'),
      'ada@example.com',
    );
    await userEvent.type(screen.getByLabelText('Password'), 'wrong');

    await submit({
      errors: { form: 'invalidCredentials' },
      values: { email: 'ada@example.com' },
    });

    await waitFor(() =>
      expect(screen.getByLabelText('Email address')).toHaveValue(
        'ada@example.com',
      ),
    );
    expect(screen.getByLabelText('Password')).toHaveValue('');
  });

  it('describes an invalid field and moves focus to it', async () => {
    renderForm();

    await submit({ errors: { email: 'emailInvalid' } });

    const email = await screen.findByLabelText('Email address');

    await waitFor(() => expect(email).toHaveFocus());
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Enter a valid email address.');
  });

  it('reports a rejected attempt without saying which half was wrong', async () => {
    renderForm();

    await submit({ errors: { form: 'invalidCredentials' } });

    const alert = await screen.findByRole('alert');

    expect(alert).toHaveTextContent(
      'That email address and password do not match an account.',
    );
    await waitFor(() => expect(alert).toHaveFocus());
  });

  it('has no accessibility violations, including while showing an error', async () => {
    const { container } = renderForm();

    await submit({ errors: { password: 'passwordRequired' } });
    await screen.findByRole('alert');

    expect(await axe(container)).toHaveNoViolations();
  });
});

'use client';

import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { signInAction, type SignInState } from '@/lib/auth/actions';

const NO_ERRORS: SignInState = {};

export default function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const t = useTranslations('auth');
  const message = useTranslations('auth.errors');
  const [state, submit, isPending] = useActionState(signInAction, NO_ERRORS);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const { email, password, form } = state.errors ?? {};

  useEffect(() => {
    // Someone who cannot see the page needs to land on the problem rather than go looking for it.
    if (email) {
      emailRef.current?.focus();
    } else if (password) {
      passwordRef.current?.focus();
    } else if (form) {
      summaryRef.current?.focus();
    }
  }, [email, password, form]);

  return (
    /*
     * Validation is ours rather than the browser's: a built-in message arrives in the language of the
     * browser, which on this site is regularly not the language of the page.
     */
    <form action={submit} noValidate className="mt-8">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <FieldGroup>
        {form && (
          <div
            ref={summaryRef}
            role="alert"
            tabIndex={-1}
            className="border-destructive/40 text-destructive rounded-md border px-4 py-3 text-sm"
          >
            {message(form)}
          </div>
        )}

        <Field data-invalid={Boolean(email)}>
          <FieldLabel htmlFor="email">{t('fields.email')}</FieldLabel>
          <Input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(email) || undefined}
            aria-describedby={email ? 'email-error' : undefined}
          />
          {email && <FieldError id="email-error">{message(email)}</FieldError>}
        </Field>

        <Field data-invalid={Boolean(password)}>
          <FieldLabel htmlFor="password">{t('fields.password')}</FieldLabel>
          <Input
            ref={passwordRef}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={Boolean(password) || undefined}
            aria-describedby={password ? 'password-error' : undefined}
          />
          {password && (
            <FieldError id="password-error">{message(password)}</FieldError>
          )}
        </Field>

        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? t('signIn.pending') : t('signIn.submit')}
        </Button>
      </FieldGroup>
    </form>
  );
}

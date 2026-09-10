'use client';

import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef } from 'react';

import AuthField from '@/components/auth/AuthField';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
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

        {/*
         * React empties an uncontrolled form once the action settles, so a rejected attempt would cost
         * the visitor the address they had typed. Handing it back as a default restores it, and the
         * key makes each attempt a freshly initialised field rather than one whose default changed
         * underneath Base UI.
         */}
        <AuthField
          key={state.values?.email ?? ''}
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          label={t('fields.email')}
          error={email && message(email)}
          defaultValue={state.values?.email}
        />

        <AuthField
          ref={passwordRef}
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          label={t('fields.password')}
          error={password && message(password)}
        />

        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? t('signIn.pending') : t('signIn.submit')}
        </Button>
      </FieldGroup>
    </form>
  );
}

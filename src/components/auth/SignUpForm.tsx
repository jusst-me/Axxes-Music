'use client';

import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef } from 'react';

import TextField from '@/components/forms/TextField';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { signUpAction, type SignUpState } from '@/lib/auth/actions';

const NO_ERRORS: SignUpState = {};

export default function SignUpForm() {
  const t = useTranslations('auth');
  const message = useTranslations('auth.errors');
  const [state, submit, isPending] = useActionState(signUpAction, NO_ERRORS);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const { name, email, password } = state.errors ?? {};

  useEffect(() => {
    if (name) {
      nameRef.current?.focus();
    } else if (email) {
      emailRef.current?.focus();
    } else if (password) {
      passwordRef.current?.focus();
    }
  }, [name, email, password]);

  return (
    <form action={submit} noValidate className="mt-8">
      <FieldGroup>
        {/*
         * React empties an uncontrolled form once the action settles, so a rejected attempt would cost
         * the visitor everything they had typed. Handing the values back as defaults restores them,
         * and the key makes each attempt a freshly initialised field rather than one whose default
         * changed underneath Base UI.
         */}
        <TextField
          key={`name-${state.values?.name ?? ''}`}
          ref={nameRef}
          id="name"
          name="name"
          autoComplete="name"
          required
          label={t('fields.name')}
          error={name && message(name)}
          defaultValue={state.values?.name}
        />

        <TextField
          key={`email-${state.values?.email ?? ''}`}
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

        <TextField
          ref={passwordRef}
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          label={t('fields.password')}
          description={t('fields.passwordHint')}
          error={password && message(password)}
        />

        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? t('signUp.pending') : t('signUp.submit')}
        </Button>
      </FieldGroup>
    </form>
  );
}

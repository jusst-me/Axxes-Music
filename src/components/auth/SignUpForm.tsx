'use client';

import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useRef } from 'react';

import AuthField from '@/components/auth/AuthField';
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
        <AuthField
          ref={nameRef}
          id="name"
          name="name"
          autoComplete="name"
          required
          label={t('fields.name')}
          error={name && message(name)}
        />

        <AuthField
          ref={emailRef}
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          label={t('fields.email')}
          error={email && message(email)}
        />

        <AuthField
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

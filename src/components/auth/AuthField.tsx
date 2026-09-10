import type { ComponentProps } from 'react';

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

type AuthFieldProps = ComponentProps<typeof Input> & {
  id: string;
  label: string;
  /** Stated before the field, so a requirement is known in advance rather than after a rejection. */
  description?: string;
  error?: string;
};

export default function AuthField({
  id,
  label,
  description,
  error,
  ...props
}: AuthFieldProps) {
  const describedBy = [
    description && `${id}-description`,
    error && `${id}-error`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {description && (
        <FieldDescription id={`${id}-description`}>
          {description}
        </FieldDescription>
      )}
      <Input
        id={id}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy || undefined}
        {...props}
      />
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  );
}

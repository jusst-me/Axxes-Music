import type { ComponentProps } from 'react';

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Shell = {
  id: string;
  label: string;
  /** Stated before the field, so a requirement is known in advance rather than after a rejection. */
  description?: string;
  error?: string;
};

/** `multiline` swaps the single line for a box, for copy that is written rather than filled in. */
type TextFieldProps =
  | (Shell & { multiline: true } & ComponentProps<'textarea'>)
  | (Shell & { multiline?: false } & ComponentProps<'input'>);

export default function TextField(props: TextFieldProps) {
  const { id, label, description, error } = props;

  const describedBy = [
    description && `${id}-description`,
    error && `${id}-error`,
  ]
    .filter(Boolean)
    .join(' ');

  const shared = {
    id,
    'aria-invalid': Boolean(error) || undefined,
    'aria-describedby': describedBy || undefined,
  };

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {description && (
        <FieldDescription id={`${id}-description`}>
          {description}
        </FieldDescription>
      )}

      {props.multiline ? (
        <Textarea {...shared} {...rest(props)} />
      ) : (
        <Input {...shared} {...rest(props)} />
      )}

      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  );
}

/** The shell above consumes these four; everything else is what configures the control itself. */
function rest<T extends TextFieldProps>(props: T) {
  const {
    label: _label,
    description: _description,
    error: _error,
    multiline: _multiline,
    ...control
  } = props;

  return control;
}

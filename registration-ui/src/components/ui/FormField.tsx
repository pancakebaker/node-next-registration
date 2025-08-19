// registration-ui/src/components/ui/FormField.tsx
import type {
  FieldValues,
  Path,
  UseFormRegister,
  FieldError,
  FieldErrorsImpl,
} from 'react-hook-form';
import { ErrorText } from './ErrorText';
import { Col } from './Col';
import { Label } from './Label';
import { Input, InputProps } from './Input';

type OwnInputProps = Omit<InputProps, 'name' | 'id'>;

export type FormFieldProps<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>
> = {
  name: TName;
  label: string;
  type?: string;
  required?: boolean;
  register: UseFormRegister<TFieldValues>;
  error?: FieldError | FieldErrorsImpl<TFieldValues> | string | null | undefined;
  colClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  labelForId?: string; // use if you want a custom id
} & OwnInputProps;

export function FormField<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>
>({
  name,
  label,
  type = 'text',
  required,
  register,
  error,
  labelForId,
  errorClassName,
  colClassName,
  labelClassName,
  inputClassName,
  ...inputProps
}: FormFieldProps<TFieldValues, TName>) {
  const id = labelForId ?? String(name);
  const err =
    typeof error === 'string'
      ? error
      : (error as FieldError | undefined)?.message;
  const describedBy = err ? `${id}-error` : undefined;

  return (
    <Col className={colClassName}>
      <Label htmlFor={id} className={labelClassName}>
        {label} {required ? '*' : null}
      </Label>
      <Input
        id={id}
        aria-describedby={describedBy}
        aria-invalid={!!err || undefined}
        type={type}
        {...register(name)}
        className={inputClassName}
        {...inputProps}
      />

      {err ? (
        <ErrorText id={describedBy} className={errorClassName}>
          {err}
        </ErrorText>
      ) : null}
    </Col>
  );
}

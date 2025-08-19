// registration-ui/src/components/ui/UserProfile/AccountInfoSection.tsx
'use client';

import type {
  FieldErrors,
  UseFormRegister,
  FieldValues,
  Path,
} from 'react-hook-form';
import { FormField } from '@/components/ui/FormField';
import { ProfileAccountInfo } from '@/schemas/user.schema';

type Props<T extends FieldValues & ProfileAccountInfo> = {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  autoComplete?: string;
};

export default function AccountInfoSection<T extends FieldValues & ProfileAccountInfo>({
  register,
  errors,
  autoComplete,
}: Props<T>) {
  // assure TS that these keys exist on T
  const USERNAME = 'username' as Path<T>;
  const PASSWORD = 'password' as Path<T>;
  const CONFIRM  = 'confirmPassword' as Path<T>;

  const acFor = (fallback: string) => {
    if (!autoComplete) return fallback;
    if (typeof autoComplete === 'string') return autoComplete; // same for all (e.g., 'off')
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      <FormField<T, typeof USERNAME>
        name={USERNAME}
        label="Username"
        required
        type="text"
        register={register}
        error={errors.username as unknown as import('react-hook-form').FieldError | undefined}
        autoComplete={acFor('username')}
      />
      <FormField<T, typeof PASSWORD>
        name={PASSWORD}
        label="Password"
        required
        type="password"
        register={register}
        error={errors.password as unknown as import('react-hook-form').FieldError | undefined}
        autoComplete="off"
      />
      <FormField<T, typeof CONFIRM>
        name={CONFIRM}
        label="Confirm Password"
        required
        type="password"
        register={register}
        error={errors.confirmPassword as unknown as import('react-hook-form').FieldError | undefined}
        autoComplete="off"
      />
    </div>
  );
}

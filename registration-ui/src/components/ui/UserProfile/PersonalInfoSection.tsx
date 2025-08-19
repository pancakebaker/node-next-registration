// registration-ui/src/components/ui/UserProfile/PersonalInforSection.tsx
'use client';

import type { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form';
import type { UserPersonalInfo } from '@/schemas/user.schema';
import { FormField } from '@/components/ui/FormField';

type Props<T extends FieldValues & UserPersonalInfo> = {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  autoComplete?: string;
};

export default function PersonalInfoSection<T extends FieldValues & UserPersonalInfo>({ register, errors, autoComplete }: Props<T>) {
  const GIVEN_NAME = 'name' as Path<T>;
  const FAMILY_NAME = 'familyName' as Path<T>;
  const MIDDLE_NAME = 'middleName' as Path<T>;
  const EMAIL = 'email' as Path<T>;
  const MOBILE = 'mobile' as Path<T>;

  const acFor = (fallback: string) => {
    if (!autoComplete) return fallback;
    if (typeof autoComplete === 'string') return autoComplete; // same for all (e.g., 'off')
  };

  return (

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Given name */}
      <FormField<T, typeof GIVEN_NAME>
        name={GIVEN_NAME}
        label="Given name"
        required
        type="text"
        register={register}
        error={errors.name as unknown as import('react-hook-form').FieldError | undefined}
        autoComplete={acFor('given-name')}
      />

      {/* Family name */}
      <FormField<T, typeof FAMILY_NAME>
        name={FAMILY_NAME}
        label="Family name"
        required
        type="text"
        register={register}
        error={errors.familyName as unknown as import('react-hook-form').FieldError | undefined}
        autoComplete={acFor('family-name')}
      />

      {/* Middle name */}
      <FormField<T, typeof MIDDLE_NAME>
        name={MIDDLE_NAME}
        label="Middle name"
        type="text"
        register={register}
        error={errors.middleName as unknown as import('react-hook-form').FieldError | undefined}
        autoComplete={acFor('additional-name')}
      />

      {/* Email */}
      <FormField<T, typeof EMAIL>
        name={EMAIL}
        label="Email"
        type="email"
        required
        register={register}
        error={errors.email as unknown as import('react-hook-form').FieldError | undefined}
        autoComplete={acFor('email')}
      />

      {/* Mobile */}
      <FormField<T, typeof MOBILE>
        name={MOBILE}
        label="Mobile"
        required
        type="tel"
        placeholder="e.g. +63 9xx xxx xxxx"
        register={register}
        error={errors.mobile as unknown as import('react-hook-form').FieldError | undefined}
        colClassName="sm:col-span-2"
        autoComplete={acFor('mobile')}
      />
    </div>
  );
}

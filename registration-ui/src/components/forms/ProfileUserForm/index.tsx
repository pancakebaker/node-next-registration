// registration-ui/src/components/forms/ProfileUserForm/index.tsx
'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  personalInfoSchema,
  profileAccountSchema,
  type UserPersonalInfo,
  type ProfileAccountInfo,
} from '@/schemas/user.schema';

import { Button } from '@/components/ui/Button';
import { useProfileUserFormController } from './profileUserFormController';
import { Alert } from '@/components/ui/Alert';
import PersonalInfoSection from '@/components/ui/UserProfile/PersonalInfoSection';
import AccountInfoSection from '@/components/ui/UserProfile/AccountInfoSection';

/**
 * Profile user form (Client Component).
 *
 * Renders two independent React Hook Form instances:
 *  - **Personal Information** — validated by {@link personalInfoSchema}.
 *  - **Account Information** — validated by {@link profileAccountSchema}.
 *
 * On mount, the form controller loads the current user's profile and
 * populates both forms via `reset(...)`. Each section saves independently.
 *
 * UX & Accessibility:
 *  - Inputs are validated on blur (`mode: 'onBlur'`).
 *  - Submit buttons show a loading state while saving.
 *  - Server notices are shown via {@link Alert} (success/error).
 *  - `autoComplete="off"` is applied to both sections to prevent autofill.
 *
 * Implementation notes:
 *  - The controller’s `initialize()` handles data fetch + form resets.
 *  - Personal and account forms are submitted separately to their endpoints.
 *
 * @returns JSX markup for the profile editor.
 *
 * @example
 * ```tsx
 * // Route: /profile
 * export default function ProfilePage() {
 *   return (
 *     <main>
 *       <ProfileUserForm />
 *     </main>
 *   );
 * }
 * ```
 */
export default function ProfileUserForm() {
  const {
    register: registerPersonal,
    handleSubmit: handleSubmitPersonal,
    formState: { errors: errorsPersonal, isSubmitting: isSubmittingPersonal },
    reset: resetPersonal,
  } = useForm<UserPersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      middleName: '',
      familyName: '',
      mobile: '',
      email: '',
    },
  });

  const {
    register: registerAccount,
    handleSubmit: handleSubmitAccount,
    formState: { errors: errorsAccount, isSubmitting: isSubmittingAccount },
    reset: resetAccount,
    setValue: setAccountValue,
  } = useForm<ProfileAccountInfo>({
    resolver: zodResolver(profileAccountSchema),
    mode: 'onBlur',
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { personalNotice, accountNotice, initialize, onSavePersonal, onSaveAccount } =
    useProfileUserFormController(resetPersonal, resetAccount, setAccountValue);

  // Load user profile and hydrate both forms on first render.
  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      {/* Personal Information */}
      <section className="rounded-2xl border p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Personal Information</h2>

        {personalNotice?.message && (
          <Alert variant={personalNotice.type === 'success' ? 'success' : 'error'}>
            {personalNotice.message}
          </Alert>
        )}

        <form onSubmit={handleSubmitPersonal(onSavePersonal)} className="space-y-4">
          <PersonalInfoSection
            register={registerPersonal}
            errors={errorsPersonal}
            autoComplete="off"
          />

          <div className="pt-2">
            <Button type="submit" disabled={isSubmittingPersonal}>
              {isSubmittingPersonal ? 'Saving…' : 'Save Personal Info'}
            </Button>
          </div>
        </form>
      </section>

      {/* Account Information */}
      <section className="rounded-2xl border p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Account Information</h2>

        {accountNotice?.message && (
          <Alert variant={accountNotice.type === 'success' ? 'success' : 'error'}>
            {accountNotice.message}
          </Alert>
        )}

        <form onSubmit={handleSubmitAccount(onSaveAccount)} className="space-y-4">
          <AccountInfoSection
            register={registerAccount}
            errors={errorsAccount}
            autoComplete="off"
          />

          <div className="pt-2">
            <Button type="submit" disabled={isSubmittingAccount}>
              {isSubmittingAccount ? 'Saving…' : 'Save Account Info'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

// registration-ui/src/components/forms/RegistrationWizard/index.tsx
'use client';

import { useRef, useState } from 'react';
import { FieldPath, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import ProgressBar from '../../ui/ProgressBar';
import { RegistrationWizardController } from './RegistrationWizardController';

import { userSchema, type UserDetails, type StepIndex } from '@/schemas/user.schema';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import PersonalInfoSection from '@/components/ui/UserProfile/PersonalInfoSection';
import AccountInfoSection from '@/components/ui/UserProfile/AccountInfoSection';
import { UserService } from '@/services/user.service';
import { USER_DEFAULTS, USER_MESSAGES, USER_STEPS } from '@/lib/constants';

/**
 * Registration wizard (Client Component).
 *
 * Multi-step form for creating a new account:
 * - **Step 1 – Personal Info**: rendered via {@link PersonalInfoSection}.
 * - **Step 2 – Account Info**: rendered via {@link AccountInfoSection}.
 *
 * Form state & validation:
 * - Uses React Hook Form with Zod resolver (`userSchema`).
 * - `mode: 'onBlur'` for user-friendly validation.
 * - Defaults come from {@link USER_DEFAULTS}.
 *
 * Control flow:
 * - A single {@link RegistrationWizardController} instance coordinates step
 *   navigation (`onNext`, `onPrev`), submission, and server messages.
 * - The controller calls the {@link UserService} to register the user.
 *
 * UI:
 * - {@link ProgressBar} indicates the current step from {@link USER_STEPS}.
 * - Success and error messages are shown with {@link Alert}.
 * - Buttons reflect submitting state and disable interactions as needed.
 *
 * @returns JSX for the two-step registration flow.
 *
 * @example
 * ```tsx
 * // Route: /register
 * export default function RegisterPage() {
 *   return <RegistrationWizard />;
 * }
 * ```
 */
export default function RegistrationWizard() {
  const [step, setStep] = useState<StepIndex>(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  const svc = UserService;

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserDetails>({
    resolver: zodResolver(userSchema),
    mode: 'onBlur',
    defaultValues: USER_DEFAULTS,
  });

  // Keep a stable controller instance across renders.
  const ctrlRef = useRef<RegistrationWizardController | null>(null);
  if (!ctrlRef.current) {
    ctrlRef.current = new RegistrationWizardController({
      getStep: () => step,
      setStep,
      setServerError,
      setServerSuccess,
      trigger: (names?: FieldPath<UserDetails>[]) => trigger(names),
      reset: (vals) => reset(vals),
      defaults: USER_DEFAULTS as unknown as UserDetails,
      messages: USER_MESSAGES,
      userSvc: svc,
    });
  }
  const ctrl = ctrlRef.current;

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
      <p className="mt-1 text-sm text-gray-500">
        Complete the steps to register. Fields marked with * are required.
      </p>

      <ProgressBar steps={USER_STEPS} activeIndex={step} />

      {serverError && <Alert variant="error">{serverError}</Alert>}
      {serverSuccess && <Alert variant="success">{serverSuccess}</Alert>}

      <form className="mt-6 space-y-6" onSubmit={handleSubmit((d) => ctrl.onSubmit(d))}>
        {step === 0 ? (
          <PersonalInfoSection register={register} errors={errors} />
        ) : (
          <AccountInfoSection register={register} errors={errors} />
        )}

        <div className="mt-4 flex items-center justify-between">
          {step === 1 ? (
            <Button type="button" onClick={() => ctrl.onPrev()} variant="secondary" disabled={isSubmitting}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {step === 0 ? (
            <Button type="button" onClick={() => ctrl.onNext()}>
              Continue
            </Button>
          ) : (
            <Button type="submit" isLoading={isSubmitting}>
              Create account
            </Button>
          )}
        </div>

        <div className="pt-2 text-xs text-gray-500">
          Step {step + 1} of {USER_STEPS.length}: {USER_STEPS[step]}
        </div>
      </form>
    </div>
  );
}

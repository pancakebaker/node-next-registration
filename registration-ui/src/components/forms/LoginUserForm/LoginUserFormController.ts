// src/components/forms/LoginUserForm/LoginUserFormController.ts
'use client';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '@/schemas/auth/login.schema';
import { PAGE_LINKS, USER_MESSAGES } from '@/lib/constants';
import { UserService } from '@/services/user.service';
import type { AuthUser } from '@/services/api.types';

/**
 * Payload returned to {@link useLoginUserFormController}'s `onSuccess` callback.
 * Includes the authenticated user and tokens issued by the backend.
 */
export type LoginSuccessPayload = {
  /** Convenience alias for `accessToken`. */
  token: string;
  /** Authenticated user (id, name, username, email). */
  user: AuthUser;
  /** JWT access token issued by the API. */
  accessToken?: string;
  /** Refresh token issued by the API (if applicable). */
  refreshToken?: string;
};

/**
 * Controller hook for the Login form.
 *
 * Responsibilities:
 * - Builds a React Hook Form instance validated with Zod (`loginSchema`).
 * - Submits credentials via {@link UserService.login}.
 * - Normalizes success/failure UX (success/error banners, disabled state).
 * - Navigates to a target route on success (defaults to Dashboard).
 *
 * Error handling:
 * - Server validation/auth failures are mapped to a friendly message
 *   (`USER_MESSAGES.LOGIN_ERROR`) rather than leaking backend details.
 *
 * @param opts Optional configuration.
 * @param opts.redirectTo Route to navigate to on successful login (defaults to `PAGE_LINKS.DASHBOARD`).
 * @param opts.onSuccess Callback invoked after successful login with {@link LoginSuccessPayload}.
 *
 * @returns An object containing handlers, form bindings, and UI state:
 * - `register` – pass to inputs to register fields
 * - `handleSubmit` – RHF submit handler
 * - `onSubmit` – ready-to-use submit handler for `<form onSubmit>`
 * - `formState` – RHF state (errors, isSubmitting, etc.)
 * - `reset` – resets the form to defaults
 * - `serverError` / `serverSuccess` – strings to display in banners
 * - `setServerError` / `setServerSuccess` – setters for custom messaging
 * - `isSubmitting` – convenience flag from `formState`
 *
 * @example
 * ```tsx
 * const {
 *   register,
 *   onSubmit,
 *   formState: { errors },
 *   serverError,
 *   isSubmitting,
 * } = useLoginUserFormController({ redirectTo: '/dashboard' });
 *
 * return (
 *   <form onSubmit={onSubmit}>
 *     <input {...register('identifier')} />
 *     {errors.identifier && <span>{errors.identifier.message}</span>}
 *     <input type="password" {...register('password')} />
 *     <button disabled={isSubmitting}>Sign in</button>
 *     {serverError && <div role="alert">{serverError}</div>}
 *   </form>
 * );
 * ```
 */
export function useLoginUserFormController(opts: {
  redirectTo?: string;
  onSuccess?: (payload: LoginSuccessPayload) => void;
} = {}) {
  const { redirectTo = PAGE_LINKS.DASHBOARD, onSuccess } = opts;
  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { identifier: '', password: '' },
  });

  const submit = useCallback(
    async (values: LoginFormValues) => {
      setServerError(null);
      setServerSuccess(null);
      try {
        const { accessToken, refreshToken, user } = await UserService.login(
          values.identifier,
          values.password,
        );

        onSuccess?.({ token: accessToken, accessToken, refreshToken, user });
        setServerSuccess(USER_MESSAGES.LOGIN_SUCCESS);
        form.reset();
        router.push(redirectTo);
      } catch {
        setServerError(USER_MESSAGES.LOGIN_ERROR);
      }
    },
    [form, onSuccess, redirectTo, router],
  );

  return {
    register: form.register,
    handleSubmit: form.handleSubmit,
    onSubmit: form.handleSubmit(submit),
    formState: form.formState,
    reset: form.reset,
    serverError,
    serverSuccess,
    setServerError,
    setServerSuccess,
    isSubmitting: form.formState.isSubmitting,
  };
}

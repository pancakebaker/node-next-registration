// src/components/forms/LoginUserForm/index.tsx
'use client';

import { FormField } from '@/components/ui/FormField';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { useLoginUserFormController } from './LoginUserFormController';

/**
 * Shape of the minimal user payload returned by the login endpoint.
 */
type ApiSuccessUser = {
  id: string;
  name: string;
  username: string;
  email: string;
};

/**
 * Props for {@link LoginUserForm}.
 */
type Props = {
  /**
   * Optional callback invoked after a successful login.
   * Useful if the parent wants to react to auth without navigating.
   */
  onSuccess?: (payload: { token: string; user: ApiSuccessUser }) => void;
  /**
   * Optional path to redirect to after successful login.
   * If omitted, the controller may decide a default (e.g., dashboard).
   */
  redirectTo?: string;
};

/**
 * Login form (Client Component).
 *
 * Renders a username/email + password form, handles submission via
 * {@link useLoginUserFormController}, and displays server/field errors.
 *
 * Accessibility & UX:
 * - Uses proper `autoComplete` tokens (`username`, `current-password`) to
 *   enable browser password managers.
 * - Disables inputs during submission and shows a loading state on the button.
 *
 * @param props - {@link Props}
 * @returns JSX form that submits credentials and handles success/failure.
 *
 * @example
 * ```tsx
 * <LoginUserForm redirectTo="/dashboard" />
 *
 * // or with a custom success handler:
 * <LoginUserForm onSuccess={({ token, user }) => setSession({ token, user })} />
 * ```
 */
export default function LoginUserForm({ onSuccess, redirectTo }: Props) {
  const {
    register,
    onSubmit,
    formState: { errors },
    isSubmitting,
    serverError,
    serverSuccess,
  } = useLoginUserFormController({ onSuccess, redirectTo });

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4">
      <FormField
        name="identifier"
        label="Username or Email"
        type="text"
        autoComplete="username"
        placeholder="you@example.com or your_username"
        register={register}
        error={errors.identifier}
        disabled={isSubmitting}
      />

      <FormField
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        register={register}
        error={errors.password}
        disabled={isSubmitting}
      />

      {serverError && <Alert variant="error">{serverError}</Alert>}
      {serverSuccess && <Alert variant="success">{serverSuccess}</Alert>}

      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}

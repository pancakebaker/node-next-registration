// registration-ui/src/app/register/page.tsx
import RegistrationWizard from '@/components/forms/RegistrationWizard';

/**
 * Registration page (Server Component).
 *
 * Renders the multi-step {@link RegistrationWizard} used to create a new account.
 * Any redirect logic for already-authenticated users should be handled by middleware.
 *
 * @returns JSX markup for the registration flow.
 *
 * @example
 * // Route: /register
 * // Displays the step-by-step registration wizard.
 */
export default function RegisterPage() {
  return <RegistrationWizard />;
}

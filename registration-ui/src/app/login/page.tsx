// src/app/login/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import LoginUserForm from '@/components/forms/LoginUserForm';
import { PAGE_LINKS } from '@/lib/constants';

/**
 * Static metadata for the Login page.
 *
 * Next.js will merge this with layout-level metadata and use it for the
 * document <head> (e.g., <title>).
 */
export const metadata: Metadata = {
  title: 'Login',
};

/**
 * Login page (Server Component).
 *
 * Renders the login form and a link to the registration page.
 * The embedded {@link LoginUserForm} will, on successful authentication,
 * navigate to {@link PAGE_LINKS.DASHBOARD}.
 *
 * @returns JSX markup for the login page.
 *
 * @example
 * // Route: /login
 * // After a successful login, the form redirects to /dashboard.
 */
export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-6 mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-gray-500">
            Don’t have an account?{' '}
            <Link href={PAGE_LINKS.REGISTER} className="underline">
              Create one
            </Link>
          </p>
        </div>
        <LoginUserForm redirectTo={PAGE_LINKS.DASHBOARD} />
      </div>
    </main>
  );
}

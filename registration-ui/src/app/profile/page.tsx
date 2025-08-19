// registration-ui/src/app/profile/page.tsx
import ProfileUserForm from '@/components/forms/ProfileUserForm';

/**
 * Profile page (Server Component).
 *
 * Renders the user profile form where a signed-in user can view and update
 * their personal and account information.
 *
 * Auth: This page assumes access is gated by middleware or a layout-level
 * check. If needed, add a server-side guard (e.g., `getMe()` + `redirect`).
 *
 * @returns JSX markup for the profile page.
 *
 * @example
 * // Route: /profile
 * // Displays editable personal/account fields for the current user.
 */
export default function ProfilePage() {
  return (
    <main className="mx-auto w-full max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Your Profile</h1>
      <ProfileUserForm />
    </main>
  );
}

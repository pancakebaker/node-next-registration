// registration-ui/src/app/dashboard/page.tsx (Server Component)
import { getMe } from '@/lib/auth';
import { PAGE_LINKS } from '@/lib/constants';
import { redirect } from 'next/navigation';

/**
 * Force dynamic rendering for this route.
 *
 * Ensures `getMe()` executes on **every** request (no static optimization),
 * so auth state is always fresh.
 */
export const dynamic = 'force-dynamic';

/**
 * Disable incremental static regeneration (ISR) for this page.
 * Combined with `dynamic = 'force-dynamic'`, this guarantees per-request auth.
 */
export const revalidate = 0;

/**
 * Dashboard page (Server Component).
 *
 * - Fetches the current user via {@link getMe}.
 * - If unauthenticated, performs a server redirect to the login page with a
 *   `next` parameter that points back to the dashboard.
 * - If authenticated, renders a simple welcome UI.
 *
 * @returns JSX markup for the dashboard or a server-side redirect.
 *
 * @example
 * // Redirect behavior:
 * //   /dashboard  → (no session) → /login?next=/dashboard
 * //   /dashboard  → (has session) → renders dashboard
 */
export default async function DashboardPage() {
  const me = await getMe();

  if (!me) {
    redirect(`${PAGE_LINKS.LOGIN}?next=${PAGE_LINKS.DASHBOARD}`);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-6 mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Welcome to your Dashboard</h1>
          <p className="mt-4 text-lg">
            Hello, <span className="font-semibold">{me?.name}</span> 👋
          </p>
        </div>
      </div>
    </main>
  );
}

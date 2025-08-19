// registration-ui/src/app/dashboard/DashboardController.ts
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthError } from '@/services/api.types';
import { UserService } from '@/services/user.service';
import { UserPersonalInfo } from '@/schemas/user.schema';
import { PAGE_LINKS, USER_MESSAGES } from '@/lib/constants';

/**
 * Shape of the controller state returned by {@link useDashboardController}.
 */
export interface DashboardControllerState {
  /** The authenticated user's personal info, or `null` if not loaded or unauthenticated. */
  user: UserPersonalInfo | null;
  /** `true` while the controller is loading user/session state. */
  loading: boolean;
  /** A user-friendly error message when something goes wrong, otherwise `null`. */
  error: string | null;
}

/**
 * Dashboard page controller hook.
 *
 * Loads the current user's profile via {@link UserService.load}, handles redirects
 * for unauthenticated sessions, and exposes a simple `user / loading / error` state.
 *
 * ## Navigation behavior
 * - If the API indicates a redirect target, the hook will `router.replace(redirectTo)`.
 * - If an {@link AuthError} occurs (unauthorized), the hook will `router.replace(PAGE_LINKS.LOGIN)`.
 *
 * The hook is safe to use inside client components and is AbortController-aware to
 * prevent state updates after unmount.
 *
 * @returns {DashboardControllerState} Reactive controller state.
 *
 * @example
 * ```tsx
 * export default function DashboardPage() {
 *   const { user, loading, error } = useDashboardController();
 *   if (loading) return <p>Loading…</p>;
 *   if (error) return <p>Error: {error}</p>;
 *   return <h1>Hello, {user?.name}</h1>;
 * }
 * ```
 */
export function useDashboardController(): DashboardControllerState {
  const router = useRouter();
  const [user, setUser] = useState<UserPersonalInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        const { user, redirectTo } = await UserService.load();
        if (ac.signal.aborted) return;

        if (redirectTo) {
          router.replace(redirectTo);
          return;
        }

        setUser(user);
      } catch (err) {
        if (ac.signal.aborted) return;

        if (err instanceof AuthError) {
          router.replace(PAGE_LINKS.LOGIN);
          return;
        }

        setError(err instanceof Error ? err.message : USER_MESSAGES.ERROR);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    // Cleanup: cancel pending async work on unmount or dependency change.
    return () => ac.abort();
  }, [router]);

  return { user, loading, error };
}

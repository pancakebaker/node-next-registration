// registration-ui/src/components/ui/PageHeader/userPageHeader.ts
'use client';

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserService } from "@/services/user.service";
import type { HeaderProps, NavItem } from "./PageHeader.types";
import { PAGE_LINKS } from "@/lib/constants";

/**
 * Public shape of the Page Header controller returned by {@link usePageHeaderController}.
 */
export type PageHeaderController = ReturnType<typeof usePageHeaderController>;

/**
 * Page Header controller hook.
 *
 * Manages navigation links, auth-aware rendering, and responsive behavior for the
 * header component. It observes auth token changes (via {@link UserService.observeToken})
 * to toggle guest vs. authenticated links and handles logout.
 *
 * Behavior:
 * - Initializes `isAuthed` from local auth state and keeps it in sync with storage/cookie changes.
 * - Closes the mobile drawer on route changes.
 * - Provides a computed `allLinks` array that merges `publicLinks` with either
 *   `guestLinks` or `authenticatedLinks` plus a "Logout" item when authenticated.
 * - Normalizes active-link detection by ignoring query/hash and trailing slashes.
 * - Handles link clicks for both desktop and mobile menus.
 *
 * @param props.publicLinks        Links shown to everyone.
 * @param props.guestLinks         Links shown only when unauthenticated.
 * @param props.authenticatedLinks Links shown only when authenticated (a Logout item is appended automatically).
 *
 * @returns An object with:
 * - `isAuthed` – current auth state boolean.
 * - `open` / `setOpen` – mobile drawer state and setter.
 * - `allLinks` – final list of navigational items to render.
 * - `isActive(href)` – predicate to style active links.
 * - `linkClassDesktop(active)` / `linkClassMobile(active)` – class string helpers.
 * - `handleItemClick(variant, item)` – unified click handler for nav items.
 *
 * @example
 * ```tsx
 * const {
 *   isAuthed, open, setOpen, allLinks,
 *   isActive, linkClassDesktop, linkClassMobile,
 *   handleItemClick,
 * } = usePageHeaderController({
 *   publicLinks: [{ label: 'Home', href: '/' }],
 *   guestLinks: [{ label: 'Login', href: '/login' }],
 *   authenticatedLinks: [{ label: 'Dashboard', href: '/dashboard' }],
 * });
 * ```
 */
export function usePageHeaderController({ publicLinks, guestLinks, authenticatedLinks }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthed, setIsAuthed] = useState(false);
  const [open, setOpen] = useState(false);

  // Initialize & observe auth state
  useEffect(() => {
    setIsAuthed(UserService.isAuthenticated());
    const stop = UserService.observeToken((token) => setIsAuthed(!!token), 400);
    return () => stop?.();
  }, []);

  // Auto-close mobile drawer when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /**
   * Logs the user out by clearing local tokens & cookies and navigating to Login.
   * Updates `isAuthed` immediately for a snappy UI.
   */
  const logout = useCallback(() => {
    UserService.logout();
    setIsAuthed(false); // immediate UI update
    router.push(PAGE_LINKS.LOGIN);
  }, [router]);

  /** Synthetic "Logout" nav item appended to authenticated links. */
  const logoutLink: NavItem = useMemo(
    () => ({ label: "Logout", href: "#", onClick: logout }),
    [logout]
  );

  /**
   * Final list of links:
   * - Always includes `publicLinks`.
   * - Includes `guestLinks` when unauthenticated.
   * - Includes `authenticatedLinks` + Logout when authenticated.
   */
  const allLinks: NavItem[] = useMemo(
    () => [
      ...(publicLinks ?? []),
      ...(isAuthed ? [...(authenticatedLinks ?? []), logoutLink] : (guestLinks ?? [])),
    ],
    [publicLinks, guestLinks, authenticatedLinks, isAuthed, logoutLink]
  );

  /**
   * More tolerant active check (ignores query/hash and trailing slash).
   * @param href Link href to compare with current path.
   */
  const isActive = useCallback((href: string) => {
    const strip = (u: string) => u.split(/[?#]/)[0].replace(/\/+$/, "");
    return strip(pathname) === strip(href);
  }, [pathname]);

  /** Returns desktop link classes based on active state. */
  const linkClassDesktop = useCallback(
    (active: boolean) =>
      [
        "text-sm font-medium transition-colors",
        active ? "text-gray-900" : "text-gray-600 hover:text-gray-900 focus:text-gray-900 focus:outline-none",
      ].join(" "),
    []
  );

  /** Returns mobile link classes based on active state. */
  const linkClassMobile = useCallback(
    (active: boolean) =>
      [
        "block rounded-lg px-3 py-2 text-base font-medium transition-colors",
        active ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:bg-gray-50 focus:text-gray-900",
      ].join(" "),
    []
  );

  /**
   * Unified click handler for nav items.
   * - Closes the mobile drawer (when applicable).
   * - Executes `item.onClick()` if provided, otherwise navigates via `router.push`.
   */
  const handleItemClick = useCallback(
    (variant: "desktop" | "mobile", item: NavItem) => {
      if (variant === "mobile") setOpen(false);
      if (item.onClick) {
        item.onClick();
      } else if (item.href && item.href !== "#") {
        router.push(item.href);
      }
    },
    [router]
  );

  return {
    // state
    isAuthed,
    open,
    setOpen,
    // computed
    allLinks,
    isActive,
    linkClassDesktop,
    linkClassMobile,
    // handlers
    handleItemClick,
  } as const;
}

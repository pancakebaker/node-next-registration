// registration-ui/src/components/ui/Header/Header.tsx
"use client";

import Link from "next/link";
import type { HeaderProps, NavItem } from "./PageHeader.types";
import { usePageHeaderController } from "./PageHeaderController";

export default function ResponsivePageHeader(props: HeaderProps) {
  const {
    allLinks,
    open,
    setOpen,
    isActive,
    linkClassDesktop,
    linkClassMobile,
    handleItemClick,
  } = usePageHeaderController(props);

  const renderLinks = (items: NavItem[], variant: "desktop" | "mobile") =>
    items.map((item) => (
      <li key={`${variant}:${item.label}`}>
        {item.onClick ? (
          <button
            type="button"
            onClick={() => handleItemClick(variant, item)}
            className={variant === "desktop" ? linkClassDesktop(false) : linkClassMobile(false)}
          >
            {item.label}
          </button>
        ) : (
          <Link
            href={item.href}
            {...(variant === "mobile" ? { onClick: () => setOpen(false) } : {})}
            className={
              variant === "desktop"
                ? linkClassDesktop(isActive(item.href))
                : linkClassMobile(isActive(item.href))
            }
            aria-current={isActive(item.href) ? "page" : undefined}
          >
            {item.label}
          </Link>
        )}
      </li>
    ));

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-200">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-lg">registration<span className="text-blue-600">UI</span></span>
          </Link>

          <div className="ml-auto flex items-center">
            <nav className="hidden md:block" aria-label="Main">
              <ul className="flex items-center gap-6">{renderLinks(allLinks, "desktop")}</ul>
            </nav>

            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">Toggle navigation</span>
              <svg className={`h-6 w-6 ${open ? "hidden" : "block"}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <svg className={`h-6 w-6 ${open ? "block" : "hidden"}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div id="mobile-menu" className={`md:hidden border-t border-gray-200 ${open ? "block" : "hidden"}`}>
        <nav className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-3" aria-label="Mobile">
          <ul className="flex flex-col gap-2">{renderLinks(allLinks, "mobile")}</ul>
        </nav>
      </div>
    </header>
  );
}

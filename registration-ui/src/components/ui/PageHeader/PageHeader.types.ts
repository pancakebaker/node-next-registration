// registration-ui/src/components/ui/Header/Header.types.ts
export type NavItem = {
  label: string;
  href: string;
  onClick?: () => void;
};

export type HeaderProps = {
  publicLinks: NavItem[];
  guestLinks: NavItem[];
  authenticatedLinks: NavItem[];
};

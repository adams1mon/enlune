import Link from "next/link";
import type { ReactNode } from "react";

type NavChipProps = {
  active?: boolean;
  ariaCurrent?: "page";
  href: string;
  children: ReactNode;
};

export function NavChip({ active = false, ariaCurrent, href, children }: NavChipProps) {
  return (
    <Link
      href={href}
      className={active ? "nav-chip nav-chip--active" : "nav-chip"}
      aria-current={ariaCurrent}
    >
      {children}
    </Link>
  );
}

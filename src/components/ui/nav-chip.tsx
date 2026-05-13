import type { ReactNode } from "react";

type NavChipProps = {
  active?: boolean;
  ariaCurrent?: "page";
  children: ReactNode;
};

export function NavChip({ active = false, ariaCurrent, children }: NavChipProps) {
  return (
    <span
      className={active ? "nav-chip nav-chip--active" : "nav-chip"}
      aria-current={ariaCurrent}
    >
      {children}
    </span>
  );
}

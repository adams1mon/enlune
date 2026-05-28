import Link from "next/link";
import type { ReactNode } from "react";
import { BrandBadge } from "@/components/ui/brand-badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { NavChip } from "@/components/ui/nav-chip";

const navItems: Array<{ label: string; active?: boolean, href: string }> = [
  { label: "Services", href: "/#services" },
  { label: "Articles", href: "/articles", active: true },
] as const;

export default function ArticlesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <div className="sticky top-0 z-50 px-4 pt-4 sm:px-6 sm:pt-6">
        <Container>
          <header className="flex flex-col items-center gap-2 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-start">
              <Link
                href="/"
                aria-label="Enlune home"
                className="rounded-full"
              >
                <BrandBadge
                  className="w-fit sm:float-left bg-[rgb(120,120,120,0.1)] backdrop-blur-md"
                  textClassName="text-ink"
                  logoClassName="text-black"
                />
              </Link>

            <nav aria-label="Primary" className="nav-cluster bg-[rgb(50,50,50,0.5)]">
              {navItems.map((item) => (
                <NavChip
                  key={item.label}
                  href={item.href}
                  active={item.active}
                  ariaCurrent={item.active ? "page" : undefined}
                >
                  {item.label}
                </NavChip>
              ))}

              <Button href="/#book" size="sm" className="text-white font-regular">
                Book a call
              </Button>
            </nav>

            <div className="hidden md:block" aria-hidden="true" />
          </header>
        </Container>
      </div>

      {children}
    </>
  );
}

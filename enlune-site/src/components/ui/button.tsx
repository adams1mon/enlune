import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  href: string;
  size?: "sm" | "md";
  variant?: "primary" | "surface";
} & Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "href">;

export function Button({
  children,
  className,
  href,
  size = "md",
  variant,
  ...props
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={[
        "button-pill",
        size === "sm" ? "button-pill--sm" : "button-pill--md",
        variant === "surface" ? "button-pill--surface" :
        variant === "primary" ? "button-pill--primary" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Link>
  );
}

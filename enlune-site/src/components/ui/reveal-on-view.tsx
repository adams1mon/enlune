"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

type RevealOnViewProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function RevealOnView({
  children,
  className,
  style,
}: RevealOnViewProps) {
  const [isVisible, setIsVisible] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = rootRef.current;

    if (!node || isVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        setIsVisible(true);
        observer.disconnect();
      },
      {
        threshold: 0.4,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <article
      ref={rootRef}
      className={className}
      data-visible={isVisible ? "true" : "false"}
      style={style}
    >
      {children}
    </article>
  );
}

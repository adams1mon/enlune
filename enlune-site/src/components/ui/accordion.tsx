"use client";

import { useState } from "react";
import type { ReactNode } from "react";

type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

type AccordionProps = {
  items: readonly AccordionItem[];
  defaultOpenItemId?: string | null;
};

export function Accordion({
  items,
  defaultOpenItemId = null,
}: AccordionProps) {
  const [openItemIds, setOpenItemIds] = useState<string[]>(
    defaultOpenItemId ? [defaultOpenItemId] : [],
  );

  function toggleItem(itemId: string) {
    setOpenItemIds((currentItemIds) => (
      currentItemIds.includes(itemId)
        ? currentItemIds.filter((currentId) => currentId !== itemId)
        : [...currentItemIds, itemId]
    ));
  }

  return (
    <div
      className="flex flex-col border-t border-white/14"
      data-open-items={openItemIds.join(" ")}
    >
      {items.map((item) => {
        const contentId = `${item.id}-content`;
        const triggerId = `${item.id}-trigger`;
        const isOpen = openItemIds.includes(item.id);

        return (
          <section
            key={item.id}
            className="border-b border-white/14"
            data-state={isOpen ? "open" : "closed"}
          >
            <h3 className="m-0">
              <button
                id={triggerId}
                type="button"
                className="flex w-full cursor-pointer items-center justify-between gap-4 border-0 bg-transparent py-[1.1rem] text-left text-inherit"
                aria-expanded={isOpen}
                aria-controls={contentId}
                onClick={() => toggleItem(item.id)}
              >
                <span className="text-base leading-6">{item.title}</span>
                <span
                  className="relative h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                >
                  <span className="absolute left-1/2 top-1/2 h-px w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-current" />
                  <span
                    className={[
                      "absolute left-1/2 top-1/2 h-full w-px -translate-x-1/2 -translate-y-1/2 rounded-full bg-current",
                      isOpen ? "scale-y-20 opacity-0" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                </span>
              </button>
            </h3>

            <div
              id={contentId}
              role="region"
              aria-labelledby={triggerId}
              className={[
                "grid overflow-hidden transition-[grid-template-rows] duration-220 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="min-h-0 overflow-hidden">
                <div
                  className={[
                    "mb-2 text-sm leading-[1.5rem] text-muted-inverse",
                    isOpen
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-1 opacity-0",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {item.content}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export type { AccordionItem, AccordionProps };

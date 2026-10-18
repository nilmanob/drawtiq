"use client";

import { useState } from "react";

export type FaqItem = {
  q: string;
  a: string;
};

export function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="faq-list">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div className="faq-item" key={item.q}>
            <button
              className="faq-question"
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : index)}
            >
              <span>{item.q}</span>
              <span aria-hidden="true">+</span>
            </button>
            <div className="faq-answer" hidden={!isOpen}>
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}

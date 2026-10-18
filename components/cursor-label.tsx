"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Follow-cursor "View ↗" label. It is deliberately delegated to the document
 * so it keeps working after client-side navigation (where the project nodes are
 * replaced), and it only shows while the pointer is inside a `.project` area.
 */
export function CursorLabel() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const labelRef = useRef<HTMLDivElement | null>(null);
  const frame = useRef<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduce);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const label = labelRef.current;
    if (!label) return;

    let active = false;

    const move = (e: PointerEvent) => {
      if (frame.current !== null) return;
      const { clientX, clientY } = e;
      frame.current = window.requestAnimationFrame(() => {
        frame.current = null;
        label.style.transform = `translate(${clientX}px, ${clientY}px) translate(-50%, -50%)`;
      });
    };

    const hide = () => {
      active = false;
      setVisible(false);
    };

    const onOver = (e: Event) => {
      const target = e.target as Element | null;
      if (target && target.closest(".project")) {
        active = true;
        setVisible(true);
      } else if (active) {
        hide();
      }
    };

    const onOut = (e: Event) => {
      const target = e.target as Element | null;
      const project = target?.closest(".project");
      if (!project) return;
      const related = (e as PointerEvent).relatedTarget as Element | null;
      if (related && related.closest(".project") === project) return;
      hide();
    };

    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", hide);
    window.addEventListener("blur", hide);

    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", hide);
      window.removeEventListener("blur", hide);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, [enabled]);

  // Reset on every route change so it can never get stuck on screen.
  useEffect(() => {
    setVisible(false);
  }, [pathname]);

  if (!enabled) return null;

  return (
    <div
      ref={labelRef}
      className={`cursor-label ${visible ? "visible" : ""}`}
      aria-hidden="true"
    >
      View ↗
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Floating image preview for the services list. While the pointer is over a
 * `.service-row` that declares a `data-preview` image, that image follows the
 * cursor. Delegated to the document so it survives client-side navigation, and
 * only enabled for fine pointers without reduced-motion.
 */
export function ServicePreview() {
  const [enabled, setEnabled] = useState(false);
  const [src, setSrc] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const frame = useRef<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine && !reduce);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const box = boxRef.current;
    if (!box) return;

    let activeRow: Element | null = null;

    const move = (e: PointerEvent) => {
      if (frame.current !== null) return;
      const { clientX, clientY } = e;
      frame.current = window.requestAnimationFrame(() => {
        frame.current = null;
        box.style.transform = `translate(${clientX}px, ${clientY}px) translate(-50%, -50%)`;
      });
    };

    const onOver = (e: Event) => {
      const row =
        (e.target as Element | null)?.closest(".service-row[data-preview]") ?? null;
      if (row === activeRow) return;
      activeRow = row;
      setSrc(row ? row.getAttribute("data-preview") : null);
    };

    const hide = () => {
      activeRow = null;
      setSrc(null);
    };

    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", hide);
    window.addEventListener("blur", hide);

    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", hide);
      window.removeEventListener("blur", hide);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, [enabled, pathname]);

  if (!enabled) return null;

  return (
    <div
      ref={boxRef}
      className={`service-preview ${src ? "visible" : ""}`}
      aria-hidden="true"
    >
      {src ? <img src={src} alt="" /> : null}
    </div>
  );
}

"use client";

import { useEffect, useRef, type ReactNode } from "react";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Pointer effects for the showcase panel: a primary-colour spotlight that
 * follows the cursor and a gentle 3D tilt on each card. Pure CSS variables,
 * written at most once per animation frame; off for touch and reduced motion.
 */
export function ShowcaseStage({ children, className }: { children: ReactNode; className: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = ref.current;
    if (!stage || prefersReducedMotion() || !window.matchMedia("(hover: hover)").matches) {
      return;
    }

    let frame = 0;
    let event: PointerEvent | null = null;

    const apply = () => {
      frame = 0;
      if (!event) return;
      const rect = stage.getBoundingClientRect();
      stage.style.setProperty("--sc-mx", `${event.clientX - rect.left}px`);
      stage.style.setProperty("--sc-my", `${event.clientY - rect.top}px`);

      const card = (event.target as HTMLElement | null)?.closest<HTMLElement>(".sc-card");
      stage.querySelectorAll<HTMLElement>(".sc-card.is-tilting").forEach((item) => {
        if (item !== card) {
          item.classList.remove("is-tilting");
          item.style.removeProperty("--sc-rx");
          item.style.removeProperty("--sc-ry");
        }
      });
      if (card) {
        const box = card.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        card.classList.add("is-tilting");
        card.style.setProperty("--sc-rx", `${(-y * 6).toFixed(2)}deg`);
        card.style.setProperty("--sc-ry", `${(x * 8).toFixed(2)}deg`);
      }
    };

    const onMove = (next: PointerEvent) => {
      event = next;
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    const onLeave = () => {
      event = null;
      stage.querySelectorAll<HTMLElement>(".sc-card.is-tilting").forEach((item) => {
        item.classList.remove("is-tilting");
        item.style.removeProperty("--sc-rx");
        item.style.removeProperty("--sc-ry");
      });
    };

    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

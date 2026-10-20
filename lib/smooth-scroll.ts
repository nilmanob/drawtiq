import type { ScrollSmoother } from "gsap/ScrollSmoother";

let activeSmoother: ScrollSmoother | null = null;

export function registerSmoother(smoother: ScrollSmoother | null) {
  activeSmoother = smoother;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollToTop() {
  if (typeof window === "undefined") return;

  if (activeSmoother) {
    activeSmoother.scrollTo(0, true);
    return;
  }

  window.scrollTo({
    top: 0,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

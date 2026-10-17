"use client";

import { useEffect, useRef } from "react";

export function useScrolledReveal() {
  const rafRef = useRef<number>(0);
  const ticking = useRef(false);

  useEffect(() => {
    const check = () => {
      const els = document.querySelectorAll(".reveal") as NodeListOf<HTMLElement>;
      let seen = false;

      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const threshold = 0.15;
        if (rect.top < window.innerHeight - window.scrollY && rect.top > -rect.height * threshold) {
          seen = true;
          const delay = parseFloat(el.dataset.revealDelay || "0");
          gsap?.from(el, {
            opacity: 0,
            y: 34,
            duration: 1,
            ease: "power3.out",
            delay,
            stagger: parseFloat(el.dataset.revealStagger || "0"),
          });
          el.setAttribute("data-revealed", "true");
        }
      });

      if (!seen && ticking.current) {
        ticking.current = false;
      }
    };

    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        rafRef.current = requestAnimationFrame(check);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);
}

export function useReducedMotion() {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      const els = document.querySelectorAll(".reveal, .draw-path") as NodeListOf<HTMLElement>;
      els.forEach((el) => {
        el.style.animationDuration = "0.01ms";
        el.style.transitionDuration = "0.01ms";
      });
    }
  }, []);
}

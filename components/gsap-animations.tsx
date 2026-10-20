"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export function useDrawtiqAnimations() {
  const pathname = usePathname();

  useGSAP(() => {
    const orbitEls = document.querySelectorAll(".art-orbit") as NodeListOf<HTMLElement>;
    const sticker = document.querySelector(".art-sticker") as HTMLElement | null;
    const uiTop = document.querySelector(".ui-top") as HTMLElement | null;
    const uiBottom = document.querySelector(".ui-bottom") as HTMLElement | null;

    gsap.set(".drawn-mark", { clearProps: true });

    if (orbitEls.length > 0) {
      gsap.to(orbitEls[0], {
        scale: 1.06,
        rotation: 1.5,
        transformOrigin: "center center",
        duration: 24,
        ease: "none",
        repeat: -1,
        yoyo: true,
        delay: 0.6,
      });
      gsap.to(orbitEls[1], {
        scale: 1.1,
        rotation: -1.2,
        transformOrigin: "center center",
        duration: 30,
        ease: "none",
        repeat: -1,
        yoyo: true,
        delay: 1.1,
      });
    }

    if (sticker) {
      gsap.to(sticker, {
        rotation: 14,
        y: -6,
        scale: 1.05,
        duration: 4.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 0.9,
      });
    }

    if (uiTop) {
      gsap.to(uiTop, {
        rotation: -3.5,
        duration: 3.6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1.2,
      });
    }

    if (uiBottom) {
      gsap.to(uiBottom, {
        rotation: 4.5,
        duration: 4.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1.5,
      });
    }
  }, { dependencies: [pathname] });
}

export function useRevealOnScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = parseFloat(el.dataset.revealDelay || "0");
            gsap.from(el, {
              opacity: 0,
              y: 34,
              duration: 1,
              ease: "power3.out",
              delay,
              stagger: parseFloat(el.dataset.revealStagger || "0"),
            });
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);
}

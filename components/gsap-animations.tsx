"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export function useDrawtiqAnimations() {
  useGSAP(() => {
    const heroArt = document.querySelector(".hero-art") as HTMLElement | null;
    const drawnPath = document.querySelector(".draw-path") as HTMLElement | null;
    const orbitEls = document.querySelectorAll(".art-orbit") as NodeListOf<HTMLElement>;
    const sticker = document.querySelector(".art-sticker") as HTMLElement | null;
    const uiTop = document.querySelector(".ui-top") as HTMLElement | null;
    const uiBottom = document.querySelector(".ui-bottom") as HTMLElement | null;

    if (heroArt && drawnPath) {
      const path = drawnPath;
      const tl = gsap.timeline({ delay: 0.35, defaults: { duration: 2.4, ease: "power3.out" } });
      tl.from(path, { strokeDashoffset: 1300, stagger: 0.05 });
    }

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
  });
}

export function useRevealOnScroll() {
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
  }, []);
}

export function initSmoothScroll() {
  if (typeof window === "undefined") return;

  document.querySelectorAll('a[href^="#"]:not([href="#"]), a[href^="mailto:"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      if (href.startsWith("#")) {
        const targetId = href.slice(1);
        const target = document.getElementById(targetId);
        if (target) {
          e.preventDefault();
          const headerHeight = 82;
          const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
          window.scrollTo({ top: offsetTop, behavior: "smooth" });
        }
      }
    });
  });
}

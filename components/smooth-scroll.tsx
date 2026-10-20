"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { registerSmoother } from "@/lib/smooth-scroll";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
ScrollTrigger.config({ ignoreMobileResize: true });

/**
 * Page-wide scroll smoothing. Content lives inside #smooth-wrapper >
 * #smooth-content, while fixed UI (header, menu, back-to-top, cursor label and
 * the service preview) stays outside so its positioning is not affected by the
 * content transform.
 */
export default function SmoothScroll() {
  const smootherRef = useRef<ScrollSmoother | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const root = document.documentElement;
    let observer: ResizeObserver | null = null;
    let frame = 0;

    const scheduleRefresh = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => smootherRef.current?.refresh());
    };

    const teardown = () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("load", scheduleRefresh);
      observer?.disconnect();
      observer = null;
      smootherRef.current?.kill();
      smootherRef.current = null;
      registerSmoother(null);
      root.classList.remove("smooth-scroll-ready");
    };

    const setup = () => {
      if (query.matches || smootherRef.current) return;

      const wrapper = document.getElementById("smooth-wrapper");
      const content = document.getElementById("smooth-content");
      if (!wrapper || !content) return;

      smootherRef.current = ScrollSmoother.create({
        wrapper,
        content,
        smooth: 1.1,
        smoothTouch: 0,
        effects: false,
        normalizeScroll: false,
      });

      registerSmoother(smootherRef.current);
      root.classList.add("smooth-scroll-ready");

      if (document.readyState === "complete") {
        scheduleRefresh();
      } else {
        window.addEventListener("load", scheduleRefresh);
      }

      if ("ResizeObserver" in window) {
        observer = new ResizeObserver(scheduleRefresh);
        observer.observe(content);
      }
    };

    const sync = () => {
      if (query.matches) teardown();
      else setup();
    };

    sync();
    query.addEventListener("change", sync);

    return () => {
      query.removeEventListener("change", sync);
      teardown();
    };
  }, []);

  useEffect(() => {
    if (!smootherRef.current) return;

    const frame = window.requestAnimationFrame(() => {
      smootherRef.current?.refresh();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}

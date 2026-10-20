"use client";

import { useEffect, useState } from "react";
import { scrollToTop } from "@/lib/smooth-scroll";

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`back-to-top ${visible ? "visible" : ""}`}
      aria-label="Back to top"
      title="Back to top"
      onClick={scrollToTop}
      tabIndex={visible ? 0 : -1}
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
}

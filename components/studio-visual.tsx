"use client";

import { useEffect, useState } from "react";

/**
 * Studio-section visual: a looping orbital chart.
 *
 * Served as a small WebM/MP4 (about 12x lighter than the source GIF) with a
 * static poster for people who prefer reduced motion, and the GIF kept only as
 * a graceful fallback for browsers without video support.
 */
export function StudioVisual() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  if (reduceMotion) {
    return (
      <img
        className="studio-media"
        src="/assets/studio/drawtiq_orbital_chart_poster.webp"
        alt=""
        aria-hidden="true"
        width={480}
        height={480}
      />
    );
  }

  return (
    <video
      className="studio-media"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="/assets/studio/drawtiq_orbital_chart_poster.webp"
      aria-hidden="true"
    >
      <source src="/assets/studio/drawtiq_orbital_chart.webm" type="video/webm" />
      <source src="/assets/studio/drawtiq_orbital_chart.mp4" type="video/mp4" />
      <img src="/assets/studio/drawtiq_orbital_chart.gif" alt="" aria-hidden="true" />
    </video>
  );
}

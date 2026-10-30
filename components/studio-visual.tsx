"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Studio-section visual: a looping orbital chart.
 *
 * Served as a small WebM/MP4 (about 12x lighter than the source GIF) with a
 * static poster for people who prefer reduced motion, and the GIF kept only as
 * a graceful fallback for browsers without video support.
 *
 * The video only starts downloading when the section is close to the
 * viewport; until then the poster (the same first frame) is shown.
 */
export function StudioVisual() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const start = () => {
      video.preload = "auto";
      void video.play().catch(() => undefined);
    };

    if (!("IntersectionObserver" in window)) {
      start();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            start();
          } else if (!video.paused) {
            video.pause();
          }
        }
      },
      { rootMargin: "300px 0px" }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduceMotion]);

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
      ref={videoRef}
      className="studio-media"
      muted
      loop
      playsInline
      preload="none"
      poster="/assets/studio/drawtiq_orbital_chart_poster.webp"
      aria-hidden="true"
    >
      <source src="/assets/studio/drawtiq_orbital_chart.webm" type="video/webm" />
      <source src="/assets/studio/drawtiq_orbital_chart.mp4" type="video/mp4" />
      <img src="/assets/studio/drawtiq_orbital_chart.gif" alt="" aria-hidden="true" loading="lazy" />
    </video>
  );
}

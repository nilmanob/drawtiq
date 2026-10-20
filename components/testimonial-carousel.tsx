"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Testimonial = {
  quote: string;
  emphasis: string;
  name: string;
  initials: string;
  role: string;
  company: string;
};

// Placeholder client feedback for the design preview.
// Replace with approved testimonials before launch.
const testimonials: Testimonial[] = [
  {
    quote:
      "Drawtiq made the complicated feel obvious. The kind of design that makes you wonder why it was ever any other way.",
    emphasis: "obvious.",
    name: "Maya Chen",
    initials: "MC",
    role: "Head of Product",
    company: "Northwind",
  },
  {
    quote:
      "They didn't just redesign our product — they changed how our whole team thinks about it.",
    emphasis: "changed how our whole team thinks about it.",
    name: "Daniel Okafor",
    initials: "DO",
    role: "Founder",
    company: "Ledgerline",
  },
  {
    quote:
      "Every detail felt considered. We launched two weeks early, and the numbers followed.",
    emphasis: "the numbers followed.",
    name: "Priya Raman",
    initials: "PR",
    role: "VP Marketing",
    company: "Arcadia",
  },
  {
    quote:
      "The rare studio that listens first and designs second. Our brand finally sounds like us.",
    emphasis: "sounds like us.",
    name: "Tomas Berg",
    initials: "TB",
    role: "CEO",
    company: "Fieldnote",
  },
  {
    quote:
      "Fast, thoughtful and genuinely collaborative. It felt like an extension of our own team, not an agency.",
    emphasis: "an extension of our own team",
    name: "Sofia Marino",
    initials: "SM",
    role: "Design Director",
    company: "Kite",
  },
];

export function TestimonialCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const railRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const go = useCallback((next: number) => {
    const count = testimonials.length;
    setActive(((next % count) + count) % count);
  }, []);

  const goManual = useCallback(
    (next: number) => {
      setPaused(true);
      go(next);
    },
    [go]
  );

  useEffect(() => {
    if (paused || engaged || reduceMotion) return;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % testimonials.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, [paused, engaged, reduceMotion]);

  // Keep the active person visible in the horizontally scrolling rail.
  useEffect(() => {
    const rail = railRef.current;
    const tab = tabRefs.current[active];
    if (!rail || !tab || rail.scrollWidth <= rail.clientWidth) return;
    rail.scrollTo({
      left: tab.offsetLeft - rail.clientWidth / 2 + tab.offsetWidth / 2,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [active, reduceMotion]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goManual(active - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goManual(active + 1);
    }
  };

  const testimonial = testimonials[active];
  const [before, after] = testimonial.quote.split(testimonial.emphasis);
  const autoPlaying = !paused && !engaged && !reduceMotion;

  return (
    <section
      className="quote-section section-wrap"
      aria-labelledby="testimonials-title"
      onKeyDown={onKeyDown}
    >
      <div className="quote-head">
        <p className="eyebrow" id="testimonials-title">
          05 / A good partnership
        </p>
        <p className="quote-counter mono">
          <b>{String(active + 1).padStart(2, "0")}</b>
          <span aria-hidden="true"> / </span>
          <span>{String(testimonials.length).padStart(2, "0")}</span>
        </p>
      </div>

      <div
        className="quote-stage"
        onPointerEnter={() => setEngaged(true)}
        onPointerLeave={() => setEngaged(false)}
        onFocusCapture={() => setEngaged(true)}
        onBlurCapture={() => setEngaged(false)}
      >
        <div className="quote-viewport" aria-live={autoPlaying ? "off" : "polite"}>
          <figure className="quote-slide" key={active}>
            <blockquote>
              {before}
              <em>{testimonial.emphasis}</em>
              {after}
            </blockquote>
            <figcaption className="quote-person">
              <span className="quote-avatar" aria-hidden="true">
                {testimonial.initials}
              </span>
              <span className="quote-person-text">
                <b>{testimonial.name}</b>
                <span>
                  {testimonial.role} · {testimonial.company}
                </span>
              </span>
            </figcaption>
          </figure>
        </div>

        <span className="quote-ghost" aria-hidden="true">
          {String(active + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="quote-controls">
        <div className="quote-people" ref={railRef} role="group" aria-label="Choose a testimonial">
          {testimonials.map((person, index) => (
            <button
              key={person.name}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              className="quote-person-tab"
              aria-current={index === active ? "true" : undefined}
              onClick={() => goManual(index)}
            >
              <span className="sr-only">
                Read the testimonial from {person.name}, {person.role} at {person.company}.{" "}
              </span>
              <span className="quote-tab-avatar" aria-hidden="true">
                {person.initials}
              </span>
              <span className="quote-tab-name" aria-hidden="true">
                {person.name.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>

        <div className="quote-nav">
          <div className="quote-progress" aria-hidden="true">
            <i style={{ transform: `scaleX(${(active + 1) / testimonials.length})` }} />
          </div>
          <button
            type="button"
            className="quote-arrow"
            aria-label="Previous testimonial"
            onClick={() => goManual(active - 1)}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            className="quote-arrow"
            aria-label="Next testimonial"
            onClick={() => goManual(active + 1)}
          >
            <span aria-hidden="true">→</span>
          </button>
          {!reduceMotion && (
            <button
              type="button"
              className="quote-pause"
              aria-label={paused ? "Play testimonial slideshow" : "Pause testimonial slideshow"}
              aria-pressed={paused}
              onClick={() => setPaused((current) => !current)}
            >
              <svg
                className="quote-pause-icon"
                viewBox="0 0 12 12"
                aria-hidden="true"
                focusable="false"
              >
                {paused ? (
                  <path d="M3 1.5 10.5 6 3 10.5Z" fill="currentColor" />
                ) : (
                  <>
                    <rect x="2" y="1.5" width="3" height="9" rx="0.6" fill="currentColor" />
                    <rect x="7" y="1.5" width="3" height="9" rx="0.6" fill="currentColor" />
                  </>
                )}
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

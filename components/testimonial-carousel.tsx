"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Testimonial = {
  quote: string;
  emphasis: string;
  number: string;
  label: string;
};

// A small studio manifesto, not invented client feedback.
const testimonials: Testimonial[] = [
  {
    quote:
      "Make the complicated feel obvious. Then make it feel good.",
    emphasis: "obvious.",
    number: "01",
    label: "Clarity",
  },
  {
    quote:
      "Ask the question behind the brief. The answer usually gets simpler.",
    emphasis: "behind the brief.",
    number: "02",
    label: "Questions",
  },
  {
    quote:
      "Ship the thing. A good deck is not the work.",
    emphasis: "Ship the thing.",
    number: "03",
    label: "Shipping",
  },
  {
    quote:
      "Leave the team with something they can use without us.",
    emphasis: "without us.",
    number: "04",
    label: "Handover",
  },
  {
    quote:
      "Care about the details, but don't confuse them with the point.",
    emphasis: "the point.",
    number: "05",
    label: "Details",
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
          05 / What we aim for
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
                {testimonial.number}
              </span>
              <span className="quote-person-text">
                <b>{testimonial.label}</b>
                <span>Studio note · Drawtiq</span>
              </span>
            </figcaption>
          </figure>
        </div>

        <span className="quote-ghost" aria-hidden="true">
          {String(active + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="quote-controls">
        <div className="quote-people" ref={railRef} role="group" aria-label="Choose a studio note">
          {testimonials.map((person, index) => (
            <button
              key={person.number}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              className="quote-person-tab"
              aria-current={index === active ? "true" : undefined}
              onClick={() => goManual(index)}
            >
              <span className="sr-only">
                Read studio note {person.number}: {person.label}.{" "}
              </span>
              <span className="quote-tab-avatar" aria-hidden="true">
                {person.number}
              </span>
              <span className="quote-tab-name" aria-hidden="true">
                {person.label}
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
            aria-label="Previous studio note"
            onClick={() => goManual(active - 1)}
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            className="quote-arrow"
            aria-label="Next studio note"
            onClick={() => goManual(active + 1)}
          >
            <span aria-hidden="true">→</span>
          </button>
          {!reduceMotion && (
            <button
              type="button"
              className="quote-pause"
              aria-label={paused ? "Play studio notes" : "Pause studio notes"}
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`site-header ${isScrolled ? "scrolled" : ""}`} id="top">
      <Link className="site-logo-link" href="/" aria-label="Drawtiq home">
        <img
          src="/assets/Drawtiq-logo.png"
          alt="Drawtiq"
          className="site-logo"
          width={162}
          height={27}
        />
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        <Link href="/work">Work</Link>
        <Link href="/services">Services</Link>
        <Link href="/about">Studio</Link>
        <Link href="/#insights">Insights</Link>
      </nav>
      <div className="header-actions">
        <ThemeToggle />
        <Link href="/contact" className="button button-dark header-cta">
          Start a project <span>↗</span>
        </Link>
      </div>
    </header>
  );
}

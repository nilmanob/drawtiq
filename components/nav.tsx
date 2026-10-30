"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import type { NavItem } from "@/lib/content/cms";

const links = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/insights", label: "Insights" },
  { href: "/careers", label: "Careers" },
];

export function Nav({
  items,
  site,
}: {
  items?: NavItem[];
  site?: {
    logoPath?: string;
    /** White logo shown in dark mode. */
    darkLogoPath?: string;
    logoAlt?: string;
    logoAriaLabel?: string;
    navCtaLabel?: string;
    navCtaHref?: string;
    mobileCtaEyebrow?: string;
    mobileCtaLabel?: string;
  };
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const navigation = items?.length ? items : links.map((link, index) => ({
    ...link,
    id: link.href,
    order_index: index,
    is_visible: true,
    is_external: false,
  }));
  const menuRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", handleKey);
    const firstLink = menuRef.current?.querySelector<HTMLElement>("a");
    firstLink?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <>
      <header className={`site-header ${isScrolled ? "scrolled" : ""}`} id="top">
        <Link className="site-logo-link" href="/" aria-label={site?.logoAriaLabel || "Drawtiq home"}>
          <img
            src={site?.logoPath || "/assets/Drawtiq-logo.png"}
            alt={site?.logoAlt || "Drawtiq"}
            className="site-logo site-logo-on-light"
            width={162}
            height={27}
          />
          <img
            src={site?.darkLogoPath || "/assets/Drawtiq-logo-white.png"}
            alt=""
            aria-hidden="true"
            className="site-logo site-logo-on-dark"
            width={162}
            height={27}
          />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map((link) => (
            link.is_external ? (
              <a key={link.id} href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
            ) : (
              <Link key={link.id} href={link.href}>{link.label}</Link>
            )
          ))}
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <Link href={site?.navCtaHref || "/contact"} className="button button-dark header-cta">
            {site?.navCtaLabel || "Start a project"} <span>↗</span>
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((current) => !current)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>

      <div ref={menuRef} id="mobile-menu" className={`mobile-menu ${open ? "open" : ""}`}>
        <nav aria-label="Mobile navigation">
          {navigation.map((link, index) => (
            <Link key={link.id} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
              <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
            </Link>
          ))}
          <Link href={site?.navCtaHref || "/contact"} className="mobile-contact" onClick={() => setOpen(false)}>
            {site?.mobileCtaEyebrow || "Have a project in mind?"}
            <span>{site?.mobileCtaLabel || "Start a project"} ↗</span>
          </Link>
        </nav>
      </div>
    </>
  );
}

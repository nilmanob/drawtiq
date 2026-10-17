import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function Nav() {
  return (
    <header className="site-header" id="top">
      <Link className="wordmark" href="/" aria-label="Drawtiq home">
        Drawtiq<span>®</span>
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

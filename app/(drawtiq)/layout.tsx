import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { SkipLink } from "@/components/skip-link";
import { MenuToggle } from "@/components/menu-toggle";
import { CursorLabel } from "@/components/cursor-label";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { useDrawtiqAnimations, useRevealOnScroll } from "@/components/gsap-animations";
import { useReducedMotion } from "@/hooks/use-scroll-animations";
import GsapBootstrap from "@/components/gsap-init";

export default function DrawtiqLayout({ children }: { children: ReactNode }) {
  useDrawtiqAnimations();

  useReducedMotion();

  useRevealOnScroll();

  return (
    <ThemeProvider>
      <>
        <SkipLink />
        <Nav />
        <div className="mobile-menu" id="mobile-menu" aria-hidden="true">
          <nav aria-label="Mobile navigation">
            <Link href="/work">Work <i>01</i></Link>
            <Link href="/services">Services <i>02</i></Link>
            <Link href="/about">Studio <i>03</i></Link>
            <Link href="/#insights">Insights <i>04</i></Link>
            <Link href="/contact" className="mobile-contact">
              Have a good idea? <span>Let’s talk ↗</span>
            </Link>
          </nav>
        </div>

        <main>{children}</main>

        <Footer />
        <CursorLabel />
        <GsapBootstrap />
      </>
    </ThemeProvider>
  );
}

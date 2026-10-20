import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { SkipLink } from "@/components/skip-link";
import { CursorLabel } from "@/components/cursor-label";
import { BackToTop } from "@/components/back-to-top";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { ServicePreview } from "@/components/service-preview";
import SmoothScroll from "@/components/smooth-scroll";
import GsapBootstrap from "@/components/gsap-init";
import AnimationsProvider from "@/components/animations-provider";

export default function DrawtiqLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <>
        <SkipLink />
        <Nav />

        <div id="smooth-wrapper">
          <div id="smooth-content">
            {children}
            <Footer />
          </div>
        </div>

        <BackToTop />
        <CursorLabel />
        <ServicePreview />
        <SmoothScroll />
        <GsapBootstrap />
        <AnimationsProvider />
      </>
    </ThemeProvider>
  );
}

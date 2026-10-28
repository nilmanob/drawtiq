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
import { getFooterLinks, getFooterSocial, getGlobalSettings, getNavItems } from "@/lib/content/cms";
import { pageContent } from "@/lib/content/page-content";

export default async function DrawtiqLayout({ children }: { children: ReactNode }) {
  const [{ data: navItems }, { data: footerLinks }, { data: footerSocial }, { data: settings }, site] = await Promise.all([
    getNavItems(), getFooterLinks(), getFooterSocial(), getGlobalSettings(),
    pageContent("global", "site", {
      logoPath: "",
      logoAlt: "Drawtiq",
      logoAriaLabel: "Drawtiq home",
      navCtaLabel: "Start a project",
      navCtaHref: "/contact",
      mobileCtaEyebrow: "Have a project in mind?",
      mobileCtaLabel: "Start a project",
      footerLogoPath: "",
      footerLogoAlt: "Drawtiq",
      footerCtaLabel: "Start a project",
      copyrightSuffix: "Made with care.",
    }),
  ]);
  const navSite = {
    ...site,
    logoPath: site.logoPath || settings?.logo_path || "/assets/Drawtiq-logo.png",
  };
  const footerSite = {
    ...site,
    logoPath: site.footerLogoPath || settings?.footer_logo_path || "/assets/Drawtiq-logo-white.png",
  };
  return (
    <ThemeProvider>
      <>
        <SkipLink />
         <Nav items={navItems} site={navSite} />

        <div id="smooth-wrapper">
          <div id="smooth-content">
            {children}
             <Footer links={footerLinks} social={footerSocial} settings={settings} site={footerSite} />
          </div>
        </div>

        <BackToTop />
        <CursorLabel />
        <ServicePreview />
        <div className="paper-grain" aria-hidden="true" />
        <SmoothScroll />
        <GsapBootstrap />
        <AnimationsProvider />
      </>
    </ThemeProvider>
  );
}

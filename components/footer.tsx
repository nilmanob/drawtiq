import Link from "next/link";
import type { FooterLink, FooterSocial, GlobalSettings } from "@/lib/content/cms";

const fallbackLinks = [
  { label: "Work", href: "/work" }, { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" }, { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" }, { label: "Careers", href: "/careers" },
];

export function Footer({
  links,
  social,
  settings,
  site,
}: {
  links?: FooterLink[];
  social?: FooterSocial[];
  settings?: GlobalSettings | null;
  site?: {
    logoPath?: string;
    logoAlt?: string;
    logoAriaLabel?: string;
    footerCtaLabel?: string;
    copyrightSuffix?: string;
  };
}) {
  const year = new Date().getFullYear();
  const footerLinks = links?.length ? links : fallbackLinks;
  const footerSocial = social?.length
    ? social
    : [
        { label: settings?.contact_email || "hello@drawtiq.studio", href: `mailto:${settings?.contact_email || "hello@drawtiq.studio"}` },
        { label: site?.footerCtaLabel || "Start a project", href: "/contact" },
      ];

  return (
    <footer className="site-footer">
      <div className="section-wrap footer-top">
        <Link className="site-logo-link footer-logo-link" href="/" aria-label={site?.logoAriaLabel || "Drawtiq home"}>
          <img
            src={site?.logoPath || "/assets/Drawtiq-logo-white.png"}
            alt={site?.logoAlt || "Drawtiq"}
            className="site-logo footer-logo"
            width={180}
            height={30}
          />
        </Link>
        <p>{settings?.footer_tagline || <>Small studio.<br />Clear thinking.<br />Work made to be used.</>}</p>
        <div className="footer-links">
          {footerLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </div>
        <div className="footer-social">
          {footerSocial.map((link) => <a key={link.href} href={link.href}>{link.label} ↗</a>)}
        </div>
      </div>
      <div className="section-wrap footer-bottom">
        <span>© <span id="year">{year}</span> {settings?.copyright_holder || "Drawtiq Studio"}. {site?.copyrightSuffix || "Made with care."}</span>
        <span className="mono">{settings?.footer_bottom_text || "DESIGNED TO MOVE YOU."}</span>
      </div>
    </footer>
  );
}

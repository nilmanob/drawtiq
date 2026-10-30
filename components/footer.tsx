import Link from "next/link";
import type { FooterLink, FooterSocial, GlobalSettings } from "@/lib/content/cms";

const fallbackLinks = [
  { label: "Work", href: "/work" }, { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" }, { label: "About", href: "/about" },
  { label: "Insights", href: "/insights" }, { label: "Careers", href: "/careers" },
];

/** "Drawtiq Studio. Made with care." -> "Drawtiq Studio", so the suffix shows once. */
function copyrightHolder(holder: string, suffix: string) {
  let value = holder.trim().replace(/\.$/, "");
  if (suffix && value.toLowerCase().endsWith(suffix.toLowerCase())) {
    value = value.slice(0, value.length - suffix.length).trim().replace(/\.$/, "");
  }
  return value || "Drawtiq Studio";
}

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
  const suffix = (site?.copyrightSuffix || "Made with care.").trim().replace(/\.$/, "");
  const holder = copyrightHolder(settings?.copyright_holder || "Drawtiq Studio", suffix);
  const footerLinks = links?.length ? links : fallbackLinks;
  const footerSocial = social?.length
    ? social
    : [
        { label: settings?.contact_email || "contact@drawtiq.com", href: `mailto:${settings?.contact_email || "contact@drawtiq.com"}` },
        { label: site?.footerCtaLabel || "Start a project", href: "/contact" },
      ];

  return (
    <footer className="site-footer">
      <div className="section-wrap footer-top">
        <Link className="site-logo-link footer-logo-link" href="/" aria-label={site?.logoAriaLabel || "Drawtiq home"}>
          {/* The footer stays black in both themes, so it always uses the white logo. */}
          <img
            src={site?.logoPath || "/assets/Drawtiq-logo-white.png"}
            alt={site?.logoAlt || "Drawtiq"}
            className="site-logo footer-logo"
            width={180}
            height={30}
            loading="lazy"
            decoding="async"
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
        <span>
          © <span id="year">{year}</span> {holder}. {suffix}{" "}
          <svg className="footer-heart" viewBox="0 0 24 24" width="12" height="12" role="img" aria-label="love">
            <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.6 2.6 4.5 6.4 4.1c2.2-.2 4 .9 5.6 2.9 1.6-2 3.4-3.1 5.6-2.9 3.8.4 5.5 4.5 4 7.7C19.5 16.4 12 21 12 21z" />
          </svg>
        </span>
        <span className="mono">{settings?.footer_bottom_text || "DESIGNED TO MOVE YOU."}</span>
      </div>
    </footer>
  );
}

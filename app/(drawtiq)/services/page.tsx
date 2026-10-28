import Link from "next/link";
import { getPublishedServices } from "@/lib/content/data";
import { getServiceIcon, serviceHref } from "@/lib/content/presentation";
import { pageContent, getPageSeo } from "@/lib/content/page-content";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("services");
  return {
    title: seo.title || "Services",
    description:
      seo.description ||
      "UI/UX, digital product design, brand identity, graphic design, motion design, and video editing services by Drawtiq.",
    alternates: { canonical: "/services" },
  };
}

export default async function ServicesPage() {
  const [{ data: services }, hero, note, panels, list, cta] = await Promise.all([
    getPublishedServices(),
    pageContent("services", "hero", { eyebrow: "02 / What we do", heading: "Good thinking.<br /><em>Made useful.</em>", lead: "We can take on the whole thing or just the part you're stuck on. Either way, you work with the people doing the work." }),
    pageContent("services", "note", { drawn: "Strategy, design, and the bits in between.", mono: "STRATEGY × DESIGN × DELIVERY" }),
    pageContent("services", "engagement-panels", {
      items: [
        { number: "ENGAGEMENT / 01", title: "Focused project", body: "A clear brief, a shared timeline, and a defined outcome. Good for a launch, a rebrand, or one knotty product problem.", label: "Discuss a project", href: "/contact" },
        { number: "ENGAGEMENT / 02", title: "Ongoing design partner", body: "A steady pair of hands for teams shipping continuously. We keep the context, so you don't have to brief us from scratch every month.", label: "Explore a partnership", href: "/contact" },
      ],
    }),
    pageContent("services", "list", {
      heading: "Our services",
      emptyText: "Service details are being updated. Please check back soon.",
      tagsFallback: "Strategy · Design · Delivery",
    }),
    pageContent("services", "cta", { heading: "Not sure what you need?", body: "That's normal. Tell us what's stuck and we'll suggest the smallest useful place to start.", label: "Let's talk", href: "/contact" }),
  ]);

  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          {hero.eyebrow}
        </p>
         <h1 dangerouslySetInnerHTML={{ __html: hero.heading }} />
        <p className="lead">
          {hero.lead}
        </p>
      </section>

      <section className="page-content section-wrap">
        <h2 className="sr-only">{list.heading}</h2>
        {services.length > 0 ? (
          <div className="service-list">
            {services.map((service, index) => {
              const icon = getServiceIcon(service.icon);

              return (
                <Link
                  key={service.slug}
                  className="service-row"
                  href={serviceHref(service)}
                >
                  <span className="service-number mono">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className={`service-icon ${icon.className}`}>
                    {icon.glyph}
                  </div>
                  <div className="service-title">
                    <h3>{service.title}</h3>
                    <p>{service.blurb ?? ""}</p>
                  </div>
                  <div className="service-detail">
                    {service.tags.length
                      ? service.tags.join(" · ")
                      : list.tagsFallback}
                  </div>
                  <span className="service-arrow">↗</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="lead">{list.emptyText}</p>
        )}

        <div className="service-note">
          <span className="drawn-underline">{note.drawn}</span>
          <span className="mono">{note.mono}</span>
        </div>

        <div className="service-pair">
          {(panels.items as Array<{ number: string; title: string; body: string; label: string; href: string }>).map((panel) => (
            <article className="service-panel" key={panel.number}>
              <span className="mono">{panel.number}</span>
              <h3>{panel.title}</h3>
              <p>{panel.body}</p>
              <Link href={panel.href} className="text-link">
                {panel.label} <span>↗</span>
              </Link>
            </article>
          ))}
        </div>

        <div className="page-cta">
          <div>
            <h2>{cta.heading}</h2>
            <p>{cta.body}</p>
          </div>
          <Link href={cta.href} className="button button-dark">
            {cta.label} <span>↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

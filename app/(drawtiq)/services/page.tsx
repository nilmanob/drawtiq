import Link from "next/link";
import { getPublishedServices } from "@/lib/content/data";
import { getServiceIcon, serviceHref } from "@/lib/content/presentation";

export const revalidate = 60;

export const metadata = {
  title: "Services",
  description:
    "UI/UX, digital product design, brand identity, graphic design, motion design, and video editing services by Drawtiq.",
};

export default async function ServicesPage() {
  const { data: services } = await getPublishedServices();

  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          02 / What we do
        </p>
        <h1>
          Good thinking.
          <br />
          <em>Made useful.</em>
        </h1>
        <p className="lead">
          We can take on the whole thing or just the part you&apos;re stuck on. Either way, you work with the people doing the work.
        </p>
      </section>

      <section className="page-content section-wrap">
        <h2 className="sr-only">Our services</h2>
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
                      : "Strategy · Design · Delivery"}
                  </div>
                  <span className="service-arrow">↗</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="lead">Service details are being updated. Please check back soon.</p>
        )}

        <div className="service-note">
          <span className="drawn-underline">Strategy, design, and the bits in between.</span>
          <span className="mono">STRATEGY × DESIGN × DELIVERY</span>
        </div>

        <div className="service-pair">
          <article className="service-panel">
            <span className="mono">ENGAGEMENT / 01</span>
            <h3>Focused project</h3>
            <p>A clear brief, a shared timeline, and a defined outcome. Good for a launch, a rebrand, or one knotty product problem.</p>
            <Link href="/contact" className="text-link">
              Discuss a project <span>↗</span>
            </Link>
          </article>
          <article className="service-panel">
            <span className="mono">ENGAGEMENT / 02</span>
            <h3>Ongoing design partner</h3>
            <p>A steady pair of hands for teams shipping continuously. We keep the context, so you don&apos;t have to brief us from scratch every month.</p>
            <Link href="/contact" className="text-link">
              Explore a partnership <span>↗</span>
            </Link>
          </article>
        </div>

        <div className="page-cta">
          <div>
            <h2>Not sure what you need?</h2>
            <p>That&apos;s normal. Tell us what&apos;s stuck and we&apos;ll suggest the smallest useful place to start.</p>
          </div>
          <Link href="/contact" className="button button-dark">
            Let&apos;s talk <span>↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

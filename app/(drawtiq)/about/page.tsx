import Link from "next/link";
import { getAboutSections, getAboutValues, getTeamMembers } from "@/lib/content/cms";
import { getPageSeo } from "@/lib/content/page-content";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("about");
  return {
    title: seo.title || "About the Studio",
    description:
      seo.description ||
      "Drawtiq is an independent design studio for digital products and brand identities that need to work in the real world.",
    alternates: { canonical: "/about" },
  };
}

const fallbackValues = [
  ["01 / CURIOUS", "Ask better questions.", "We challenge assumptions before we commit to a solution."],
  ["02 / CLEAR", "Make the complex feel simple.", "Good design helps people understand what matters and what to do next."],
  ["03 / THOUGHTFUL", "Details have a job.", "Every choice should serve the experience, the message, or the moment."],
  ["04 / OPEN", "Make together.", "We invite feedback early and make progress visible throughout the work."],
  ["05 / PRACTICAL", "Beautiful and useful.", "Creative ambition matters most when it works in the real world."],
  ["06 / CAREFUL", "Leave things better.", "We aim to deliver work teams can understand, use, and build on."],
];
const fallbackTeam = [["Creative direction", "Strategy & visual systems"], ["Product design", "Research & interaction"], ["Brand design", "Identity & art direction"], ["Graphic design", "Campaigns & visual storytelling"]];

const TEAM_ART = [
  <svg viewBox="0 0 160 160" aria-hidden="true">
    <circle cx="80" cy="80" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <path d="M30 80H130M80 30V130M45 45L115 115M115 45L45 115" stroke="currentColor" opacity=".6" />
    <circle cx="80" cy="80" r="16" fill="#c8ff43" />
  </svg>,
  <svg viewBox="0 0 160 160" aria-hidden="true">
    <rect x="36" y="36" width="88" height="88" fill="none" stroke="currentColor" />
    <rect x="52" y="52" width="56" height="56" fill="#c8ff43" />
    <path d="M20 80H140M80 20V140" stroke="currentColor" opacity=".5" />
  </svg>,
  <svg viewBox="0 0 160 160" aria-hidden="true">
    <path d="M80 24L136 128H24Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="80" cy="86" r="25" fill="#c8ff43" />
    <path d="M80 24V128" stroke="currentColor" opacity=".4" />
  </svg>,
  <svg viewBox="0 0 160 160" aria-hidden="true">
    <path d="M40 40H120V120H40Z M56 56H104V104H56Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="80" cy="80" r="12" fill="#c8ff43" />
  </svg>,
];

function mergeSection(base: any, override: any): any {
  if (Array.isArray(base)) return Array.isArray(override) ? override : base;
  if (!base || typeof base !== "object") return override ?? base;
  if (!override || typeof override !== "object" || Array.isArray(override)) return override ?? base;

  const merged: Record<string, any> = { ...base };
  for (const [key, value] of Object.entries(override)) {
    merged[key] = key in base ? mergeSection(base[key], value) : value;
  }
  return merged;
}

function section(sections: any[], key: string, fallback: any) {
  const value = sections.find((item) => item.section_key === key)?.content;
  return value && typeof value === "object" ? mergeSection(fallback, value) : fallback;
}

export default async function AboutPage() {
  const [{ data: sections }, { data: values }, { data: team }] = await Promise.all([getAboutSections(), getAboutValues(), getTeamMembers()]);
  const hero = section(sections, "hero", { eyebrow: "05 / The studio", heading: "Not just how it looks.<br /><em>How it works.</em>", lead: "We make digital products and identities for teams who want the work to do a job—not just look the part." });
  const point = section(sections, "point-of-view", { eyebrow: "Our point of view", heading: "Curiosity, plain talk, and <em>care.</em>", paragraphs: ["We're a small studio. We work directly with founders and product teams, ask a lot of questions, and stay close to the work from first sketch to launch. No handoffs to a mystery team.", "No design theatre. No decks that die in a folder. Just clear decisions and work that ships.", "We do our best work when design is part of the thinking from the beginning—not a layer added at the end."] });
  const valueHeading = section(sections, "values", { eyebrow: "What guides us", heading: "A few things we <em>believe.</em>" });
  const teamHeading = section(sections, "team", { eyebrow: "The people behind the pixels", heading: "Small team. <em>Long attention spans.</em>", note: "A flexible studio model brings the right creative skills together around each project.", disclaimer: "The team grid illustrates the studio disciplines, not named individual staff profiles." });
  const studioBand = section(sections, "studio-band", {
    image: "/assets/about/drawtiq-studio-1600.webp",
    srcSet: "/assets/about/drawtiq-studio-800.webp 800w, /assets/about/drawtiq-studio-1200.webp 1200w, /assets/about/drawtiq-studio-1600.webp 1600w, /assets/about/drawtiq-studio-2000.webp 2000w, /assets/about/drawtiq-studio-2560.webp 2560w",
    sizes: "(min-width: 701px) 240vw, 215vw",
    width: 2752,
    height: 1536,
    alt: "A printed detail of the studio: a plant, desk, and quiet corner in black and white.",
    captionIndex: "Studio study / no. 05",
    captionText: "A quiet corner, in print.",
    sticker: "Made with<br />intention",
  });
  const cta = section(sections, "cta", { heading: "Good work starts with a good question.", paragraph: "Tell us what you're hoping to make better.", button: { label: "Start a conversation", href: "/contact" } });
  const valueItems = values.length ? values.map((item) => [item.index_label, item.title, item.body]) : fallbackValues;
  const teamItems = team.length ? team.map((item) => [item.role, item.discipline || ""]) : fallbackTeam;
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

      <figure className="studio-band">
        <img
          className="studio-band-media"
          src={studioBand.image}
          srcSet={studioBand.srcSet || undefined}
          sizes={studioBand.sizes || undefined}
          width={studioBand.width}
          height={studioBand.height}
          alt={studioBand.alt}
          loading="lazy"
          decoding="async"
        />
        <figcaption className="studio-band-caption">
          <span className="mono">
            <span className="status-dot" aria-hidden="true"></span>
            {studioBand.captionIndex}
          </span>
          <span className="mono">{studioBand.captionText}</span>
        </figcaption>
      </figure>

      <section className="page-content section-wrap">
        <div className="about-split">
          <div className="about-art">
            <div className="art-grid"></div>
            <svg viewBox="0 0 400 400" role="img" aria-label="Drawtiq geometric studio mark">
              <path
                d="M70 200 C70 70 330 70 330 200 S70 330 70 200Z M120 200 C120 120 280 120 280 200 S120 280 120 200Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path d="M200 70V330M70 200H330" stroke="currentColor" strokeDasharray="3 7" opacity=".4" />
              <circle cx="200" cy="200" r="12" fill="#c8ff43" />
            </svg>
            <div className="art-sticker" dangerouslySetInnerHTML={{ __html: `${studioBand.sticker}<span>✳</span>` }} />
          </div>
          <div className="service-detail-copy">
            <p className="eyebrow">{point.eyebrow}</p>
            <h2 dangerouslySetInnerHTML={{ __html: point.heading }} />
            {(point.paragraphs as string[]).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        </div>

        <div className="section-heading" style={{ marginTop: "100px" }}>
          <div>
            <p className="eyebrow">{valueHeading.eyebrow}</p>
            <h2 dangerouslySetInnerHTML={{ __html: valueHeading.heading }} />
          </div>
        </div>

        <div className="value-grid">
          {valueItems.map(([index, title, body]) => <article className="value-card" key={index}><span className="mono">{index}</span><h3>{title}</h3><p>{body}</p></article>)}
        </div>

        <div className="section-heading" style={{ marginTop: "100px" }}>
          <div>
            <p className="eyebrow">{teamHeading.eyebrow}</p>
            <h2 dangerouslySetInnerHTML={{ __html: teamHeading.heading }} />
          </div>
          <p className="heading-note">{teamHeading.note}</p>
        </div>

        <div className="team-grid">
          {teamItems.map(([role, discipline], index) => (
            <article className="team-card" key={`${role}-${index}`}>
              <div className="team-art">{TEAM_ART[index % TEAM_ART.length]}</div>
              <div className="team-meta">
                <h3>{role}</h3>
                <p>{discipline}</p>
              </div>
            </article>
          ))}
        </div>

        <p className="team-note">
          {teamHeading.disclaimer}
        </p>

        <div className="page-cta">
          <div>
            <h2>{cta.heading}</h2>
            <p>{cta.paragraph}</p>
          </div>
          <Link href={cta.button.href} className="button button-dark">
            {cta.button.label} <span>↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

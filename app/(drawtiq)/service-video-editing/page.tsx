import Link from "next/link";
import { Faq } from "@/components/faq";

const deliverables = [
  {
    n: "01",
    title: "Story & structure edit",
    body: "We find the spine of the film — what it is really about — and cut everything that does not serve it.",
  },
  {
    n: "02",
    title: "Pacing & rhythm",
    body: "The cut that makes people stay: timing, pauses, and momentum shaped to the audience and the platform.",
  },
  {
    n: "03",
    title: "Color grading",
    body: "A consistent look that supports the story and makes footage from every source feel like one film.",
  },
  {
    n: "04",
    title: "Sound design & mix",
    body: "Clean dialogue, considered music, and texture that carries the emotion half of the picture.",
  },
  {
    n: "05",
    title: "Titles & motion graphics",
    body: "Lower thirds, captions, and animated type that match your brand and stay readable at any size.",
  },
  {
    n: "06",
    title: "Social cutdowns & formats",
    body: "Square, vertical, and wide edits designed natively for each placement — not just resized after the fact.",
  },
];

const faqs = [
  {
    q: "Do you work from our existing footage?",
    a: "Absolutely. Send us the raw files and a little context, and we will shape the story from what you already have.",
  },
  {
    q: "Can you handle a full shoot-to-edit project?",
    a: "We can lead the edit and post-production, and bring trusted collaborators in for filming when the project needs it.",
  },
  {
    q: "How many revisions are included?",
    a: "Every engagement includes structured review rounds. We share work early so feedback stays focused and the final cut lands fast.",
  },
];

export const metadata = {
  title: "Video Editing",
  description:
    "Video editing, colour, sound, and motion graphics for brands and campaigns by Drawtiq.",
};

export default function ServiceVideoEditingPage() {
  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          06 / Service detail
        </p>
        <h1>Cut, pace, and polish the story.</h1>
        <p className="lead">
          The shoot gives you footage. The edit decides what it means. We shape raw material into films that hold
          attention and land the point.
        </p>
        <div className="hero-actions" style={{ marginTop: "30px" }}>
          <Link href="/contact" className="button button-dark">
            Start a project <span>↗</span>
          </Link>
          <Link href="#deliverables" className="text-link">
            Explore deliverables <span>↓</span>
          </Link>
        </div>
      </section>

      <section className="section-wrap">
        <div className="service-visual visual-video">
          <div className="video-preview">
            <span className="video-play">▶</span>
            <div className="video-lines">
              <i></i>
              <i></i>
              <i></i>
            </div>
          </div>
          <div className="video-timeline">
            <span className="video-track-head mono">TIMELINE</span>
            <div className="video-track">
              <span className="clip clip-a"></span>
              <span className="clip clip-b"></span>
              <span className="clip clip-c"></span>
              <span className="playhead"></span>
            </div>
            <div className="video-track thin">
              <span className="clip clip-d"></span>
              <span className="clip clip-e"></span>
            </div>
          </div>
          <span className="visual-label mono">POST-PRODUCTION / DRAWTIQ</span>
        </div>
      </section>

      <section className="page-content section-wrap">
        <div className="service-detail-grid">
          <div className="service-detail-copy">
            <p className="eyebrow">A considered approach</p>
            <h2>An edit that makes people <em>stay.</em></h2>
            <p>
              Good video is not a filming problem — it is a story problem. We start with structure, decide what the
              piece is about, and cut until only the essential remains.
            </p>
            <p>
              Then we finish it: colour, sound, and titles that make the story feel considered from first frame to
              last, on every screen it will play.
            </p>
            <Link href="/work" className="text-link">
              See the work <span>↗</span>
            </Link>
          </div>
          <div id="deliverables">
            <p className="eyebrow">What’s included</p>
            <div className="deliverables">
              {deliverables.map((item) => (
                <article className="deliverable" key={item.n}>
                  <span className="mono">{item.n}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="service-pair">
          <article className="service-panel">
            <span className="mono">01 / ASSEMBLE</span>
            <h3>Structure the story</h3>
            <p>We log, select, and assemble a rough cut that reveals what the film wants to be.</p>
          </article>
          <article className="service-panel">
            <span className="mono">02 / FINISH</span>
            <h3>Colour, sound & delivery</h3>
            <p>We polish the picture and mix, then deliver every format your channels need.</p>
          </article>
        </div>

        <div className="section-heading" style={{ marginTop: "100px" }}>
          <div>
            <p className="eyebrow">A few common questions</p>
            <h2>Good to <em>know.</em></h2>
          </div>
        </div>

        <Faq items={faqs} />

        <div className="page-cta">
          <div>
            <h2>Want movement baked in?</h2>
            <p>Explore motion design and animation with Drawtiq.</p>
          </div>
          <Link href="/service-motion-design" className="button button-dark">
            Explore service <span>↗</span>
          </Link>
        </div>
      </section>
    </main>
  );
}

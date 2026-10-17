import Link from "next/link";

export const metadata = {
  title: "Contact | Drawtiq",
  description:
    "Start a conversation with Drawtiq about UI/UX design, branding, or graphic design.",
};

export default function ContactPage() {
  return (
    <main id="main">
      <section className="page-hero section-wrap">
        <p className="eyebrow">
          <span className="status-dot"></span>
          06 / Start a conversation
        </p>
        <h1>Have a good idea?<br /><em>Let’s make it matter.</em></h1>
        <p className="lead">
          Tell us what you’re working on. We’ll bring the questions, the thinking, and the craft to help move it forward.
        </p>
      </section>

      <section className="section-wrap contact-page-grid">
        <div className="contact-page-copy">
          <p className="eyebrow">Your turn</p>
          <h2>Good things start with <em>a note.</em></h2>
          <p>
            You don’t need a perfect brief. A little context about the idea, the challenge, and what success could look
            like is a great place to start.
          </p>
          <div className="contact-detail">
            <span className="mono">EMAIL US</span>
            <a href="mailto:hello@drawtiq.studio">hello@drawtiq.studio ↗</a>
          </div>
          <div className="contact-detail">
            <span className="mono">BOOK A CONVERSATION</span>
            <p>Choose a time that works for you.</p>
            <a href="https://cal.com/" target="_blank" rel="noreferrer">Open booking page ↗</a>
          </div>
          <p className="booking-note">
            Booking URL and email are placeholders. Replace them with your confirmed contact details before launch.
          </p>
        </div>

        <form className="contact-form-page" id="project-form">
          <div className="form-heading">
            <span className="mono">PROJECT INQUIRY / 001</span>
            <span>Share as much or as little as you know.</span>
          </div>

          <div className="form-two">
            <label>Your name
              <input name="name" autoComplete="name" placeholder="How should we call you?" required />
            </label>
            <label>Email address
              <input name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
            </label>
          </div>

          <div className="form-two">
            <label>What do you need?
              <select name="service" required defaultValue="">
                <option value="" disabled>Select a service</option>
                <option>UI/UX & Product Design</option>
                <option>Brand Identity</option>
                <option>Graphic Design</option>
                <option>Website Design</option>
                <option>Ongoing design support</option>
                <option>A bit of everything</option>
              </select>
            </label>
            <label>Estimated budget
              <select name="budget" defaultValue="">
                <option value="">Choose a range (optional)</option>
                <option>Under $1,000</option>
                <option>$1,000–$3,000</option>
                <option>$3,000–$7,500</option>
                <option>$7,500+</option>
                <option>Let's discuss</option>
              </select>
            </label>
          </div>

          <label>A little about the project
            <textarea name="message" rows={4} placeholder="The idea, the challenge, the big ambition…" required />
          </label>

          <label>Upload a brief (optional)
            <input type="file" name="brief" accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg" />
          </label>

          <button className="button button-accent form-submit" type="submit">
            Prepare email <span>↗</span>
          </button>
          <p className="form-hint" id="form-hint">
            This form prepares an email draft. It does not upload or store your file.
          </p>
        </form>
      </section>
    </main>
  );
}

import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="section-wrap footer-top">
        <Link className="site-logo-link footer-logo-link" href="/" aria-label="Drawtiq home">
          <img
            src="/assets/Drawtiq-logo-white.png"
            alt="Drawtiq"
            className="site-logo footer-logo"
            width={180}
            height={30}
          />
        </Link>
        <p>Small studio.<br />Clear thinking.<br />Work made to be used.</p>
        <div className="footer-links">
          <Link href="/work">Work</Link>
          <Link href="/services">Services</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/about">About</Link>
          <Link href="/insights">Insights</Link>
          <Link href="/careers">Careers</Link>
        </div>
        <div className="footer-social">
          <a href="mailto:hello@drawtiq.studio">hello@drawtiq.studio ↗</a>
          <Link href="/contact">Start a project ↗</Link>
        </div>
      </div>
      <div className="section-wrap footer-bottom">
        <span>© <span id="year">{year}</span> Drawtiq Studio. Made with care.</span>
        <span className="mono">DESIGNED TO MOVE YOU.</span>
      </div>
    </footer>
  );
}

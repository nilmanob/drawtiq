import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="section-wrap footer-top">
        <Link className="wordmark footer-wordmark" href="/">
          Drawtiq<span>®</span>
        </Link>
        <p>Thoughtful by design.<br></br>Distinctive by nature.</p>
        <div className="footer-links">
          <Link href="/work">Work</Link>
          <Link href="/services">Services</Link>
          <Link href="/about">Studio</Link>
          <Link href="/#insights">Insights</Link>
        </div>
        <div className="footer-social">
          <a href="https://www.behance.net/" target="_blank" rel="noreferrer">Behance ↗</a>
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn ↗</a>
          <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram ↗</a>
        </div>
      </div>
      <div className="section-wrap footer-bottom">
        <span>© <span id="year">{year}</span> Drawtiq Studio. Made with intention.</span>
        <span className="mono">DESIGNED TO MOVE YOU.</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}

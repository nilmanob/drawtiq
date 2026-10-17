import type { ReactNode } from "react";
import Script from "next/script";
import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";
import { SkipLink } from "@/components/skip-link";
import { MenuToggle } from "@/components/menu-toggle";
import { CursorLabel } from "@/components/cursor-label";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DrawtiqLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <>
        <SkipLink />
        <Nav />
        <div className="mobile-menu" id="mobile-menu" aria-hidden="true">
          <nav aria-label="Mobile navigation">
            <Link href="/work">Work <i>01</i></Link>
            <Link href="/services">Services <i>02</i></Link>
            <Link href="/about">Studio <i>03</i></Link>
            <Link href="/#insights">Insights <i>04</i></Link>
            <Link href="/contact" className="mobile-contact">
              Have a good idea? <span>Let’s talk ↗</span>
            </Link>
          </nav>
        </div>

        <main>{children}</main>

        <Footer />
        <CursorLabel />
        <Script
          id="drawtiq-init"
          strategy="afterInteractive"
        />
        <Script
          id="drawtiq-form-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                const form = document.getElementById('project-form');
                const hint = document.getElementById('form-hint');
                if (form) form.addEventListener('submit', e => {
                  e.preventDefault();
                  if (!form.reportValidity()) return;
                  const data = new FormData(form);
                  const subject = encodeURIComponent('Drawtiq project inquiry — ' + data.get('service'));
                  const body = encodeURIComponent(
                    'Hello Drawtiq,\\n\\n' +
                    'Name: ' + data.get('name') + '\\n' +
                    'Email: ' + data.get('email') + '\\n' +
                    'Service: ' + data.get('service') + '\\n' +
                    (data.get('budget') ? 'Budget: ' + data.get('budget') + '\\n' : '') +
                    (data.get('brief') && data.get('brief').name ? 'Brief file selected: ' + data.get('brief').name + ' (please attach it manually in your email app)\\n' : '') + '\\n' +
                    'Project details:\\n' + data.get('message') + '\\n\\nSent from the Drawtiq website.'
                  );
                  hint.textContent = 'Opening your email app…';
                  window.location.href = 'mailto:hello@drawtiq.studio?subject=' + subject + '&body=' + body;
                });
                const yearEl = document.getElementById('year');
                if (yearEl) yearEl.textContent = new Date().getFullYear();
              })();
            `,
          }}
        />
      </>
    </ThemeProvider>
  );
}

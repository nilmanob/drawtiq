import type { ReactNode } from "react";
import Script from "next/script";

export default function WorkLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Script
        id="filter-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              const filters = document.querySelectorAll('[data-filter]');
              const projects = document.querySelectorAll('[data-category]');
              filters.forEach(button => button.addEventListener('click', () => {
                const category = button.dataset.filter;
                filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
                projects.forEach(project => {
                  project.hidden = category !== 'all' && project.dataset.category !== category;
                });
              }));
            })();
          `,
        }}
      />
    </>
  );
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Re-runs the small DOM scripts that depend on the current page's markup
 * (contact form and portfolio filters) after every client-side navigation.
 * GSAP itself is imported where it is used instead of being loaded from a CDN.
 */
export default function GsapBootstrap() {
  const pathname = usePathname();

  useEffect(() => {
    const load = () => {
      document.getElementById("drawtiq-form-script")?.remove();
      document.getElementById("drawtiq-filter-script")?.remove();

      const formScript = document.createElement("script");
      formScript.id = "drawtiq-form-script";
      formScript.textContent = `
        (() => {
          const form = document.getElementById("project-form");
          const hint = document.getElementById("form-hint");
          if (!form || !hint) return;
          form.addEventListener("submit", (e) => {
            e.preventDefault();
            if (!form.reportValidity()) return;
            const data = new FormData(form);
            const subject = encodeURIComponent("Drawtiq project inquiry — " + data.get("service"));
            const body = encodeURIComponent(
              "Hello Drawtiq,\\n\\n" +
              "Name: " + data.get("name") + "\\n" +
              "Email: " + data.get("email") + "\\n" +
              "Service: " + data.get("service") + "\\n" +
              (data.get("budget") ? "Budget: " + data.get("budget") + "\\n" : "") +
              (data.get("brief") && data.get("brief").name ? "Brief file selected: " + data.get("brief").name + " (please attach it manually in your email app)\\n" : "") +
              "\\nProject details:\\n" + data.get("message") + "\\n\\nSent from the Drawtiq website."
            );
            hint.textContent = "Opening your email app…";
            window.location.href = "mailto:hello@drawtiq.studio?subject=" + subject + "&body=" + body;
          });
          const yearEl = document.getElementById("year");
          if (yearEl) yearEl.textContent = new Date().getFullYear();
        })();
      `;

      const filterScript = document.createElement("script");
      filterScript.id = "drawtiq-filter-script";
      filterScript.textContent = `
        (() => {
          const filters = document.querySelectorAll("[data-filter]");
          const projects = document.querySelectorAll("[data-category]");
          filters.forEach((button) =>
            button.addEventListener("click", () => {
              const category = button.dataset.filter;
              filters.forEach((item) =>
                item.setAttribute("aria-pressed", String(item === button))
              );
              projects.forEach((project) => {
                project.hidden = category !== "all" && project.dataset.category !== category;
              });
            })
          );
        })();
      `;

      document.head.appendChild(formScript);
      document.head.appendChild(filterScript);
    };

    load();
  }, [pathname]);

  return null;
}

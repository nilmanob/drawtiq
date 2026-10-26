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
          const loadedAt = Date.now();

          form.onsubmit = async (e) => {
            e.preventDefault();
            if (!form.reportValidity()) return;
            if (form.dataset.submitting === "true") return;

            const data = new FormData(form);
            const payload = {
              name: String(data.get("name") || ""),
              email: String(data.get("email") || ""),
              service: String(data.get("service") || ""),
              budget: String(data.get("budget") || ""),
              message: String(data.get("message") || ""),
              website: String(data.get("website") || ""),
              elapsedMs: Date.now() - loadedAt,
            };
            const button = form.querySelector('button[type="submit"]');
            const originalButton = button ? button.innerHTML : "";

            form.dataset.submitting = "true";
            if (button) {
              button.disabled = true;
              button.setAttribute("aria-busy", "true");
              button.textContent = "Sending…";
            }
            hint.textContent = "Sending your inquiry…";

            const restoreButton = () => {
              if (!button) return;
              button.disabled = false;
              button.removeAttribute("aria-busy");
              button.innerHTML = originalButton;
            };

            try {
              const response = await fetch("/api/inquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              let result = null;
              try { result = await response.json(); } catch {}

              if (response.ok) {
                form.reset();
                hint.textContent = "Thanks — your inquiry is with us. We usually reply within 2 business days.";
                if (button) {
                  button.innerHTML = "Inquiry sent <span>✓</span>";
                  window.setTimeout(() => {
                    form.dataset.submitting = "false";
                    restoreButton();
                  }, 4000);
                } else {
                  form.dataset.submitting = "false";
                }
                return;
              }

              if (response.status === 429) {
                hint.textContent = "Too many inquiries from this connection. Please try again later or email hello@drawtiq.studio.";
              } else if (response.status === 503) {
                hint.textContent = "Online inquiries are not available right now. Please email hello@drawtiq.studio.";
              } else {
                const fields = result && result.fields ? Object.values(result.fields).flat() : [];
                hint.textContent = fields[0] || (result && result.error) || "We could not send your inquiry. Please try again or email hello@drawtiq.studio.";
              }
            } catch {
              hint.textContent = "We could not reach the server. Please try again or email hello@drawtiq.studio.";
            }

            form.dataset.submitting = "false";
            restoreButton();
          };

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

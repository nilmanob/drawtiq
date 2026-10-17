"use client";

import { useEffect } from "react";

export default function GsapBootstrap() {
  useEffect(() => {
    const load = () => {
      const ids = [
        "drawtiq-global",
        "drawtiq-scrolltrigger",
        "drawtiq-form-script",
        "drawtiq-filter-script",
      ];

      for (const existing of document.querySelectorAll("script[id]")) {
        if (ids.includes(existing.getAttribute("id") || "")) {
          existing.remove();
        }
      }

      const global = document.createElement("script");
      global.id = "drawtiq-global";
      global.async = true;
      global.src = "https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js";

      const trigger = document.createElement("script");
      trigger.id = "drawtiq-scrolltrigger";
      trigger.async = true;
      trigger.src = "https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js";

      const reveal = document.createElement("script");
      reveal.id = "drawtiq-reveal";
      reveal.textContent = `
        (() => {
          if (typeof gsap === "undefined") return;
          gsap.registerPlugin(gsap.ScrollTrigger);
          document.querySelectorAll(".reveal").forEach((el) => {
            const delay = parseFloat(el.dataset.revealDelay || "0");
            gsap.from(el, {
              opacity: 0,
              y: 34,
              duration: 1,
              ease: "power3.out",
              delay,
              stagger: parseFloat(el.dataset.revealStagger || "0"),
            });
          });
        })();
      `;

      const form = document.getElementById("drawtiq-form-script");
      if (form) form.remove();
      const formScript = document.createElement("script");
      formScript.id = "drawtiq-form-script";
      formScript.async = true;
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
              "Hello Drawtiq,\n\n" +
              "Name: " + data.get("name") + "\n" +
              "Email: " + data.get("email") + "\n" +
              "Service: " + data.get("service") + "\n" +
              (data.get("budget") ? "Budget: " + data.get("budget") + "\n" : "") +
              (data.get("brief") && data.get("brief").name ? "Brief file selected: " + data.get("brief").name + " (please attach it manually in your email app)\n" : "") +
              "\nProject details:\n" + data.get("message") + "\n\nSent from the Drawtiq website."
            );
            hint.textContent = "Opening your email app…";
            window.location.href = "mailto:hello@drawtiq.studio?subject=" + subject + "&body=" + body;
          });
          const yearEl = document.getElementById("year");
          if (yearEl) yearEl.textContent = new Date().getFullYear();
        })();
      `;

      const filter = document.getElementById("drawtiq-filter-script");
      if (filter) filter.remove();
      const filterScript = document.createElement("script");
      filterScript.id = "drawtiq-filter-script";
      filterScript.async = true;
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

      document.head.appendChild(global);
      document.head.appendChild(trigger);
      document.head.appendChild(reveal);
      document.head.appendChild(formScript);
      document.head.appendChild(filterScript);
    };

    load();
  }, []);

  return null;
}

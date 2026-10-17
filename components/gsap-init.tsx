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
        "drawtiq-case-script",
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

      const caseScript = document.getElementById("drawtiq-case-script");
      if (caseScript) caseScript.remove();
      const caseScriptEl = document.createElement("script");
      caseScriptEl.id = "drawtiq-case-script";
      caseScriptEl.async = true;
      caseScriptEl.textContent = `
        (() => {
          const params = new URLSearchParams(window.location.search);
          const key = params.get("project") || "northstar";
          const data = {
            northstar: { title: "Northstar Finance", sub: "Making money feel human.", lead: "A calmer, clearer way to understand your financial picture and take the next step with confidence.", discipline: "UI/UX · Product design", industry: "Fintech", scope: "Product strategy, UX, UI", brand: "northstar", number: "$248,590", challenge: "Financial information can be powerful, but dense dashboards often make the next step hard to see. This concept explores how hierarchy, language, and a calmer interface can make the experience feel more approachable." },
            bloomwell: { title: "Bloomwell", sub: "A softer kind of wellness.", lead: "An approachable visual identity and digital experience for everyday wellbeing.", discipline: "Brand identity · Digital design", industry: "Wellness", scope: "Identity, art direction, UI", brand: "bloomwell", number: "b.", challenge: "Wellness can feel crowded with competing messages. This concept explores a quieter, more human visual language built around warmth, confidence, and clarity." },
            formObject: { title: "Form & Object", sub: "Less, but better.", lead: "A considered visual world for everyday objects that deserve a little more thought.", discipline: "Graphic design · Art direction", industry: "E-commerce", scope: "Campaign, packaging, art direction", brand: "FORM / OBJECT", number: "FORM", challenge: "A product range needs to feel cohesive without losing the character of individual objects. This concept uses restrained typography and tactile composition to bring a point of view to the collection." },
            orbit: { title: "Orbit Workspace", sub: "Less admin. More momentum.", lead: "A more coherent workspace experience designed to help teams understand what needs attention.", discipline: "UI/UX · Product design", industry: "SaaS", scope: "UX flows, dashboard UI", brand: "orbit.", number: "18", challenge: "When team information is scattered across multiple views, it can be hard to see progress and priorities. This concept organizes key signals into a clearer, more scannable dashboard." },
            goodkind: { title: "Goodkind", sub: "Care, made visible.", lead: "A warm, flexible identity direction for a purpose-led community brand.", discipline: "Brand identity · Graphic design", industry: "Community", scope: "Identity, guidelines, campaign", brand: "goodkind", number: "g.", challenge: "Purpose-led brands need to feel distinctive and welcoming while remaining consistent across many touchpoints. This concept balances a friendly tone with a practical identity system." },
            fieldNotes: { title: "Field Notes", sub: "Make room to think.", lead: "An editorial design concept for sharing ideas, observations, and work in progress.", discipline: "Graphic design · Editorial", industry: "Publishing", scope: "Art direction, typography, layouts", brand: "FIELD NOTES", number: "006", challenge: "A collection of ideas needs a visual rhythm that supports reading instead of competing with it. This concept uses typography and a flexible grid to make each note feel part of one system." }
          };
          const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
          const d = data[key] || data.northstar;
          set("case-title", d.title + " — " + d.sub);
          set("case-lead", d.lead);
          set("case-discipline", d.discipline);
          set("case-industry", d.industry);
          set("case-scope", d.scope);
          set("case-brand", d.brand);
          set("case-number", d.number);
          set("case-challenge", d.challenge);
          document.title = d.title + " — Case Study | Drawtiq";
        })();
      `;

      document.head.appendChild(global);
      document.head.appendChild(trigger);
      document.head.appendChild(reveal);
      document.head.appendChild(formScript);
      document.head.appendChild(filterScript);
      document.head.appendChild(caseScript);
    };

    load();
  }, []);

  return null;
}

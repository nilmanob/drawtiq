import type { ReactNode } from "react";
import Script from "next/script";

const cases = {
  northstar: {
    title: "Northstar Finance",
    sub: "Making money feel human.",
    lead: "A calmer, clearer way to understand your financial picture and take the next step with confidence.",
    discipline: "UI/UX · Product design",
    industry: "Fintech",
    scope: "Product strategy, UX, UI",
    brand: "northstar",
    number: "$248,590",
    challenge:
      "Financial information can be powerful, but dense dashboards often make the next step hard to see. This concept explores how hierarchy, language, and a calmer interface can make the experience feel more approachable.",
  },
  bloomwell: {
    title: "Bloomwell",
    sub: "A softer kind of wellness.",
    lead: "An approachable visual identity and digital experience for everyday wellbeing.",
    discipline: "Brand identity · Digital design",
    industry: "Wellness",
    scope: "Identity, art direction, UI",
    brand: "bloomwell",
    number: "b.",
    challenge:
      "Wellness can feel crowded with competing messages. This concept explores a quieter, more human visual language built around warmth, confidence, and clarity.",
  },
  formObject: {
    title: "Form & Object",
    sub: "Less, but better.",
    lead: "A considered visual world for everyday objects that deserve a little more thought.",
    discipline: "Graphic design · Art direction",
    industry: "E-commerce",
    scope: "Campaign, packaging, art direction",
    brand: "FORM / OBJECT",
    number: "FORM",
    challenge:
      "A product range needs to feel cohesive without losing the character of individual objects. This concept uses restrained typography and tactile composition to bring a point of view to the collection.",
  },
  orbit: {
    title: "Orbit Workspace",
    sub: "Less admin. More momentum.",
    lead: "A more coherent workspace experience designed to help teams understand what needs attention.",
    discipline: "UI/UX · Product design",
    industry: "SaaS",
    scope: "UX flows, dashboard UI",
    brand: "orbit.",
    number: "18",
    challenge:
      "When team information is scattered across multiple views, it can be hard to see progress and priorities. This concept organizes key signals into a clearer, more scannable dashboard.",
  },
  goodkind: {
    title: "Goodkind",
    sub: "Care, made visible.",
    lead: "A warm, flexible identity direction for a purpose-led community brand.",
    discipline: "Brand identity · Graphic design",
    industry: "Community",
    scope: "Identity, guidelines, campaign",
    brand: "goodkind",
    number: "g.",
    challenge:
      "Purpose-led brands need to feel distinctive and welcoming while remaining consistent across many touchpoints. This concept balances a friendly tone with a practical identity system.",
  },
  fieldNotes: {
    title: "Field Notes",
    sub: "Make room to think.",
    lead: "An editorial design concept for sharing ideas, observations, and work in progress.",
    discipline: "Graphic design · Editorial",
    industry: "Publishing",
    scope: "Art direction, typography, layouts",
    brand: "FIELD NOTES",
    number: "006",
    challenge:
      "A collection of ideas needs a visual rhythm that supports reading instead of competing with it. This concept uses typography and a flexible grid to make each note feel part of one system.",
  },
};

type CaseData = (typeof cases)[keyof typeof cases];

const getCaseData = (project: string): CaseData => (cases[project as keyof typeof cases] || cases.northstar);

export default function CaseStudyLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Script
        id="case-study-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (() => {
              const pathname = window.location.pathname;
              const pathSlug = pathname.split('/').filter(Boolean).pop();
              const params = new URLSearchParams(window.location.search);
              const paramKey = params.get('project');
              const key = paramKey || (pathSlug && pathSlug !== 'case-study' ? pathSlug : 'northstar');
              const allCases = ${JSON.stringify(cases)};
              const normalizedKey = key === 'form-object' ? 'formObject' : key === 'field-notes' ? 'fieldNotes' : key;
              const data = allCases[normalizedKey] || allCases.northstar;
              const set = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
              set('case-title', data.title + ' — ' + data.sub);
              set('case-lead', data.lead);
              set('case-discipline', data.discipline);
              set('case-industry', data.industry);
              set('case-scope', data.scope);
              set('case-brand', data.brand);
              set('case-number', data.number);
              set('case-challenge', data.challenge);
              document.title = data.title + ' — Case Study | Drawtiq';
            })();
          `,
        }}
      />
    </>
  );
}

-- Initial homepage composition and editorial content.
--
-- The homepage reads public.homepage_sections (not page_sections), so these
-- rows are required to make the current homepage copy editable in /admin/cms.
-- All nine visible sections are seeded in their current display order.
--
-- Idempotent: ON CONFLICT (section_key) DO NOTHING preserves any homepage
-- section an editor has already customised.

insert into public.homepage_sections
  (section_key, content, order_index, is_visible)
values

(
  'hero',
  $json${
    "eyebrow": "Independent design studio",
    "heading": "Make it meaningful.<br />Make it move.",
    "intro": "We help small teams turn complicated ideas into products and brands that feel simple to use.",
    "ctaPrimary": { "label": "Start a project", "href": "/contact" },
    "ctaSecondary": { "label": "Explore selected work", "href": "/work" },
    "footnote": "No big brief needed. A sentence is enough.",
    "artIndex": "DT—001 / BRAND IN MOTION",
    "artSticker": "Ideas<br />into impact",
    "floatingUiTop": { "label": "Concept / 04", "value": "Clarity, by design." },
    "floatingUiBottom": { "value": "FORM FOLLOWS FEELING" },
    "artCaption": "FIG 01. A SYSTEM OF POSSIBILITY"
  }$json$::jsonb,
  10,
  true
),
(
  'trust-strip',
  $json${
    "label": "Good work comes from",
    "principles": [
      "Curiosity",
      "Plain talk",
      "Good questions",
      "Strong opinions",
      "Loose grip",
      "Real deadlines",
      "Care",
      "Follow-through"
    ]
  }$json$::jsonb,
  20,
  true
),
(
  'work-section',
  $json${
    "eyebrow": "01 / Selected work",
    "heading": "Thoughtful work.<br />Made to be used.",
    "cta": { "label": "Have a project in mind?", "href": "#contact" },
    "bottomCta": { "label": "Let's make yours next", "href": "#contact" },
    "featuredProjects": ["northstar", "bloomwell", "form-object", "orbit"]
  }$json$::jsonb,
  30,
  true
),
(
  'services-section',
  $json${
    "eyebrow": "02 / What we do",
    "heading": "Good thinking.<br />Made useful.",
    "note": "Strategy, design, and build. One team from first sketch to final pixel.",
    "footerNote": {
      "drawn": "Small details. Bigger picture.",
      "mono": "STRATEGY × DESIGN × DELIVERY"
    },
    "tagsFallback": "Strategy · Design · Delivery"
  }$json$::jsonb,
  40,
  true
),
(
  'process-section',
  $json${
    "eyebrow": "03 / How we work",
    "heading": "Clear process.<br />No black boxes.",
    "note": "A simple process, run collaboratively. You always know what we're doing and why.",
    "steps": [
      {
        "index": "01",
        "symbol": "⌕",
        "title": "Discover",
        "body": "We ask a lot of questions, listen properly, and resist the urge to jump to a solution.",
        "label": "LISTEN FIRST"
      },
      {
        "index": "02",
        "symbol": "⌗",
        "title": "Define",
        "body": "We agree on the problem, the constraints, and what success actually looks like.",
        "label": "FIND THE FOCUS"
      },
      {
        "index": "03",
        "symbol": "✳",
        "title": "Design",
        "body": "We make, test, throw away, and make again until it feels inevitable.",
        "label": "MAKE IT REAL"
      },
      {
        "index": "04",
        "symbol": "↗",
        "title": "Deliver",
        "body": "We hand over work your team can use, with the files and context to keep it moving.",
        "label": "BUILT TO MOVE"
      }
    ]
  }$json$::jsonb,
  50,
  true
),
(
  'studio-section',
  $json${
    "eyebrow": "04 / The studio",
    "heading": "Not just how it looks.<br />How it works.",
    "lead": "We make things that work first, then make them feel good.",
    "paragraphs": [
      "We're a small studio. We work directly with founders and product teams, ask a lot of questions, and stay close to the work from first sketch to launch. No handoffs to a mystery team.",
      "No design theatre. No decks that die in a folder. Just clear decisions and work that ships."
    ],
    "values": [
      { "index": "01", "label": "Curiosity before assumptions" },
      { "index": "02", "label": "Plain talk over jargon" },
      { "index": "03", "label": "Care in the details" }
    ],
    "linkLabel": "A little about our approach",
    "linkHref": "#contact",
    "artIndex": "DRAWING NO. 008",
    "artCaption": "FORM / FUNCTION / FEELING",
    "stamp": "A little<br />more thought<br />goes a long way."
  }$json$::jsonb,
  60,
  true
),
(
  'testimonials',
  $json${
    "eyebrow": "05 / What we aim for",
    "attribution": "Studio note · Drawtiq",
    "note": "A small studio manifesto, not invented client feedback.",
    "items": [
      {
        "number": "01",
        "label": "Clarity",
        "quote": "Make the complicated feel obvious. Then make it feel good.",
        "emphasis": "obvious."
      },
      {
        "number": "02",
        "label": "Questions",
        "quote": "Ask the question behind the brief. The answer usually gets simpler.",
        "emphasis": "behind the brief."
      },
      {
        "number": "03",
        "label": "Shipping",
        "quote": "Ship the thing. A good deck is not the work.",
        "emphasis": "Ship the thing."
      },
      {
        "number": "04",
        "label": "Handover",
        "quote": "Leave the team with something they can use without us.",
        "emphasis": "without us."
      },
      {
        "number": "05",
        "label": "Details",
        "quote": "Care about the details, but don't confuse them with the point.",
        "emphasis": "the point."
      }
    ]
  }$json$::jsonb,
  70,
  true
),
(
  'insights-section',
  $json${
    "eyebrow": "06 / Notes from the studio",
    "heading": "Notes from<br />the work.",
    "cta": { "label": "Read all notes", "href": "/insights" },
    "cardLinkLabel": "Read the note",
    "ctaHeading": "Want this thinking on your product?",
    "ctaBody": "Tell us what you're working on and we'll bring the questions.",
    "ctaLabel": "Start a project",
    "ctaHref": "/contact",
    "featuredPosts": [
      "clarity-is-a-feature",
      "consistency-without-predictability",
      "the-better-question"
    ]
  }$json$::jsonb,
  80,
  true
),
(
  'contact-section',
  $json${
    "eyebrow": "07 / Your turn",
    "heading": "Have a good idea?<br />Let's make it work.",
    "paragraph": "Tell us what you're working on. We'll reply within two business days with a few honest questions and a clear next step.",
    "email": "",
    "formHeading": "",
    "formSubheading": "",
    "submitLabel": "",
    "hint": "",
    "formNotes": {
      "heading": "PROJECT INQUIRY / 001",
      "subheading": "A real person reads every note. Usually a reply within two working days.",
      "submit": "Send inquiry",
      "hint": "We use these details only to reply to your inquiry."
    },
    "fieldNames": ["name", "email", "service", "message"]
  }$json$::jsonb,
  90,
  true
)

on conflict (section_key) do nothing;

-- Initial editorial content and page-level SEO for public pages.
--
-- Idempotent by design:
--   * Every row is keyed by (page_key, section_key).
--   * ON CONFLICT DO NOTHING means re-running this migration never overwrites
--     content that an editor has already customised in /admin/cms.
--   * Missing rows are created with the copy currently used by the site's
--     built-in fallbacks, so applying this migration does not change the
--     rendered website.
--
-- Detail routes (case studies, service details, insight detail) intentionally
-- have no shared "seo" row. Their per-record SEO is preferred, then a generated
-- title/description is used. Creating shared SEO there would override those
-- more specific values with one generic title.
--
-- Homepage editorial sections live in public.homepage_sections and are seeded
-- by 20261028000200_seed_homepage_sections.sql.

insert into public.page_sections
  (page_key, section_key, content, order_index, seo_title, seo_description)
values

-- ───────────────────────────────────────────────────────────────────────────
-- Global site labels (header/footer CTAs)
-- ───────────────────────────────────────────────────────────────────────────
(
  'global',
  'site',
  $json${
    "logoPath": "",
    "logoAlt": "Drawtiq",
    "logoAriaLabel": "Drawtiq home",
    "navCtaLabel": "Start a project",
    "navCtaHref": "/contact",
    "mobileCtaEyebrow": "Have a project in mind?",
    "mobileCtaLabel": "Start a project",
    "footerLogoPath": "",
    "footerLogoAlt": "Drawtiq",
    "footerCtaLabel": "Start a project",
    "copyrightSuffix": "Made with care."
  }$json$::jsonb,
  10,
  null,
  null
),

-- ───────────────────────────────────────────────────────────────────────────
-- Work
-- ───────────────────────────────────────────────────────────────────────────
(
  'work',
  'seo',
  '{}'::jsonb,
  0,
  'Selected Work',
  'Explore Drawtiq concept projects across UI/UX design, brand identity, and graphic design.'
),
(
  'work',
  'hero',
  $json${
    "eyebrow": "01 / Selected work",
    "heading": "Thoughtful work.<br /><em>Made to be used.</em>",
    "lead": "A few projects, shown properly: the brief, the decisions, and the work.",
    "kicker": "SELECTED PROJECTS / 2024—26"
  }$json$::jsonb,
  10,
  null,
  null
),
(
  'work',
  'filters',
  $json${
    "heading": "Selected projects",
    "allLabel": "All work",
    "categories": [
      { "value": "uiux", "label": "UI/UX" },
      { "value": "branding", "label": "Branding" },
      { "value": "graphic", "label": "Graphic" }
    ],
    "emptyText": "New work is being prepared. Check back soon.",
    "cardNoteForm": "Everyday objects, considered.",
    "cardNoteDefault": "Notes on better work.",
    "cardGrowth": "↗ 12.8% this month"
  }$json$::jsonb,
  20,
  null,
  null
),
(
  'work',
  'cta',
  $json${
    "heading": "Have a good idea?",
    "body": "Let's make it work.",
    "label": "Start a project",
    "href": "/contact",
    "disclaimer": "Portfolio projects shown here are illustrative concepts created for this website preview, not claims of commissioned client work."
  }$json$::jsonb,
  30,
  null,
  null
),

-- ───────────────────────────────────────────────────────────────────────────
-- Services
-- ───────────────────────────────────────────────────────────────────────────
(
  'services',
  'seo',
  '{}'::jsonb,
  0,
  'Services',
  'UI/UX, digital product design, brand identity, graphic design, motion design, and video editing services by Drawtiq.'
),
(
  'services',
  'hero',
  $json${
    "eyebrow": "02 / What we do",
    "heading": "Good thinking.<br /><em>Made useful.</em>",
    "lead": "We can take on the whole thing or just the part you're stuck on. Either way, you work with the people doing the work."
  }$json$::jsonb,
  10,
  null,
  null
),
(
  'services',
  'note',
  $json${
    "drawn": "Strategy, design, and the bits in between.",
    "mono": "STRATEGY × DESIGN × DELIVERY"
  }$json$::jsonb,
  20,
  null,
  null
),
(
  'services',
  'engagement-panels',
  $json${
    "items": [
      {
        "number": "ENGAGEMENT / 01",
        "title": "Focused project",
        "body": "A clear brief, a shared timeline, and a defined outcome. Good for a launch, a rebrand, or one knotty product problem.",
        "label": "Discuss a project",
        "href": "/contact"
      },
      {
        "number": "ENGAGEMENT / 02",
        "title": "Ongoing design partner",
        "body": "A steady pair of hands for teams shipping continuously. We keep the context, so you don't have to brief us from scratch every month.",
        "label": "Explore a partnership",
        "href": "/contact"
      }
    ]
  }$json$::jsonb,
  30,
  null,
  null
),
(
  'services',
  'list',
  $json${
    "heading": "Our services",
    "emptyText": "Service details are being updated. Please check back soon.",
    "tagsFallback": "Strategy · Design · Delivery"
  }$json$::jsonb,
  40,
  null,
  null
),
(
  'services',
  'cta',
  $json${
    "heading": "Not sure what you need?",
    "body": "That's normal. Tell us what's stuck and we'll suggest the smallest useful place to start.",
    "label": "Let's talk",
    "href": "/contact"
  }$json$::jsonb,
  50,
  null,
  null
),

-- ───────────────────────────────────────────────────────────────────────────
-- Case study detail (shared labels and fallback narrative)
-- ───────────────────────────────────────────────────────────────────────────
(
  'case-studies',
  'shared',
  $json${
    "projectTypeLabel": "PROJECT TYPE",
    "projectType": "Illustrative concept",
    "categoryFallback": "Case study",
    "metaDisciplineLabel": "DISCIPLINE",
    "metaIndustryLabel": "INDUSTRY",
    "metaScopeLabel": "SCOPE",
    "challengeEyebrow": "01 / The challenge",
    "challengeHeading": "Find the signal in the noise.",
    "challengeFallback": "This concept explores how a clearer hierarchy, a calmer visual language, and a more considered flow can make a complex experience feel easier to understand.",
    "challengeExtra": "The experience needed to help people make sense of dense information without making the product feel simplistic. The challenge was to establish a clear hierarchy while keeping meaningful depth close at hand.",
    "approachEyebrow": "02 / The approach",
    "approachHeading": "Start with the human question.",
    "approachFallback": "We organized the experience around the questions a user arrives with: Where do I stand? What changed? What should I look at next?",
    "approachHighlights": [
      "Give the most important information a clear visual priority.",
      "Use consistent patterns for summaries, trends, and supporting details.",
      "Make key actions easy to scan and understand.",
      "Use color as a functional cue, not decoration."
    ],
    "solutionEyebrow": "03 / The solution",
    "solutionHeading": "Clarity built into the system.",
    "solutionFallback": "A considered type scale, restrained palette, modular cards, and simple chart language create a more coherent product experience. Responsive layouts keep the hierarchy intact as the available space changes.",
    "stats": [
      { "number": "01", "label": "Clear primary summary" },
      { "number": "02", "label": "Consistent data patterns" },
      { "number": "03", "label": "Focused next steps" }
    ],
    "outcomeEyebrow": "04 / The outcome",
    "outcomeHeading": "Designed for better decisions.",
    "outcomeFallback": "This is a design concept, so there are no verified client performance results or before-and-after metrics to report. In a live engagement, the next step would be to validate the experience with usability testing and measure task completion, comprehension, and confidence.",
    "disclaimer": "All names, screens, and results on this page are illustrative concept material—not commissioned client work or measured outcomes.",
    "ctaHeading": "Have a similar challenge?",
    "ctaBody": "Let's shape a thoughtful solution around your users and goals.",
    "ctaLabel": "Start a project",
    "ctaHref": "/contact",
    "backLabel": "← Back to all work"
  }$json$::jsonb,
  10,
  null,
  null
),

-- ───────────────────────────────────────────────────────────────────────────
-- Service detail (shared labels; per-service SEO remains authoritative)
-- ───────────────────────────────────────────────────────────────────────────
(
  'service-details',
  'shared',
  $json${
    "eyebrowSuffix": "Service detail",
    "heroPrimaryLabel": "Start a project",
    "heroPrimaryHref": "/contact",
    "heroSecondaryLabel": "Explore deliverables",
    "approachEyebrow": "How we approach it",
    "faqEyebrow": "A few common questions",
    "faqHeading": "Good to <em>know.</em>"
  }$json$::jsonb,
  10,
  null,
  null
),

-- ───────────────────────────────────────────────────────────────────────────
-- Insights list
-- ───────────────────────────────────────────────────────────────────────────
(
  'insights',
  'seo',
  '{}'::jsonb,
  0,
  'Insights',
  'Notes from the Drawtiq studio on design principles, brand systems, product thinking, motion design, and video craft.'
),
(
  'insights',
  'hero',
  $json${
    "eyebrow": "06 / Notes from the studio",
    "heading": "Notes from<br /><em>the work.</em>",
    "lead": "What we're learning about design, product, and the small decisions that change the outcome."
  }$json$::jsonb,
  10,
  null,
  null
),
(
  'insights',
  'list',
  $json${
    "eyebrow": "All notes",
    "heading": "Recent <em>notes.</em>",
    "emptyText": "New studio notes are on the way. Check back soon.",
    "cardLinkLabel": "Read the note"
  }$json$::jsonb,
  20,
  null,
  null
),
(
  'insights',
  'cta',
  $json${
    "heading": "Want this thinking on your product?",
    "body": "Tell us what you're working on and we'll bring the questions.",
    "label": "Start a project",
    "href": "/contact"
  }$json$::jsonb,
  30,
  null,
  null
),

-- ───────────────────────────────────────────────────────────────────────────
-- Insight detail (shared labels; per-post SEO remains authoritative)
-- ───────────────────────────────────────────────────────────────────────────
(
  'insights-detail',
  'shared',
  $json${
    "emptyBody": "This note is being prepared. Please check back soon.",
    "moreEyebrow": "Keep reading",
    "moreHeading": "More studio <em>notes.</em>",
    "moreLinkLabel": "All insights",
    "cardLinkLabel": "Read the note",
    "ctaHeading": "Have a project in mind?",
    "ctaBody": "Let's turn a good question into something people love to use.",
    "ctaLabel": "Start a project",
    "ctaHref": "/contact",
    "backLabel": "← Back to all insights"
  }$json$::jsonb,
  10,
  null,
  null
),

-- ───────────────────────────────────────────────────────────────────────────
-- Pricing
-- ───────────────────────────────────────────────────────────────────────────
(
  'pricing',
  'seo',
  '{}'::jsonb,
  0,
  'Pricing',
  'Transparent monthly design plans for UI/UX, brand identity, graphic design, motion design, and video editing by Drawtiq.'
),
(
  'pricing',
  'copy',
  $json${
    "eyebrow": "07 / Pricing",
    "heading": "Simple pricing.<br /><em>No surprises.</em>",
    "lead": "One monthly rate. No timesheets. A team that already knows the work. Choose the pace that fits what you're building.",
    "includedEyebrow": "Every plan includes",
    "modelsEyebrow": "Ways to work together",
    "modelsHeading": "Choose your<br /><em>way in.</em>",
    "modelsNote": "Plans and projects are built on the same process and the same care. Only the pace changes.",
    "addonsEyebrow": "Add-ons",
    "addonsHeading": "One-off <em>extras.</em>",
    "addonsNote": "Standalone engagements you can add to any plan, or book on their own.",
    "faqEyebrow": "A few common questions",
    "faqHeading": "Good to <em>know.</em>",
    "ctaHeading": "Not sure which plan fits?",
    "ctaBody": "Tell us about the work. We'll recommend the simplest way to start.",
    "ctaLabel": "Let's talk",
    "ctaHref": "/contact",
    "disclaimer": "Prices are shown in USD and are indicative starting points for planning, not a formal quote.",
    "planLabels": {
      "monthly": "Monthly",
      "quarterly": "Quarterly",
      "quarterlySave": "save 15%",
      "featured": "Most popular",
      "perMonth": "/ month",
      "monthlyNote": "Rolling monthly · cancel anytime",
      "quarterlyNote": "Billed quarterly · pause anytime",
      "ctaHref": "/contact"
    }
  }$json$::jsonb,
  10,
  null,
  null
),

-- ───────────────────────────────────────────────────────────────────────────
-- Careers
-- ───────────────────────────────────────────────────────────────────────────
(
  'careers',
  'hero',
  $json${
    "eyebrow": "08 / Careers",
    "heading": "Do the best work<br />of your <em>career.</em>",
    "lead": "We're a small studio. We care about the work, protect time to think, and don't confuse busy with good. If that sounds like you, send us something you're proud of.",
    "primaryLabel": "Send your portfolio",
    "primaryEmail": "careers@drawtiq.studio",
    "secondaryLabel": "See open roles"
  }$json$::jsonb,
  10,
  null,
  null
),
(
  'careers',
  'why',
  $json${
    "eyebrow": "Why Drawtiq",
    "heading": "A place to do<br /><em>your best work.</em>",
    "note": "Good work takes time. We plan for it, and we don't confuse busy with good."
  }$json$::jsonb,
  20,
  null,
  null
),
(
  'careers',
  'roles',
  $json${
    "eyebrow": "Open roles",
    "heading": "Come build<br /><em>with us.</em>",
    "note": "Roles we are opening as the studio grows. Speculative applications welcome.",
    "applyLabel": "Apply for this role"
  }$json$::jsonb,
  30,
  null,
  null
),
(
  'careers',
  'role-open',
  $json${
    "heading": "Don't see your role?",
    "body": "Tell us what you do and what you would love to make. We keep a warm list and reach out when the right project appears.",
    "label": "Send a speculative note",
    "email": "careers@drawtiq.studio"
  }$json$::jsonb,
  40,
  null,
  null
),
(
  'careers',
  'hiring',
  $json${
    "eyebrow": "How hiring works",
    "heading": "Clear, kind,<br /><em>and quick.</em>"
  }$json$::jsonb,
  50,
  null,
  null
),
(
  'careers',
  'faq',
  $json${
    "eyebrow": "A few common questions",
    "heading": "Good to <em>know.</em>"
  }$json$::jsonb,
  60,
  null,
  null
),
(
  'careers',
  'cta',
  $json${
    "heading": "Ready when you are.",
    "body": "Send your work — we read every note that lands in the studio.",
    "label": "Email the studio",
    "email": "careers@drawtiq.studio"
  }$json$::jsonb,
  70,
  null,
  null
),

-- ───────────────────────────────────────────────────────────────────────────
-- Contact (hero/copy live in public.contact_settings)
-- ───────────────────────────────────────────────────────────────────────────
(
  'contact',
  'next-steps',
  $json${
    "label": "WHAT HAPPENS NEXT",
    "steps": [
      "We read your note properly.",
      "You get a reply within two working days.",
      "If it fits, we set up a short call."
    ]
  }$json$::jsonb,
  10,
  null,
  null
),

-- ───────────────────────────────────────────────────────────────────────────
-- About SEO (about section copy lives in public.about_sections)
-- ───────────────────────────────────────────────────────────────────────────
(
  'about',
  'seo',
  '{}'::jsonb,
  0,
  'About the Studio',
  'Drawtiq is an independent design studio for digital products and brand identities that need to work in the real world.'
)

on conflict (page_key, section_key) do nothing;

-- These three pages currently derive their SEO from global/contact settings.
-- Copy the currently effective values into page_sections so applying this seed
-- does not change the live metadata. If an editor later changes the page-level
-- row, it intentionally takes precedence over the settings fallback.
--
-- Canonical singleton rows are preferred by id. The id tie-breaker keeps the
-- result deterministic if legacy duplicate settings rows exist.

insert into public.page_sections
  (page_key, section_key, content, order_index, seo_title, seo_description)
select
  'homepage',
  'seo',
  '{}'::jsonb,
  0,
  coalesce(
    (
      select nullif(btrim(seo_title), '')
      from public.global_settings
      order by
        case when id = '00000000-0000-0000-0000-000000000001' then 0 else 1 end,
        id asc
      limit 1
    ),
    'Drawtiq — Design that moves brands forward'
  ),
  coalesce(
    (
      select nullif(btrim(seo_description), '')
      from public.global_settings
      order by
        case when id = '00000000-0000-0000-0000-000000000001' then 0 else 1 end,
        id asc
      limit 1
    ),
    'Drawtiq is an independent design studio for digital products and brand identities that need to work in the real world.'
  )
on conflict (page_key, section_key) do nothing;

insert into public.page_sections
  (page_key, section_key, content, order_index, seo_title, seo_description)
select
  'careers',
  'seo',
  '{}'::jsonb,
  0,
  'Careers',
  'Join Drawtiq — product, brand, motion, and video roles for people who care about craft. Write to '
    || coalesce(
      (
        select nullif(btrim(careers_email), '')
        from public.global_settings
        order by
          case when id = '00000000-0000-0000-0000-000000000001' then 0 else 1 end,
          id asc
        limit 1
      ),
      'careers@drawtiq.studio'
    )
    || '.'
on conflict (page_key, section_key) do nothing;

insert into public.page_sections
  (page_key, section_key, content, order_index, seo_title, seo_description)
select
  'contact',
  'seo',
  '{}'::jsonb,
  0,
  'Contact',
  coalesce(
    (
      select nullif(btrim(hero_lead), '')
      from public.contact_settings
      order by
        case when id = '00000000-0000-0000-0000-000000000002' then 0 else 1 end,
        id asc
      limit 1
    ),
    'Start a conversation with Drawtiq about UI/UX design, branding, or graphic design.'
  )
on conflict (page_key, section_key) do nothing;

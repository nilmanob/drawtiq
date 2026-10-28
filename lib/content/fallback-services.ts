import type {
  PublicDeliverable,
  PublicFaq,
  PublicService,
  ServiceDetailFallback,
} from "./types";

const sharedFaqs: PublicFaq[] = [
  {
    q: "How long does a typical project take?",
    a: "It depends on scope, decision-making, and the number of deliverables. After an initial conversation, we’ll recommend a realistic timeline and milestones.",
  },
  {
    q: "Can you work with our existing brand or product?",
    a: "Yes. We can extend an existing system, improve a specific experience, or help establish a new direction where needed.",
  },
  {
    q: "What do you need to get started?",
    a: "A short conversation about your goals, audience, timeline, and constraints is enough to begin. We can help shape the brief together.",
  },
];

export const fallbackServices: PublicService[] = [
  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    blurb: "Make the complex feel obvious.",
    intro: null,
    icon: "icon-ux",
    previewPath: "/assets/services/ui-ux.svg",
    tags: ["Research", "User journeys", "Wireframes", "Prototyping", "Usability"],
    deliverables: [],
    faqs: [],
    sortOrder: 1,
    detailPath: "/service-ui-ux",
    seoTitle: null,
    seoDescription: null,
  },
  {
    slug: "digital-product-design",
    title: "Digital Product Design",
    blurb: "Make the tool feel like second nature.",
    intro: null,
    icon: "icon-product",
    previewPath: "/assets/services/digital-product.svg",
    tags: ["SaaS", "Web apps", "Mobile apps", "Design systems"],
    deliverables: [],
    faqs: [],
    sortOrder: 2,
    detailPath: "/service-ui-ux",
    seoTitle: null,
    seoDescription: null,
  },
  {
    slug: "brand-identity",
    title: "Brand Identity",
    blurb: "Look like you mean it.",
    intro: null,
    icon: "icon-brand",
    previewPath: "/assets/services/brand-identity.svg",
    tags: ["Strategy", "Identity systems", "Guidelines", "Art direction"],
    deliverables: [],
    faqs: [],
    sortOrder: 3,
    detailPath: "/service-graphic-design",
    seoTitle: null,
    seoDescription: null,
  },
  {
    slug: "graphic-design",
    title: "Graphic Design",
    blurb: "Make the idea visible.",
    intro: null,
    icon: "icon-graphic",
    previewPath: "/assets/services/graphic-design.svg",
    tags: ["Campaigns", "Packaging", "Editorial", "Social", "Print"],
    deliverables: [],
    faqs: [],
    sortOrder: 4,
    detailPath: "/service-graphic-design",
    seoTitle: null,
    seoDescription: null,
  },
  {
    slug: "motion-design",
    title: "Motion Design",
    blurb: "Make the idea move.",
    intro: null,
    icon: "icon-motion",
    previewPath: "/assets/services/motion-design.svg",
    tags: ["Storyboards", "Animation", "Motion systems", "Lottie"],
    deliverables: [],
    faqs: [],
    sortOrder: 5,
    detailPath: "/service-motion-design",
    seoTitle: null,
    seoDescription: null,
  },
  {
    slug: "video-editing",
    title: "Video Editing",
    blurb: "Find the story in the footage.",
    intro: null,
    icon: "icon-video",
    previewPath: "/assets/services/video-editing.svg",
    tags: ["Edit", "Color", "Sound", "Social cutdowns", "Titles"],
    deliverables: [],
    faqs: [],
    sortOrder: 6,
    detailPath: "/service-video-editing",
    seoTitle: null,
    seoDescription: null,
  },
];

const uiUxDeliverables: PublicDeliverable[] = [
  {
    title: "Research & discovery",
    body: "Stakeholder conversations, user needs, product goals, and a shared definition of success.",
  },
  {
    title: "Information architecture",
    body: "Content structure, user flows, navigation models, and clear task journeys.",
  },
  {
    title: "Wireframes & interaction",
    body: "Low- and high-fidelity screens that establish hierarchy, behavior, and key states.",
  },
  {
    title: "Visual interface design",
    body: "A polished UI system with thoughtful typography, spacing, color, and component patterns.",
  },
  {
    title: "Interactive prototype",
    body: "Clickable prototypes to communicate intent, validate flows, and support stakeholder alignment.",
  },
  {
    title: "Design system & handoff",
    body: "Reusable components, usage notes, responsive states, and organized developer handoff.",
  },
];

const graphicDeliverables: PublicDeliverable[] = [
  {
    title: "Brand direction",
    body: "A coherent visual direction shaped around positioning, audience, personality, and ambition.",
  },
  {
    title: "Logo & identity system",
    body: "Distinctive marks, supporting elements, and flexible identity variations.",
  },
  {
    title: "Typography & color",
    body: "A practical type and color system with rules that keep the brand consistent.",
  },
  {
    title: "Brand guidelines",
    body: "Clear usage principles, examples, and handoff assets for teams and partners.",
  },
  {
    title: "Campaign & social graphics",
    body: "Reusable creative assets for launches, campaigns, social channels, and digital promotion.",
  },
  {
    title: "Packaging & editorial",
    body: "Considered layouts and print-ready artwork for packaging, publications, and collateral.",
  },
];

const motionDeliverables: PublicDeliverable[] = [
  {
    title: "Motion direction",
    body: "A clear motion language for the brand or product — what moves, how fast, and why it moves at all.",
  },
  {
    title: "Storyboards & style frames",
    body: "Frame-by-frame planning and key visuals so the sequence is agreed before a single asset is animated.",
  },
  {
    title: "UI & product animation",
    body: "Transitions, micro-interactions, and state changes that make an interface feel responsive and alive.",
  },
  {
    title: "Brand & logo motion",
    body: "Animated marks, idents, and openers that give a brand a signature way of arriving on screen.",
  },
  {
    title: "Social & campaign motion",
    body: "Scroll-stopping loops, explainers, and ad variants designed for every placement and ratio.",
  },
  {
    title: "Motion systems & handoff",
    body: "Timing, easing, and export-ready assets (Lottie, MP4, WebM) documented for your team to reuse.",
  },
];

const videoDeliverables: PublicDeliverable[] = [
  {
    title: "Story & structure edit",
    body: "We find the spine of the film — what it is really about — and cut everything that does not serve it.",
  },
  {
    title: "Pacing & rhythm",
    body: "The cut that makes people stay: timing, pauses, and momentum shaped to the audience and the platform.",
  },
  {
    title: "Color grading",
    body: "A consistent look that supports the story and makes footage from every source feel like one film.",
  },
  {
    title: "Sound design & mix",
    body: "Clean dialogue, considered music, and texture that carries the emotion half of the picture.",
  },
  {
    title: "Titles & motion graphics",
    body: "Lower thirds, captions, and animated type that match your brand and stay readable at any size.",
  },
  {
    title: "Social cutdowns & formats",
    body: "Square, vertical, and wide edits designed natively for each placement — not just resized after the fact.",
  },
];

export const fallbackServiceDetails: ServiceDetailFallback[] = [
  {
    routeSlug: "service-ui-ux",
    serviceSlugs: ["service-ui-ux", "ui-ux-design"],
    number: "03",
    heroTitle: "Make the complex feel obvious.",
    lead: "We design digital products around real people, clear journeys, and the details that make complicated things feel simple.",
    introHeadingPrefix: "UI/UX Design that feels",
    introHeadingEmphasis: "clear.",
    introParagraphs: [
      "From early discovery to polished prototypes, our work connects user needs with product goals—so the experience feels intuitive and the interface has a clear purpose.",
      "We bring the right amount of structure to each project: enough to make decisions with confidence, and enough curiosity to discover a better answer when one appears.",
    ],
    sectionLabel: "What’s included",
    deliverables: uiUxDeliverables,
    faqs: sharedFaqs,
    pair: [
      {
        number: "01 / ALIGN",
        title: "Discover & define",
        body: "We clarify goals, audiences, constraints, and success criteria before visual decisions begin.",
      },
      {
        number: "02 / MAKE",
        title: "Design & refine",
        body: "We explore directions, share work early, and refine the details through feedback and testing.",
      },
    ],
    cta: {
      heading: "Need a distinctive visual identity?",
      body: "Explore brand identity and graphic design.",
      href: "/service-graphic-design",
      label: "Explore service",
    },
    exploreHref: "/work",
    exploreLabel: "Explore selected work",
    visual: null,
    seoTitle: "UI/UX Design",
    seoDescription: "Research-led UI/UX and digital product design by Drawtiq.",
  },
  {
    routeSlug: "service-graphic-design",
    serviceSlugs: ["service-graphic-design", "brand-identity", "graphic-design"],
    number: "04",
    heroTitle: "Make the idea visible.",
    lead: "We build identities and graphic systems that hold together across products, campaigns, and the everyday details.",
    introHeadingPrefix: "Graphic Design & Branding that feels",
    introHeadingEmphasis: "clear.",
    introParagraphs: [
      "From the core identity to the everyday assets that bring it to life, we make visual systems that are recognizable, adaptable, and built to work in the real world.",
      "We bring the right amount of structure to each project: enough to make decisions with confidence, and enough curiosity to discover a better answer when one appears.",
    ],
    sectionLabel: "What’s included",
    deliverables: graphicDeliverables,
    faqs: sharedFaqs,
    pair: [
      {
        number: "01 / ALIGN",
        title: "Discover & define",
        body: "We clarify goals, audiences, constraints, and success criteria before visual decisions begin.",
      },
      {
        number: "02 / MAKE",
        title: "Design & refine",
        body: "We explore directions, share work early, and refine the details through feedback and testing.",
      },
    ],
    cta: {
      heading: "Need a better digital experience?",
      body: "Explore UI/UX and digital product design.",
      href: "/service-ui-ux",
      label: "Explore service",
    },
    exploreHref: "/work",
    exploreLabel: "Explore selected work",
    visual: null,
    seoTitle: "Graphic Design & Branding",
    seoDescription: "Brand identity, graphic design, and art direction by Drawtiq.",
  },
  {
    routeSlug: "service-motion-design",
    serviceSlugs: ["service-motion-design", "motion-design"],
    number: "05",
    heroTitle: "Make the idea move.",
    lead: "We use motion to explain, guide, and give a brand a signature way of arriving on screen.",
    introHeadingPrefix: "Motion that explains, not just",
    introHeadingEmphasis: "entertains.",
    introParagraphs: [
      "Motion is the part of a design people feel before they can name it. We treat it as a language: every transition should answer a question, show a relationship, or reward an action.",
      "From a single loading state to a full campaign film, we keep the movement purposeful, performant, and unmistakably yours.",
    ],
    sectionLabel: "What’s included",
    deliverables: motionDeliverables,
    faqs: [
      {
        q: "Can motion work fit an existing brand?",
        a: "Yes. We start from your current identity and build a motion layer that extends it — same voice, new dimension.",
      },
      {
        q: "Which formats will we receive?",
        a: "Deliverables are shaped to where they live: Lottie or code-ready assets for product, and MP4, WebM, or ProRes for film and social.",
      },
      {
        q: "How do you keep animation performant?",
        a: "We design for 60fps on real devices, keep easing and structure simple, and test on lower-powered hardware before handoff.",
      },
    ],
    pair: [
      {
        number: "01 / DESIGN",
        title: "Define the motion language",
        body: "We agree on timing, easing, and intent so every animation shares one clear personality.",
      },
      {
        number: "02 / DELIVER",
        title: "Animate & hand off",
        body: "We produce the sequences and export assets your team can ship and reuse with confidence.",
      },
    ],
    cta: {
      heading: "Need the final cut too?",
      body: "Explore video editing and post-production with Drawtiq.",
      href: "/service-video-editing",
      label: "Explore service",
    },
    exploreHref: "/work",
    exploreLabel: "See movement in context",
    visual: "motion",
    seoTitle: "Motion Design",
    seoDescription:
      "Motion design and animation for digital products, brands, and campaigns by Drawtiq.",
  },
  {
    routeSlug: "service-video-editing",
    serviceSlugs: ["service-video-editing", "video-editing"],
    number: "06",
    heroTitle: "Find the story in the footage.",
    lead: "The shoot gives you footage. The edit decides what it means. We shape raw material into films that hold attention and land the point.",
    introHeadingPrefix: "An edit that makes people",
    introHeadingEmphasis: "stay.",
    introParagraphs: [
      "Good video is not a filming problem — it is a story problem. We start with structure, decide what the piece is about, and cut until only the essential remains.",
      "Then we finish it: colour, sound, and titles that make the story feel considered from first frame to last, on every screen it will play.",
    ],
    sectionLabel: "What’s included",
    deliverables: videoDeliverables,
    faqs: [
      {
        q: "Do you work from our existing footage?",
        a: "Absolutely. Send us the raw files and a little context, and we will shape the story from what you already have.",
      },
      {
        q: "Can you handle a full shoot-to-edit project?",
        a: "We can lead the edit and post-production, and bring trusted collaborators in for filming when the project needs it.",
      },
      {
        q: "How many revisions are included?",
        a: "Every engagement includes structured review rounds. We share work early so feedback stays focused and the final cut lands fast.",
      },
    ],
    pair: [
      {
        number: "01 / ASSEMBLE",
        title: "Structure the story",
        body: "We log, select, and assemble a rough cut that reveals what the film wants to be.",
      },
      {
        number: "02 / FINISH",
        title: "Colour, sound & delivery",
        body: "We polish the picture and mix, then deliver every format your channels need.",
      },
    ],
    cta: {
      heading: "Want movement baked in?",
      body: "Explore motion design and animation with Drawtiq.",
      href: "/service-motion-design",
      label: "Explore service",
    },
    exploreHref: "/work",
    exploreLabel: "See the work",
    visual: "video",
    seoTitle: "Video Editing",
    seoDescription:
      "Video editing, colour, sound, and motion graphics for brands and campaigns by Drawtiq.",
  },
];

export const serviceRouteCandidates: Record<string, string[]> = Object.fromEntries(
  fallbackServiceDetails.map((detail) => [detail.routeSlug, detail.serviceSlugs])
);

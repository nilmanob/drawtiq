import type { PostBlock } from "./types";

export type { PostBlock };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  /** Visual treatment for the listing card. */
  visual: "one" | "two" | "three" | "four" | "five";
  label: string;
  display: string;
  body: PostBlock[];
};

export const fallbackPosts: Post[] = [
  {
    slug: "clarity-is-a-feature",
    title: "Clarity is a feature, not a finishing touch.",
    excerpt:
      "Clarity is not the polish you add at the end. It is a decision you make at the start and protect through every screen.",
    category: "Design principles",
    readTime: "5 min read",
    date: "2026-08-14",
    visual: "one",
    label: "FIELD NOTES / 001",
    display: "Less,<br /><em>but better.</em>",
    body: [
      {
        type: "p",
        text: "Most interfaces do not fail because they are ugly. They fail because they make people think too hard. A button that could be a sentence, a menu that could be a single choice, a screen that explains itself twice — these are the small taxes that add up into a frustrating product.",
      },
      {
        type: "h2",
        text: "Clarity is a decision, not a coat of paint.",
      },
      {
        type: "p",
        text: "Teams often treat clarity like a final pass: tighten the copy, space the sections, ship it. But by the time you reach that pass, the hard decisions are already frozen. The real work happens earlier — deciding what matters, what can wait, and what should not exist at all.",
      },
      {
        type: "quote",
        text: "If a screen needs a paragraph to explain it, the paragraph is usually telling you what the design should have done.",
      },
      {
        type: "p",
        text: "When hierarchy is intentional, people move through a product without noticing the work behind it. That invisibility is the point. Good structure feels obvious because someone made a hundred small calls so the user never had to.",
      },
      {
        type: "h2",
        text: "A few habits that keep clarity honest.",
      },
      {
        type: "list",
        items: [
          "Write the headline before you draw the layout — it reveals what the screen is really about.",
          "Remove one element from every screen and see if it still works. If it does, it probably should go.",
          "Use color as a signal, not decoration, so the eye knows where to go first.",
          "Test the design with real content, not placeholders, and watch where people hesitate.",
        ],
      },
      {
        type: "p",
        text: "Clarity is not the absence of craft. It is craft with a job to do. Every detail should earn its place, and when it does, the whole experience feels calmer, faster, and more human.",
      },
    ],
  },
  {
    slug: "consistency-without-predictability",
    title: "Consistency doesn’t have to mean predictable.",
    excerpt:
      "A system should hold a brand together, not flatten it. The trick is to be consistent about what matters and flexible about everything else.",
    category: "Brand systems",
    readTime: "7 min read",
    date: "2026-07-30",
    visual: "two",
    label: "FIELD NOTES / 002",
    display: "A system<br />is a <em>promise.</em>",
    body: [
      {
        type: "p",
        text: "Consistency gets a bad reputation. People hear the word and picture a brand that looks the same everywhere — safe, tidy, and a little bit boring. But that is not consistency. That is repetition.",
      },
      {
        type: "h2",
        text: "Decide what is fixed and what is free.",
      },
      {
        type: "p",
        text: "A strong identity system is really a set of agreements. Some things are fixed: the logo, the core palette, the way the brand sounds. Others are free: how a campaign moves, how a social post is composed, how a product page breathes. Clarity about which is which is what gives a system its range.",
      },
      {
        type: "quote",
        text: "A system is not a cage. It is the set of rules that lets everyone else be brave without being lost.",
      },
      {
        type: "list",
        items: [
          "Fix the voice and the core marks. Free the layouts and the imagery.",
          "Give teams a few strong moves they can own instead of long lists of do-nots.",
          "Show the system working in the wild — real posts, real screens, real packaging.",
          "Revisit the rules every year. A brand that never evolves starts to feel generic.",
        ],
      },
      {
        type: "p",
        text: "When people trust the system, they stop asking permission for every decision. That is where a brand starts to feel alive: consistent in its soul, surprising in its expression.",
      },
    ],
  },
  {
    slug: "the-better-question",
    title: "The best interface is built on a better question.",
    excerpt:
      "Great products are not the result of better pixels. They are the result of asking a sharper question before the first pixel is placed.",
    category: "Product thinking",
    readTime: "4 min read",
    date: "2026-07-09",
    visual: "three",
    label: "FIELD NOTES / 003",
    display: "Make space<br />for better<br /><em>questions.</em>",
    body: [
      {
        type: "p",
        text: "The brief usually arrives as a solution. “Add a dashboard.” “Redesign the app.” “Make it more modern.” It takes a little nerve to slow down and ask what problem those solutions are actually trying to solve.",
      },
      {
        type: "h2",
        text: "Reframe the request before you answer it.",
      },
      {
        type: "p",
        text: "A dashboard might really be a request for confidence. A redesign might really be a request for clarity. Once you hear the real question, the right answer often looks nothing like the original brief — and works far better.",
      },
      {
        type: "quote",
        text: "People rarely ask for what they need. They ask for the closest thing they can imagine. Our job is to imagine further.",
      },
      {
        type: "list",
        items: [
          "Ask what changes for the person using this, not just what changes on the screen.",
          "Find the moment where the current experience breaks, and start there.",
          "Prototype the question, not the answer — the quickest way to learn.",
          "Write the sentence you want people to say when it works, then design toward it.",
        ],
      },
      {
        type: "p",
        text: "Better questions lead to better products, not because they are clever, but because they point the whole team at the same thing. Everything after that — the flows, the type, the motion — has somewhere honest to aim.",
      },
    ],
  },
  {
    slug: "motion-is-a-language",
    title: "Motion is a language, not a decoration.",
    excerpt:
      "Good motion explains relationships: where something came from, where it went, and what to do next. Bad motion just shows off.",
    category: "Motion design",
    readTime: "6 min read",
    date: "2026-06-18",
    visual: "four",
    label: "FIELD NOTES / 004",
    display: "Movement<br />with <em>meaning.</em>",
    body: [
      {
        type: "p",
        text: "Motion is the part of a design that most people feel and few can name. When it is right, an interface feels responsive and clear. When it is wrong, everything feels slippery and slow, even when the screens are beautiful.",
      },
      {
        type: "h2",
        text: "Motion should answer a question.",
      },
      {
        type: "p",
        text: "Where did this panel come from? Is this the same object, moved? Did my action work? Every transition is an opportunity to answer one of those questions. If a movement answers nothing, it is probably just noise.",
      },
      {
        type: "quote",
        text: "If you can remove the animation and the user understands the screen just as well, it was decoration.",
      },
      {
        type: "list",
        items: [
          "Use shared elements to show that two screens are the same thing, changed.",
          "Keep durations short — most UI motion belongs between 150ms and 400ms.",
          "Match easing to intent: quick out for momentum, gentle settle for arrival.",
          "Let motion carry hierarchy, so the eye follows the story instead of scanning it.",
        ],
      },
      {
        type: "p",
        text: "Treated as a language, motion turns a sequence of screens into a single, coherent experience. That is when people stop noticing the animation and start trusting the product.",
      },
    ],
  },
  {
    slug: "editing-writes-the-story",
    title: "Editing is where the story is written.",
    excerpt:
      "The shoot gives you footage. The edit decides what it means. Structure, pacing, and restraint are the real craft of video.",
    category: "Video editing",
    readTime: "5 min read",
    date: "2026-05-27",
    visual: "five",
    label: "FIELD NOTES / 005",
    display: "Cut,<br />pause,<br /><em>land.</em>",
    body: [
      {
        type: "p",
        text: "Video is often treated as a filming problem. But most of the feeling in a good film is decided after the cameras are packed away — in the edit, where a pause becomes tension and a jump cut becomes energy.",
      },
      {
        type: "h2",
        text: "Structure first, effects last.",
      },
      {
        type: "p",
        text: "The first job of an edit is not color or sound design. It is deciding what the piece is actually about, and what can be cut. A tighter story with modest finishing will always beat a loose story with expensive polish.",
      },
      {
        type: "quote",
        text: "The edit is not where you add things until it works. It is where you take things away until it does.",
      },
      {
        type: "list",
        items: [
          "Cut the story to the bone before adding a single title or transition.",
          "Use rhythm — let the pace breathe in and out instead of staying on one speed.",
          "Treat sound as half the picture; a clean mix does more than a filter.",
          "Design for the destination: a vertical cutdown is not a resized film.",
        ],
      },
      {
        type: "p",
        text: "When editing is treated as writing, a video stops being a record of an event and becomes a point of view. That is what people remember, share, and come back to.",
      },
    ],
  },
];

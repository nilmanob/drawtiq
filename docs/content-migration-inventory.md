# Drawtiq Content Migration Inventory

**Project:** Drawtiq — Next.js 14 + Supabase CMS migration
**Date:** 2026-10-26
**Status:** Phase 1 — Audit and Backup (in progress)
**Target Supabase project:** `cpirkzcffqkzktdlboip`

---

## Overview

This document inventories every public-facing content item in the Drawtiq website, traces its source, and maps it to a proposed CMS database destination. The inventory is the foundation for Phase 2 (CMS architecture), Phase 3 (automated extraction/import), and Phase 5 (frontend connection).

**Safety rule:** No existing source files are deleted or rewritten during this phase. The original hardcoded content remains as the fallback until each section is validated against database records.

---

## Public Route Inventory

| # | Route | Page File | Data Source | DB-Driven? | Primary Tables |
|---|-------|-----------|-------------|------------|----------------|
| 1 | `/` | `app/(drawtiq)/page.tsx` | Hardcoded in component | No | (none yet) |
| 2 | `/about` | `app/(drawtiq)/about/page.tsx` | Hardcoded in component | No | (none yet) |
| 3 | `/careers` | `app/(drawtiq)/careers/page.tsx` | Hardcoded in component | No | (none yet) |
| 4 | `/contact` | `app/(drawtiq)/contact/page.tsx` | Hardcoded in component | No | (none yet) |
| 5 | `/pricing` | `app/(drawtiq)/pricing/page.tsx` | Hardcoded in component + `components/pricing-plans.tsx` | No | (none yet) |
| 6 | `/services` | `app/(drawtiq)/services/page.tsx` | Supabase `services` table | Yes (fallback if empty) | `services` |
| 7 | `/work` | `app/(drawtiq)/work/page.tsx` | Supabase `projects` table | Yes (fallback if empty) | `projects` |
| 8 | `/insights` | `app/(drawtiq)/insights/(list)/page.tsx` | Supabase `blog_posts` table | Yes (fallback if empty) | `blog_posts` |
| 9 | `/insights/[slug]` | `app/(drawtiq)/insights/[slug]/page.tsx` | Supabase `blog_posts` table | Yes (fallback if empty) | `blog_posts` |
| 10 | `/case-study/[project]` | `app/(drawtiq)/case-study/[project]/page.tsx` | Supabase `projects` table | Yes (fallback if empty) | `projects` |
| 11 | `/service-ui-ux` | `app/(drawtiq)/service-ui-ux/page.tsx` | Supabase `services` table | Yes (fallback if empty) | `services` |
| 12 | `/service-graphic-design` | `app/(drawtiq)/service-graphic-design/page.tsx` | Supabase `services` table | Yes (fallback if empty) | `services` |
| 13 | `/service-motion-design` | `app/(drawtiq)/service-motion-design/page.tsx` | Supabase `services` table | Yes (fallback if empty) | `services` |
| 14 | `/service-video-editing` | `app/(drawtiq)/service-video-editing/page.tsx` | Supabase `services` table | Yes (fallback if empty) | `services` |

---

## Section-by-Section Content Inventory

### 1. Homepage (`/`)

**File:** `app/(drawtiq)/page.tsx`

| Section | Element | Source | Current Value | Proposed DB Table | Status |
|---------|---------|--------|---------------|-------------------|--------|
| Hero | Eyebrow | Hardcoded | "Independent design studio" | `homepage_sections` (hero) | Pending |
| Hero | Heading | Hardcoded | "Make it meaningful. / Make it move." | `homepage_sections` (hero) | Pending |
| Hero | Intro paragraph | Hardcoded | "We help small teams turn complicated ideas into products and brands that feel simple to use." | `homepage_sections` (hero) | Pending |
| Hero | CTA 1 | Hardcoded | "Start a project" → `/contact` | `homepage_sections` (hero) | Pending |
| Hero | CTA 2 | Hardcoded | "Explore selected work" → `/work` | `homepage_sections` (hero) | Pending |
| Hero | Footnote | Hardcoded | "No big brief needed. A sentence is enough." | `homepage_sections` (hero) | Pending |
| Hero | Art index | Hardcoded | "DT—001 / BRAND IN MOTION" | `homepage_sections` (hero) | Pending |
| Hero | Art sticker | Hardcoded | "Ideas into impact" | `homepage_sections` (hero) | Pending |
| Hero | Floating UI top | Hardcoded | "Concept / 04", "Clarity, by design." | `homepage_sections` (hero) | Pending |
| Hero | Floating UI bottom | Hardcoded | "FORM FOLLOWS FEELING" | `homepage_sections` (hero) | Pending |
| Hero | Art caption | Hardcoded | "FIG 01. A SYSTEM OF POSSIBILITY" | `homepage_sections` (hero) | Pending |
| Trust strip | Label | Hardcoded | "Good work comes from" | `homepage_sections` (trust-strip) | Pending |
| Trust strip | Principles | Hardcoded array | ["Curiosity", "Plain talk", "Good questions", "Strong opinions", "Loose grip", "Real deadlines", "Care", "Follow-through"] | `homepage_sections` (trust-strip) | Pending |
| Work section | Eyebrow | Hardcoded | "01 / Selected work" | `homepage_sections` (work-section) | Pending |
| Work section | Heading | Hardcoded | "Thoughtful work. / Made to be used." | `homepage_sections` (work-section) | Pending |
| Work section | CTA | Hardcoded | "Have a project in mind?" → `#contact` | `homepage_sections` (work-section) | Pending |
| Work section | Projects | Hardcoded inline | 4 projects: Northstar Finance, Bloomwell, Form & Object, Orbit Workspace | `projects` (featured) | Pending |
| Work section | Bottom CTA | Hardcoded | "Let's make yours next" → `#contact` | `homepage_sections` (work-section) | Pending |
| Services section | Eyebrow | Hardcoded | "02 / What we do" | `homepage_sections` (services-section) | Pending |
| Services section | Heading | Hardcoded | "Good thinking. / Made useful." | `homepage_sections` (services-section) | Pending |
| Services section | Note | Hardcoded | "Strategy, design, and build. One team from first sketch to final pixel." | `homepage_sections` (services-section) | Pending |
| Services section | Service items | Hardcoded array | 6 services (UI/UX, Digital Product, Brand Identity, Graphic Design, Motion Design, Video Editing) | `services` (featured) | Pending |
| Services section | Note | Hardcoded | "Small details. Bigger picture. / STRATEGY × DESIGN × DELIVERY" | `homepage_sections` (services-section) | Pending |
| Process section | Eyebrow | Hardcoded | "03 / How we work" | `homepage_sections` (process-section) | Pending |
| Process section | Heading | Hardcoded | "Clear process. / No black boxes." | `homepage_sections` (process-section) | Pending |
| Process section | Note | Hardcoded | "A simple process, run collaboratively..." | `homepage_sections` (process-section) | Pending |
| Process section | Steps | Hardcoded array | 4 steps: Discover, Define, Design, Deliver | `homepage_sections` (process-section) | Pending |
| Studio section | Eyebrow | Hardcoded | "04 / The studio" | `homepage_sections` (studio-section) | Pending |
| Studio section | Heading | Hardcoded | "Not just how it looks. / How it works." | `homepage_sections` (studio-section) | Pending |
| Studio section | Lead | Hardcoded | "We make things that work first..." | `homepage_sections` (studio-section) | Pending |
| Studio section | Paragraphs | Hardcoded | 2 paragraphs about studio approach | `homepage_sections` (studio-section) | Pending |
| Studio section | Values | Hardcoded array | 3 values: Curiosity, Plain talk, Care | `homepage_sections` (studio-section) | Pending |
| Studio | Visual | Component `StudioVisual` | Video/GIF asset | (asset path) | Pending |
| Testimonials | Component `TestimonialCarousel` | Hardcoded in component | 5 studio notes | `testimonials` | Pending |
| Insights section | Eyebrow | Hardcoded | "06 / Notes from the studio" | `homepage_sections` (insights-section) | Pending |
| Insights section | Heading | Hardcoded | "Notes from / the work." | `homepage_sections` (insights-section) | Pending |
| Insights section | CTA | Hardcoded | "Read all notes" → `/insights` | `homepage_sections` (insights-section) | Pending |
| Insights section | Posts | Hardcoded inline | 3 posts: Clarity is a feature, Consistency without predictability, The better question | `blog_posts` (featured) | Pending |
| Contact section | Eyebrow | Hardcoded | "07 / Your turn" | `homepage_sections` (contact-section) | Pending |
| Contact section | Heading | Hardcoded | "Have a good idea? / Let's make it work." | `homepage_sections` (contact-section) | Pending |
| Contact section | Paragraph | Hardcoded | "Tell us what you're working on..." | `homepage_sections` (contact-section) | Pending |
| Contact section | Email | Hardcoded | `hello@drawtiq.studio` | `contact_settings` or `global_settings` | Pending |
| Contact section | Form | Hardcoded | Inquiry form → `/api/inquiries` | (form config) | Pending |

### 2. Navigation (all pages)

**File:** `components/nav.tsx`

| Element | Source | Current Value | Proposed DB Table | Status |
|---------|--------|---------------|-------------------|--------|
| Logo | Hardcoded | `/assets/Drawtiq-logo.png` | `global_settings` (logo) | Pending |
| Nav links | Hardcoded array | Work, Services, Pricing, About, Insights, Careers | `nav_items` | Pending |
| Header CTA | Hardcoded | "Start a project" → `/contact` | `nav_items` (CTA) or `global_settings` | Pending |
| Mobile contact | Hardcoded | "Have a project in mind?" → `/contact` | `nav_items` | Pending |

### 3. Footer (all pages)

**File:** `components/footer.tsx`

| Element | Source | Current Value | Proposed DB Table | Status |
|---------|--------|---------------|-------------------|--------|
| Logo | Hardcoded | `/assets/Drawtiq-logo-white.png` | `global_settings` (footer logo) | Pending |
| Footer description | Hardcoded | "Small studio. Clear thinking. Work made to be used." | `global_settings` (footer tagline) | Pending |
| Footer links | Hardcoded | Work, Services, Pricing, About, Insights, Careers | `footer_links` | Pending |
| Social/Contact | Hardcoded | hello@drawtiq.studio, Start a project | `footer_links` or `contact_settings` | Pending |
| Copyright | Hardcoded (dynamic year) | "© 2026 Drawtiq Studio. Made with care." | `global_settings` (copyright) | Pending |
| Bottom text | Hardcoded | "DESIGNED TO MOVE YOU." | `global_settings` (footer bottom) | Pending |

### 4. About (`/about`)

**File:** `app/(drawtiq)/about/page.tsx`

| Section | Element | Source | Current Value | Proposed DB Table | Status |
|---------|---------|--------|---------------|-------------------|--------|
| Hero | Eyebrow | Hardcoded | "05 / The studio" | `pages` / `about_content` | Pending |
| Hero | Heading | Hardcoded | "Not just how it looks. / How it works." | `pages` / `about_content` | Pending |
| Hero | Lead | Hardcoded | "We make digital products and identities..." | `pages` / `about_content` | Pending |
| Studio band | Image | Hardcoded | `/assets/about/drawtiq-studio-1600.webp` (with srcSet) | `about_content` (image) | Pending |
| Studio band | Caption | Hardcoded | "Studio study / no. 05", "A quiet corner, in print." | `about_content` | Pending |
| Split | Eyebrow | Hardcoded | "Our point of view" | `pages` / `about_content` | Pending |
| Split | Heading | Hardcoded | "Curiosity, plain talk, and care." | `pages` / `about_content` | Pending |
| Split | Paragraphs | Hardcoded | 3 paragraphs | `pages` / `about_content` | Pending |
| Values | Eyebrow | Hardcoded | "What guides us" | `pages` / `about_content` | Pending |
| Values | Heading | Hardcoded | "A few things we believe." | `pages` / `about_content` | Pending |
| Values | Cards | Hardcoded array | 6 value cards (CURIOUS, CLEAR, THOUGHTFUL, OPEN, PRACTICAL, CAREFUL) | `about_values` | Pending |
| Team | Eyebrow | Hardcoded | "The people behind the pixels" | `pages` / `about_content` | Pending |
| Team | Heading | Hardcoded | "Small team. Long attention spans." | `pages` / `about_content` | Pending |
| Team | Note | Hardcoded | "A flexible studio model brings the right creative skills together..." | `pages` / `about_content` | Pending |
| Team | Cards | Hardcoded array | 4 team cards (Creative direction, Product design, Brand design, Graphic design) | `team_members` | Pending |
| Team | Disclaimer | Hardcoded | "The team grid illustrates the studio disciplines, not named individual staff profiles." | `pages` / `about_content` | Pending |
| CTA | Heading | Hardcoded | "Good work starts with a good question." | `pages` / `about_content` | Pending |
| CTA | Paragraph | Hardcoded | "Tell us what you're hoping to make better." | `pages` / `about_content` | Pending |
| CTA | Button | Hardcoded | "Start a conversation" → `/contact` | `pages` / `about_content` | Pending |

### 5. Careers (`/careers`)

**File:** `app/(drawtiq)/careers/page.tsx`

| Section | Element | Source | Current Value | Proposed DB Table | Status |
|---------|---------|--------|---------------|-------------------|--------|
| Hero | Eyebrow | Hardcoded | "08 / Careers" | `pages` / `careers_content` | Pending |
| Hero | Heading | Hardcoded | "Do the best work of your career." | `pages` / `careers_content` | Pending |
| Hero | Lead | Hardcoded | "We're a small studio. We care about the work..." | `pages` / `careers_content` | Pending |
| Hero | CTA 1 | Hardcoded | "Send your portfolio" → mailto:careers@drawtiq.studio | `pages` / `careers_content` | Pending |
| Hero | CTA 2 | Hardcoded | "See open roles" → `#open-roles` | `pages` / `careers_content` | Pending |
| Perks | Eyebrow | Hardcoded | "Why Drawtiq" | `pages` / `careers_content` | Pending |
| Perks | Heading | Hardcoded | "A place to do your best work." | `pages` / `careers_content` | Pending |
| Perks | Note | Hardcoded | "Good work takes time..." | `pages` / `careers_content` | Pending |
| Perks | Items | Hardcoded array | 6 perks (Craft over churn, Small team big say, Remote first, Grow in public, Healthy pace, Tools that sing) | `careers_perks` | Pending |
| Roles | Eyebrow | Hardcoded | "Open roles" | `pages` / `careers_content` | Pending |
| Roles | Heading | Hardcoded | "Come build with us." | `pages` / `careers_content` | Pending |
| Roles | Note | Hardcoded | "Roles we are opening as the studio grows..." | `pages` / `careers_content` | Pending |
| Roles | Items | Hardcoded array | 5 roles (Senior Product Designer, Brand Designer, Motion Designer, Video Editor, Design Engineer) | `careers_roles` | Pending |
| Roles | Speculative | Hardcoded | "Don't see your role?" section + mailto link | `pages` / `careers_content` | Pending |
| Process | Eyebrow | Hardcoded | "How hiring works" | `pages` / `careers_content` | Pending |
| Process | Heading | Hardcoded | "Clear, kind, and quick." | `pages` / `careers_content` | Pending |
| Process | Steps | Hardcoded array | 4 steps (Say hello, A real conversation, A small challenge, Meet the studio) | `careers_process` | Pending |
| FAQs | Eyebrow | Hardcoded | "A few common questions" | `pages` / `careers_content` | Pending |
| FAQs | Heading | Hardcoded | "Good to know." | `pages` / `careers_content` | Pending |
| FAQs | Items | Hardcoded array | 3 FAQs | `careers_faqs` | Pending |
| CTA | Heading | Hardcoded | "Ready when you are." | `pages` / `careers_content` | Pending |
| CTA | Paragraph | Hardcoded | "Send your work — we read every note..." | `pages` / `careers_content` | Pending |
| CTA | Button | Hardcoded | "Email the studio" → mailto:careers@drawtiq.studio | `pages` / `careers_content` | Pending |

### 6. Contact (`/contact`)

**File:** `app/(drawtiq)/contact/page.tsx`

| Section | Element | Source | Current Value | Proposed DB Table | Status |
|---------|---------|--------|---------------|-------------------|--------|
| Hero | Eyebrow | Hardcoded | "06 / Start a conversation" | `pages` / `contact_content` | Pending |
| Hero | Heading | Hardcoded | "Have a good idea? / Let's make it work." | `pages` / `contact_content` | Pending |
| Hero | Lead | Hardcoded | "Tell us what you're working on. We'll reply within two business days..." | `pages` / `contact_content` | Pending |
| Copy | Eyebrow | Hardcoded | "Your turn" | `pages` / `contact_content` | Pending |
| Copy | Heading | Hardcoded | "Good things start with a note." | `pages` / `contact_content` | Pending |
| Copy | Paragraph | Hardcoded | "You don't need a perfect brief..." | `pages` / `contact_content` | Pending |
| Copy | Email detail | Hardcoded | "EMAIL US", hello@drawtiq.studio | `contact_settings` | Pending |
| Copy | Steps | Hardcoded ordered list | 3 steps | `pages` / `contact_content` | Pending |
| Form | Action | Hardcoded | `/api/inquiries` | (API route) | Pending |
| Form | Heading | Hardcoded | "PROJECT INQUIRY / 001", "Share as much or as little..." | `contact_settings` | Pending |
| Form | Fields | Hardcoded | Name, Email, Service, Budget, Message, Brief (file) | `contact_settings` (form fields) | Pending |
| Form | Service options | Hardcoded | UI/UX & Product Design, Brand Identity, Graphic Design, Motion Design, Video Editing, Website Design, Ongoing design support, A bit of everything | `contact_settings` (form options) | Pending |
| Form | Budget options | Hardcoded | Under $1,000, $1,000–$3,000, $3,000–$7,500, $7,500+, Let's discuss | `contact_settings` (form options) | Pending |
| Form | Submit | Hardcoded | "Send inquiry" | `contact_settings` | Pending |
| Form | Hint | Hardcoded | "We use these details only to reply to your inquiry. Files are not uploaded..." | `contact_settings` | Pending |

### 7. Pricing (`/pricing`)

**File:** `app/(drawtiq)/pricing/page.tsx` + `components/pricing-plans.tsx`

| Section | Element | Source | Current Value | Proposed DB Table | Status |
|---------|---------|--------|---------------|-------------------|--------|
| Hero | Eyebrow | Hardcoded | "07 / Pricing" | `pages` / `pricing_content` | Pending |
| Hero | Heading | Hardcoded | "Simple pricing. / No surprises." | `pages` / `pricing_content` | Pending |
| Hero | Lead | Hardcoded | "One monthly rate. No timesheets..." | `pages` / `pricing_content` | Pending |
| Plans | Component | `PricingPlans` | 3 plans (Essential, Growth, Studio) | `pricing_plans` | Pending |
| Included | Eyebrow | Hardcoded | "Every plan includes" | `pages` / `pricing_content` | Pending |
| Included | Items | Hardcoded array | 6 items | `pricing_included_features` | Pending |
| Models | Eyebrow | Hardcoded | "Ways to work together" | `pages` / `pricing_content` | Pending |
| Models | Heading | Hardcoded | "Choose your way in." | `pages` / `pricing_content` | Pending |
| Models | Note | Hardcoded | "Plans and projects are built on the same process..." | `pages` / `pricing_content` | Pending |
| Models | Items | Hardcoded array | 3 models (Subscribe, One-off project, Full partnership) | `pricing_engagement_models` | Pending |
| Add-ons | Eyebrow | Hardcoded | "Add-ons" | `pages` / `pricing_content` | Pending |
| Add-ons | Heading | Hardcoded | "One-off extras." | `pages` / `pricing_content` | Pending |
| Add-ons | Note | Hardcoded | "Standalone engagements you can add to any plan..." | `pages` / `pricing_content` | Pending |
| Add-ons | Items | Hardcoded array | 4 add-ons (Brand sprint, Website design & build, Motion pack, Video edit) | `pricing_addons` | Pending |
| FAQs | Eyebrow | Hardcoded | "A few common questions" | `pages` / `pricing_content` | Pending |
| FAQs | Heading | Hardcoded | "Good to know." | `pages` / `pricing_content` | Pending |
| FAQs | Items | Hardcoded array | 4 FAQs | `pricing_faqs` | Pending |
| CTA | Heading | Hardcoded | "Not sure which plan fits?" | `pages` / `pricing_content` | Pending |
| CTA | Paragraph | Hardcoded | "Tell us about the work..." | `pages` / `pricing_content` | Pending |
| CTA | Button | Hardcoded | "Let's talk" → `/contact` | `pages` / `pricing_content` | Pending |
| Disclaimer | Hardcoded | "Prices are shown in USD and are indicative starting points..." | `pages` / `pricing_content` | Pending |

### 8. Services (`/services`)

**File:** `app/(drawtiq)/services/page.tsx` — Data from `getPublishedServices()` → Supabase `services` table (fallback: `fallback-services.ts`)

| Section | Element | Source | Current Value | Proposed DB Table | Status |
|---------|---------|--------|---------------|-------------------|--------|
| Hero | Eyebrow | Hardcoded | "02 / What we do" | `pages` / `services_content` | Pending |
| Hero | Heading | Hardcoded | "Good thinking. / Made useful." | `pages` / `services_content` | Pending |
| Hero | Lead | Hardcoded | "We can take on the whole thing..." | `pages` / `services_content` | Pending |
| Service list | From DB | `services` table | 6 services (see fallback) | `services` | Pending |
| Service note | Hardcoded | "Strategy, design, and the bits in between. / STRATEGY × DESIGN × DELIVERY" | `pages` / `services_content` | Pending |
| Service pair | Hardcoded | 2 panels (Focused project, Ongoing design partner) | `pages` / `services_content` | Pending |
| CTA | Hardcoded | "Not sure what you need?" → `/contact` | `pages` / `services_content` | Pending |

**Fallback services data** (`lib/content/fallback-services.ts`):
- ui-ux-design, digital-product-design, brand-identity, graphic-design, motion-design, video-editing
- Each: slug, title, blurb, icon, tags, sortOrder, detailPath

### 9. Service Detail Pages (`/service-*`)

**File:** `app/(drawtiq)/service-ui-ux/page.tsx` etc. — Data from `getPublishedServiceDetail()` → Supabase `services` table (fallback: `fallback-service-details`)

| Route | Fallback routeSlug | Number | Hero Title | Lead | Visual |
|-------|-------------------|--------|------------|------|--------|
| `/service-ui-ux` | service-ui-ux | 03 | "Make the complex feel obvious." | "We design digital products around real people..." | null |
| `/service-graphic-design` | service-graphic-design | 04 | "Make the idea visible." | "We build identities and graphic systems..." | null |
| `/service-motion-design` | service-motion-design | 05 | "Make the idea move." | "We use motion to explain, guide..." | motion |
| `/service-video-editing` | service-video-editing | 06 | "Find the story in the footage." | "The shoot gives you footage. The edit decides..." | video |

Each service detail includes: deliverables, FAQs, pair panels, CTA, explore link, SEO metadata.

### 10. Work / Portfolio (`/work`)

**File:** `app/(drawtiq)/work/page.tsx` — Data from `getPublishedProjects()` → Supabase `projects` table (fallback: `fallback-projects.ts`)

| Section | Element | Source | Current Value | Proposed DB Table | Status |
|---------|---------|--------|---------------|-------------------|--------|
| Hero | Eyebrow | Hardcoded | "01 / Selected work" | `pages` / `work_content` | Pending |
| Hero | Heading | Hardcoded | "Thoughtful work. / Made to be used." | `pages` / `work_content` | Pending |
| Hero | Lead | Hardcoded | "A few projects, shown properly..." | `pages` / `work_content` | Pending |
| Hero | Kicker | Hardcoded | "SELECTED PROJECTS / 2024—26" | `pages` / `work_content` | Pending |
| Filter bar | Hardcoded | All work, UI/UX, Branding, Graphic | (filter categories) | Pending |
| Projects | From DB | `projects` table | 6 projects (see fallback) | `projects` | Pending |
| CTA | Hardcoded | "Have a good idea?" → `/contact` | `pages` / `work_content` | Pending |
| Disclaimer | Hardcoded | "Portfolio projects shown here are illustrative concepts..." | `pages` / `work_content` | Pending |

**Fallback projects data** (6 projects):
1. **northstar** — Northstar Finance, fintech, featured, sortOrder 1
2. **bloomwell** — Bloomwell, branding, sortOrder 2
3. **form-object** — Form & Object, graphic/art direction, sortOrder 3
4. **orbit** — Orbit Workspace, SaaS/UX, featured, sortOrder 4
5. **goodkind** — Goodkind, branding, sortOrder 5
6. **field-notes** — Field Notes, editorial/graphic, sortOrder 6

### 11. Case Studies (`/case-study/[project]`)

**File:** `app/(drawtiq)/case-study/[project]/page.tsx` — Data from `getPublishedProject()` → Supabase `projects` table

| Element | Source | Current Value | Proposed DB Table | Status |
|---------|--------|---------------|-------------------|--------|
| Category eyebrow | DB field `category` | From project record | `projects` | Pending |
| Title | DB field `title` | From project record | `projects` | Pending |
| Subtitle | DB field `subtitle` | From project record | `projects` | Pending |
| Lead | DB field `lead` (or summary) | From project record | `projects` | Pending |
| Meta (discipline, industry, scope) | DB fields | From project record | `projects` | Pending |
| Visual | Component `CaseStudyVisual` | From project visualKey | `projects` | Pending |
| Challenge heading | Hardcoded | "Find the signal in the noise." | `projects` (challenge) | Pending |
| Challenge body | DB field `challenge` | From project record | `projects` | Pending |
| Challenge paragraph | Hardcoded | "The experience needed to help people..." | `projects` (challenge detail) | Pending |
| Approach heading | Hardcoded | "Start with the human question." | `projects` (approach) | Pending |
| Approach body | DB field `approach` | From project record | `projects` | Pending |
| Solution heading | Hardcoded | "Clarity built into the system." | `projects` (solution) | Pending |
| Solution body | DB field `solution` | From project record | `projects` | Pending |
| Solution stats | Hardcoded | 3 stats | `projects` | Pending |
| Outcome heading | Hardcoded | "Designed for better decisions." | `projects` (outcome) | Pending |
| Outcome body | DB field `outcome` | From project record | `projects` | Pending |
| Outcome disclaimer | Hardcoded | "All names, screens, and results are illustrative..." | `projects` | Pending |
| CTA | Hardcoded | "Have a similar challenge?" → `/contact` | `projects` | Pending |

### 12. Insights List (`/insights`)

**File:** `app/(drawtiq)/insights/(list)/page.tsx` — Data from `getPublishedPosts()` → Supabase `blog_posts` table

| Section | Element | Source | Current Value | Proposed DB Table | Status |
|---------|---------|--------|---------------|-------------------|--------|
| Hero | Eyebrow | Hardcoded | "06 / Notes from the studio" | `pages` / `insights_content` | Pending |
| Hero | Heading | Hardcoded | "Notes from / the work." | `pages` / `insights_content` | Pending |
| Hero | Lead | Hardcoded | "What we're learning about design..." | `pages` / `insights_content` | Pending |
| Posts | From DB | `blog_posts` table | 5 posts (see fallback) | `blog_posts` | Pending |
| Empty state | Hardcoded | "New studio notes are on the way..." | `pages` / `insights_content` | Pending |
| CTA | Hardcoded | "Want this thinking on your product?" → `/contact` | `pages` / `insights_content` | Pending |

**Fallback posts data** (5 posts):
1. clarity-is-a-feature — "Clarity is a feature, not a finishing touch." — Design principles — 5 min read — 2026-08-14
2. consistency-without-predictability — "Consistency doesn't have to mean predictable." — Brand systems — 7 min read — 2026-07-30
3. the-better-question — "The best interface is built on a better question." — Product thinking — 4 min read — 2026-07-09
4. motion-is-a-language — "Motion is a language, not a decoration." — Motion design — 6 min read — 2026-06-18
5. editing-writes-the-story — "Editing is where the story is written." — Video editing — 5 min read — 2026-05-27

### 13. Insights Detail (`/insights/[slug]`)

**File:** `app/(drawtiq)/insights/[slug]/page.tsx` — Data from `getPublishedPost()` → Supabase `blog_posts` table

| Element | Source | Current Value | Proposed DB Table | Status |
|---------|--------|---------------|-------------------|--------|
| Category | DB field `category` | From post record | `blog_posts` | Pending |
| Title | DB field `title` | From post record | `blog_posts` | Pending |
| Excerpt | DB field `excerpt` | From post record | `blog_posts` | Pending |
| Meta (date, readTime) | DB fields | From post record | `blog_posts` | Pending |
| Body blocks | DB field `body` (JSONB array) | From post record | `blog_posts` | Pending |
| Related posts | From DB | Other published posts | `blog_posts` | Pending |
| CTA | Hardcoded | "Have a project in mind?" → `/contact` | `pages` / `insights_content` | Pending |

### 14. Testimonials (component, used on homepage)

**File:** `components/testimonial-carousel.tsx`

| Element | Source | Current Value | Proposed DB Table | Status |
|---------|--------|---------------|-------------------|--------|
| Eyebrow | Hardcoded | "05 / What we aim for" | `testimonials` | Pending |
| Testimonials | Hardcoded array | 5 items (quote, emphasis, number, label) | `testimonials` | Pending |
| Note: "A small studio manifesto, not invented client feedback." | — | — | — | — |

---

## Component Content Inventory

### Nav (`components/nav.tsx`)
- Logo: `/assets/Drawtiq-logo.png`
- Links: Work (`/work`), Services (`/services`), Pricing (`/pricing`), About (`/about`), Insights (`/insights`), Careers (`/careers`)
- Header CTA: "Start a project" → `/contact`
- Mobile contact: "Have a project in mind?" → `/contact`

### Footer (`components/footer.tsx`)
- Logo: `/assets/Drawtiq-logo-white.png`
- Description: "Small studio. Clear thinking. Work made to be used."
- Links: Work, Services, Pricing, About, Insights, Careers
- Social: hello@drawtiq.studio (mailto), Start a project (`/contact`)
- Copyright: dynamic year + "Drawtiq Studio. Made with care."
- Bottom: "DESIGNED TO MOVE YOU."

### Pricing Plans (`components/pricing-plans.tsx`)
- 3 plans: Essential ($2400/mo, $2000/qtr), Growth ($4800/mo, $4100/qtr, featured), Studio ($9600/mo, $8400/qtr)
- Each: name, tagline, monthly price, quarterly price, CTA, features array

### Testimonial Carousel (`components/testimonial-carousel.tsx`)
- 5 testimonials: Clarity, Questions, Shipping, Handover, Details
- Note: "A small studio manifesto, not invented client feedback."

---

## Asset Inventory

**Images:**
- `/assets/Drawtiq-logo.png` — Nav logo
- `/assets/Drawtiq-logo-white.png` — Footer logo
- `/assets/Drawtiq-favicon.png` — Favicon
- `/assets/favicon.ico` — Favicon
- `/assets/favicon.png` — Favicon
- `/assets/about/drawtiq.jpg` — About image
- `/assets/about/drawtiq-studio-800.webp` through `-2560.webp` — About responsive images
- `/assets/services/brand-identity.svg` — Service preview
- `/assets/services/digital-product.svg` — Service preview
- `/assets/services/graphic-design.svg` — Service preview
- `/assets/services/motion-design.svg` — Service preview
- `/assets/services/ui-ux.svg` — Service preview
- `/assets/services/video-editing.svg` — Service preview
- `/assets/studio/drawtiq_orbital_chart.gif` — Studio visual fallback
- `/assets/studio/drawtiq_orbital_chart.mp4` — Studio visual
- `/assets/studio/drawtiq_orbital_chart.webm` — Studio visual
- `/assets/studio/drawtiq_orbital_chart_poster.webp` — Studio poster

**No images are stored in Supabase Storage yet — all are local `/public/assets/` files.**

---

## Admin Routes Inventory

| Route | Page File | Function | Status |
|-------|-----------|----------|--------|
| `/admin/login` | `app/admin/login/page.tsx` + `login-form.tsx` | Supabase auth sign-in | Functional |
| `/admin` | `app/admin/(protected)/page.tsx` | Dashboard with counts | Functional |
| `/admin/projects` | `app/admin/(protected)/projects/page.tsx` | List projects | Functional |
| `/admin/projects/new` | `app/admin/(protected)/projects/new/page.tsx` | Create project | Functional |
| `/admin/projects/[id]` | `app/admin/(protected)/projects/[id]/page.tsx` | Edit project | Functional |
| `/admin/services` | `app/admin/(protected)/services/page.tsx` | List services | Functional |
| `/admin/services/new` | `app/admin/(protected)/services/new/page.tsx` | Create service | Functional |
| `/admin/services/[id]` | `app/admin/(protected)/services/[id]/page.tsx` | Edit service | Functional |
| `/admin/posts` | `app/admin/(protected)/posts/page.tsx` | List blog posts | Functional |
| `/admin/posts/new` | `app/admin/(protected)/posts/new/page.tsx` | Create post | Functional |
| `/admin/posts/[id]` | `app/admin/(protected)/posts/[id]/page.tsx` | Edit post | Functional |
| `/admin/inquiries` | `app/admin/(protected)/inquiries/page.tsx` | List inquiries | Functional |
| `/admin/inquiries/[id]` | `app/admin/(protected)/inquiries/[id]/page.tsx` | View/update inquiry status | Functional |

**Missing admin sections:** Global settings, Header/Nav, Homepage sections, About, Careers, Pricing, Contact, Footer, SEO, Testimonials, Team members.

---

## Existing Database Schema (verified live)

Tables confirmed on project `cpirkzcffqkzktdlboip`:
- `admin_users` — user_id (uuid, PK), email (text), created_at
- `projects` — id, slug, title, subtitle, category, discipline, industry, scope, summary, challenge, approach, solution, outcome, visual_key, cover_image_path, gallery (jsonb), featured, status, sort_order, seo_title, seo_description, published_at, created_by, created_at, updated_at
- `services` — id, slug, title, blurb, intro, icon, preview_path, tags (text[]), deliverables (jsonb), faqs (jsonb), status, sort_order, seo_title, seo_description, published_at, created_by, created_at, updated_at
- `blog_posts` — id, slug, title, excerpt, category, read_time, visual, label, display (jsonb), body (jsonb), status, sort_order, seo_title, seo_description, published_at, created_by, created_at, updated_at
- `inquiries` — id, name, email, service, budget, message, source, status, created_at, updated_at
- `inquiry_rate_limits` — rate_key, window_started_at, request_count

RLS policies: public can read only `published` content; authenticated admins can manage all content; inquiries insert-only via `submit_inquiry()` function with rate limiting.

---

## Current Record Counts (live DB)

All content tables are **empty** (no records imported yet). The public site relies entirely on hardcoded fallback content.

---

## Machine-Readable Snapshot

A JSON snapshot of all extractable content has been created at `docs/content-snapshot.json`. This snapshot excludes secrets, credentials, and personal data (no inquiry data, no user emails/passwords).

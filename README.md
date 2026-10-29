# Drawtiq — Next.js

Next.js conversion of the Drawtiq design agency website.

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Live site: [https://drawtiq.netlify.app](https://drawtiq.netlify.app)

## Structure

- `app/` — Next.js App Router pages
- `components/` — Reusable UI components
- `lib/content/` — Public Supabase content fetchers, view models, and fallbacks
- `lib/email/` — Optional inquiry notification provider adapter
- `lib/supabase/` — Browser and server Supabase clients
- `styles/` — Global CSS and design tokens
- `public/` — Static assets
- `supabase/migrations/` — Database schema, RLS, and grants

## Supabase setup

The public site does not require Supabase to build or run. The admin is only
available after the project and credentials are configured.

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and add the project URL and anon key.
   The anon key is safe for the browser because RLS enforces access. Also set
   `NEXT_PUBLIC_SITE_URL` to the canonical public URL
   (`https://drawtiq.netlify.app`) so invitation and recovery emails never
   point at localhost.
3. Apply the migrations in `supabase/migrations/` with the Supabase CLI:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
   Or paste the migrations into the Supabase SQL editor in filename order.
4. In Supabase Authentication, create the authorized admin user. Confirm the
   email if confirmations are enabled, and disable public sign-ups if the
   project does not need them.
5. Add that first user to the allowlist as a Super Admin (`owner`). This is
   the only manual SQL step; everyone else is invited from **Team & access**:
   ```sql
   insert into public.admin_users (user_id, email, role)
   select id, email, 'owner'
   from auth.users
   where email = 'the-admin@example.com';
   ```
6. Restart the dev server and sign in at `/admin/login`.

### Team roles and access

Roles are stored in `public.admin_users`, never in user-editable Auth metadata,
and enforced by RLS through `current_admin_role()`. Two migrations power it:

- `20261028000400_admin_roles.sql` adds the `role` column. The oldest existing
  allowlisted account becomes `owner` (Super Admin); any others become `admin`.
- `20261029000100_team_access.sql` adds `status` (active/suspended), display
  names, invitation metadata, the `admin_audit_log`, a guard that always keeps
  one active Super Admin, owner-only team functions, and restricts site
  settings and inquiry changes to owner/admin. Existing rows become `active`.

Until both are applied, the app treats every allowlisted user as a Super Admin
(the pre-roles behaviour), so nobody is locked out.

| Permission | Super Admin (`owner`) | Admin | Editor | Viewer |
| --- | --- | --- | --- | --- |
| Dashboard, analytics, read inquiries | Yes | Yes | Yes | Yes |
| Edit website pages and content collections | Yes | Yes | Yes | — |
| Edit site settings, navigation, footer | Yes | Yes | — | — |
| Change or delete inquiries, analytics retention | Yes | Yes | — | — |
| Invite, change roles, suspend, remove team members | Yes | — | — | — |

Nobody can change, suspend, or remove their own access, and the database
refuses any change (from the app, SQL editor, or an Auth user deletion) that
would leave no active Super Admin. Direct writes to `admin_users` are revoked
from API users; every team change goes through an owner-checked function and is
written to `admin_audit_log` by a trigger.

**Team & access → Team members** (`/admin/team`, Super Admin only) lists name,
email, role, status, invitation state, and last sign-in, with search and
role/status filters. From there a Super Admin can:

- **Invite to team** (name, email, role Admin/Editor/Viewer): the database is
  checked first. An email already on the team is rejected; an email that
  already has a Supabase login is added with that login's UUID and no email.
  Otherwise the Supabase Auth user is created by invitation and the team row is
  written with the new UUID. Invitations need `SUPABASE_SERVICE_ROLE_KEY` on the
  server; without it only existing logins can be added. If the email is sent
  but the team insert fails, the screen says so and resubmitting finishes the
  job without a second email. Promote someone to Super Admin from the list.
- **Change role**, **Edit name**, **Suspend / Restore access** (keeps the row,
  role, and history), **Resend invite / Send setup link**, and **Remove**
  (deletes only the allowlist row; the Auth login, authored content, and audit
  history stay).

Suspension and removal take effect on the member's next request because every
RLS check reads the live row. **My account** (`/admin/account`) lets every
member change their display name and password.

### Invites and password recovery

| Route | Purpose |
| --- | --- |
| `/admin/login` | Sign in, with an inline "Forgot your password?" form. |
| `/admin/forgot-password` | Standalone reset request (linked from expired links). |
| `/admin/set-password` | Lands from invite and recovery emails; sets the password. |
| `/admin/reset-password` | Alias of `/admin/set-password` (keeps the token fragment). |
| `/admin/account` | Signed-in password change (`/admin/update-password` redirects here). |
| `/auth/callback` | Server completion for PKCE `code` and `token_hash` links. |

`/admin/set-password` accepts implicit-flow fragments (`#access_token=…`),
`?token_hash=…&type=…`, and PKCE `?code=…`. It removes every token from the
address bar before creating a Supabase client, validates the session with
Supabase, and shows a clear "invalid or expired" state with a **Request a new
link** button otherwise. After a successful change, other sessions are signed
out and the user is sent to `/admin`. Reset requests always use implicit-flow
links so they work when the email is opened on another device.

Supabase Dashboard → **Authentication → URL Configuration**:

- Site URL: `https://drawtiq.netlify.app`
- Redirect URLs:
  - `https://drawtiq.netlify.app/admin/set-password`
  - `https://drawtiq.netlify.app/auth/callback`
  - `http://localhost:3000/admin/set-password`
  - `http://localhost:3000/auth/callback`
  - Optional for Netlify deploy previews: `https://*--drawtiq.netlify.app/**`

Netlify → **Site configuration → Environment variables**:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` = `https://drawtiq.netlify.app` (no trailing slash). Redeploy
  after changing it; `NEXT_PUBLIC_` values are inlined at build time.
- `SUPABASE_SERVICE_ROLE_KEY` (optional, secret, runtime/functions scope only).

Recommended: in Supabase → **Authentication → Emails**, configure custom SMTP.
The built-in sender is heavily rate-limited, which makes invitations and resets
fail with "rate limit" errors. Optionally, for the most robust links, change the
**Invite user** and **Reset password** templates to
`{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=invite&next=/admin/set-password`
(use `type=recovery` for the reset template). The default templates also work.

If a link still opens the homepage, Supabase fell back to its Site URL because
the redirect was not allowlisted; the site forwards those tokens to the password
screen automatically.

## Admin and public content

- `/admin` is outside the public `(drawtiq)` layout and is `noindex`.
- The middleware refreshes the Supabase session on admin routes only.
- The protected layout checks `public.admin_users`; RLS repeats the check for
  every content and inquiry operation.
- Public users can read only `published` projects, services, and posts, and can
  submit validated inquiries through `POST /api/inquiries`.
- The public work, case study, services, service detail, insights, and insight
  detail pages read published Supabase content with the anon key. RLS remains
  the final access boundary.
- The original hardcoded content is still bundled as a fallback. In the default
  `auto` mode, a content type uses Supabase as soon as it has a published row;
  otherwise it uses the fallback. Set `PUBLIC_CONTENT_SOURCE=fallback` while
  reviewing content, or `PUBLIC_CONTENT_SOURCE=database` to force database-only
  rendering and use the public empty states.
- Public content pages revalidate every 60 seconds. Admin project, service, and
  post mutations also revalidate the affected public paths immediately.
- Service slugs map to the existing public URLs: `ui-ux-design` and
  `digital-product-design` → `/service-ui-ux`; `brand-identity` and
  `graphic-design` → `/service-graphic-design`; `motion-design` →
  `/service-motion-design`; `video-editing` → `/service-video-editing`.
- Project `visual_key` values `fintech`, `bloom`, `form`, `orbit`, `goodkind`,
  and `field-notes` keep the existing visual treatments. Unknown keys use the
  form treatment.
- Post `display` should be a JSON object with an `html` string, for example
  `{ "html": "Less,<br /><em>but better.</em>" }`. Post `body` accepts `p`,
  `h2`, `quote`, and `list` blocks.
- The existing home and contact forms now POST to `/api/inquiries`. The API
  validates and sanitizes every field on the server, rejects non-JSON bodies,
  limits requests to 32 KB, and uses a honeypot plus a minimum form-completion
  time. It stores `name`, `email`, `service`, `budget`, `message`, the
  submission timestamp, and `status = 'new'`.
- Direct inserts into `public.inquiries` are revoked. The only public write path
  is the `submit_inquiry` database function, which enforces five submissions per
  email address in 15 minutes and fifteen per IP hash in 10 minutes. Email and IP
  keys are stored as hashes only. Set `INQUIRY_HASH_SALT` to a long random value
  in production so stored IP hashes are not predictable. Rate-limited requests
  receive `429` with a `Retry-After` header.
- Inquiry email notifications are optional. Set `EMAIL_PROVIDER=resend` and the
  `RESEND_API_KEY`, `INQUIRY_NOTIFICATION_TO`, and `INQUIRY_NOTIFICATION_FROM`
  environment values to enable them. If those values are blank, the inquiry is
  still stored and the app does not attempt delivery. No API key is committed or
  invented; configure a real key only in `.env.local` or the host environment.
  Notification delivery is best-effort and never causes a stored inquiry to be
  reported as a failure.
- Uploads are not implemented. The optional brief file input remains for the
  existing layout but its contents are never read or sent; the client sends JSON
  only and the API rejects multipart form data. A file path can be managed as
  content metadata in the admin, but there is no file storage or upload route.

### Visitor analytics

The primary admin dashboard is first-party visitor analytics. It is enabled by
the `20261028000300_visitor_analytics.sql` migration and shows a clear empty
state until real events exist.

- Public pages send anonymous page-view events to `POST /api/analytics`. The
  route derives device, browser, OS, and approximate geography from request
  headers, normalizes referrers to origin + path, and never stores IP addresses.
- The browser creates a random visitor ID in `localStorage` and a 30-minute
  session ID in `sessionStorage`. No names, emails, fingerprints, or cross-site
  identifiers are collected. Visitors can allow or decline analytics; Do Not
  Track and Global Privacy Control disable collection automatically.
- The public client is insert-only through the validated
  `public.record_analytics_event` database function. Direct table writes are
  revoked. RLS allows only allowlisted admins to read sessions or page views.
- `/admin` shows totals, comparisons with the previous period, daily/weekly/
  monthly trends, top pages, sources, referrers, device/browser/OS breakdowns,
  and recent visitors. `/admin/analytics/visitors` lists anonymous visitors and
  `/admin/analytics/visitors/[id]` shows session and navigation history.
- Analytics failures are best-effort and never block or break a public request.
  The analytics route accepts and drops events when Supabase is not configured.
- Retention is admin-controlled. Call `select public.prune_analytics(180);` from
  the Supabase SQL editor (or schedule it) to delete sessions and page views
  older than the chosen window. The helper accepts 30–3650 days.
- The analytics migration must be applied before the dashboard can read data.
  It is intentionally not applied by the application at runtime.

### Admin screens

The sidebar groups screens by what they edit. Groups can be collapsed (the
group holding the current page stays open), and links a role cannot use are
hidden; the server and RLS repeat every check.

- **Dashboard**: Overview (`/admin`), Analytics (`/admin/analytics/visitors`),
  Inquiries (`/admin/inquiries`).
- **Website pages** (`/admin/pages/[page]`): Homepage, Work / Portfolio, Case
  Studies, Services, About, Pricing, Careers, Insights / Blog, Contact. Each
  screen lists the existing CMS records that feed that page (for example
  `pricing_plans`, `pricing_faqs`, and the `pricing` rows of `page_sections`)
  with ordering and visibility controls, and links to the collections it uses.
- **Content**: Projects, Services, Blog posts, Testimonials, Public team (the
  About page's `team_members`, not admin users), and All collections
  (`/admin/cms`).
- **Team & access**: Team members (`/admin/team`) and My account.
- **Site settings** (`/admin/settings`): global settings, header navigation,
  footer links, footer social links, and header/footer labels only.

Every record, however you reach it, opens the one shared editor at
`/admin/cms/[table]/[id]` (or the project, service, and post editors), so there
are no duplicate editors or content stores. Saving revalidates the public site.
`global_settings` has legacy duplicate rows; the list marks the live row and
labels the others "Unused duplicate". They are left in place for you to delete.

Forms use server actions and re-check the signed-in user's role and RLS on every
mutation. Complex content fields are JSON textareas: project `gallery`, service
`deliverables`/`faqs`, and post `display`/`body`. Invalid JSON is rejected
server-side and shown under the relevant field. Draft and archived content is
visible only to roles that can manage content.

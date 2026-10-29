# Drawtiq — Next.js

Next.js conversion of the Drawtiq design agency website.

## Run

```bash
npm run dev
```

Open [https://enchanting-sorbet-b7a714.netlify.app/](https://enchanting-sorbet-b7a714.netlify.app/)

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
5. Add that user to the allowlist with a role. The first account should be an
   owner; later team members default to viewer in the database:
   ```sql
   insert into public.admin_users (user_id, email, role)
   select id, email, 'owner'
   from auth.users
   where email = 'the-admin@example.com';
   ```
6. Restart the dev server and sign in at `/admin/login`.

### Team roles

Roles are stored in `public.admin_users.role`, not in user-editable profile
metadata. This keeps them authoritative for RLS and lets an owner change them
without changing the auth user. Apply
`supabase/migrations/20261028000400_admin_roles.sql` before using the Team
screen. The oldest existing allowlisted account becomes owner; any other
existing accounts become admin so the owner can review them. New rows default to
viewer.

| Role | Access |
| --- | --- |
| `owner` | Everything, including adding team members and changing roles. |
| `admin` | Content, inquiries, analytics, and retention. Cannot manage roles. |
| `editor` | Create/edit projects, services, posts, and CMS content; update inquiry status. |
| `viewer` | Read-only dashboard, analytics, and inquiries. Content editors are hidden. |

The owner-only **Team** screen at `/admin/team` lists allowlisted users and lets
the owner change roles, add an existing Supabase Auth user by email, or remove
admin access without deleting the auth account. New users always start as
`viewer`; promote them deliberately. You can also set a role directly in the
Supabase table editor:

```sql
update public.admin_users
set role = 'editor'
where email = 'teammate@example.com';
```

Invite users from **Supabase Authentication** first. The website cannot create
auth users because it intentionally does not hold the service-role key.

### Invites and password recovery

Invitation and recovery emails end on `/admin/set-password`, where the user
chooses a password before entering the admin. The sign-in page also has a
"Forgot your password?" form that requests a new recovery email.

In Supabase, open **Authentication → URL Configuration** and allow both the
password screen and the callback:

- Site URL: `https://drawtiq.netlify.app`
- Redirect URLs:
  - `https://drawtiq.netlify.app/admin/set-password`
  - `https://drawtiq.netlify.app/auth/callback`
  - `http://localhost:3000/admin/set-password`
  - `http://localhost:3000/auth/callback`

If the reset or invitation email still opens `localhost`, Supabase is falling
back to its **Site URL**. Change that value to the live domain. Dashboard
invitations use the Site URL; the app's own "Forgot your password?" form uses
`NEXT_PUBLIC_SITE_URL` (or the current origin if it is unset).

Set `NEXT_PUBLIC_SITE_URL=https://drawtiq.netlify.app` in both `.env.local` and
the Netlify environment variables, then redeploy. Restart the local dev server
after changing it. If a reset is requested from localhost while the canonical
URL is the live site, the app uses an implicit-flow recovery link so the token
is not tied to localhost's PKCE cookie.

Links already configured to land on the site root are forwarded to the password
screen with their token intact. PKCE and token-hash links are completed by
`/auth/callback`; implicit-flow links are completed in the browser.

After accepting an invitation, make sure the user is also added to
`public.admin_users` with an appropriate role. Without that allowlist row the
password can be set, but the admin will show "Access denied." Owners can add
them from `/admin/team`; the role defaults to `viewer` if omitted.

Do not add `SUPABASE_SERVICE_ROLE_KEY` to the Next.js environment. The app uses
the anon key plus the signed-in user session; the service role key bypasses RLS
and should only be used for trusted one-off setup.

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

- `/admin` — Dashboard with visitor analytics and a secondary content overview.
- `/admin/analytics/visitors` — anonymous visitor list with date filters and
  search; each row links to session and navigation history.
- `/admin/projects` — list, create, edit, publish, and delete portfolio projects.
- `/admin/services` — list, create, edit, publish, and delete services.
- `/admin/posts` — list, create, edit, publish, and delete blog posts.
- `/admin/inquiries` — filter and read inquiries, with a status update on each
  inquiry detail page.
- `/admin/cms` - edit homepage sections, navigation, footer, and settings.
- `/admin/team` - owner-only team list and role management.

The admin sidebar groups Dashboard and Visitors under **Overview**, studio
content pages under **Main pages**, and the owner-only Team screen under
**Account**. Links and server actions are filtered by role; RLS repeats the
permission checks in the database.

Forms use server actions and re-check the signed-in user's role and RLS on every
mutation. Complex content fields are JSON textareas: project `gallery`, service
`deliverables`/`faqs`, and post `display`/`body`. Invalid JSON is rejected
server-side and shown under the relevant field. Draft and archived content is
visible only to roles that can manage content.

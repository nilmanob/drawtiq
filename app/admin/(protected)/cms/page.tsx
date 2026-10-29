import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { hasPermission } from "@/lib/auth/roles";
import { AdminPageHeader } from "../_components/admin-ui";
import { cmsTablePermission, isCmsTable } from "./config";
import { CMS_TABLE_DESCRIPTIONS, CMS_TABLE_LABELS } from "./schema";

const GROUPS: { title: string; tables: string[] }[] = [
  {
    title: "Site & navigation",
    tables: ["global_settings", "nav_items", "footer_links", "footer_social"],
  },
  {
    title: "Homepage & about",
    tables: [
      "homepage_sections",
      "testimonials",
      "about_sections",
      "about_values",
      "team_members",
    ],
  },
  {
    title: "Page copy & SEO",
    tables: ["page_sections"],
  },
  {
    title: "Pricing",
    tables: [
      "pricing_plans",
      "pricing_plan_features",
      "pricing_included_features",
      "pricing_addons",
      "pricing_engagement_models",
      "pricing_faqs",
    ],
  },
  {
    title: "Careers",
    tables: ["careers_roles", "careers_perks", "careers_process", "careers_faqs"],
  },
  {
    title: "Contact",
    tables: ["contact_settings", "contact_form_fields"],
  },
];

export default async function CmsIndexPage() {
  const { admin } = await getAdminSession();
  const groups = GROUPS.map((group) => ({
    ...group,
    tables: group.tables.filter(
      (table) =>
        admin && isCmsTable(table) && hasPermission(admin.role, cmsTablePermission(table))
    ),
  })).filter((group) => group.tables.length > 0);

  return (
    <>
      <AdminPageHeader
        kicker="Content"
        title="All collections"
        description="Every CMS collection in one list. The same records are also grouped by page under Website pages."
      />

      <p className="admin-field-hint" style={{ marginBottom: "22px" }}>
        Projects, services, and blog posts have their own editors:{" "}
        <Link className="admin-text-link" href="/admin/projects">Projects</Link>,{" "}
        <Link className="admin-text-link" href="/admin/services">Services</Link>, and{" "}
        <Link className="admin-text-link" href="/admin/posts">Blog posts</Link>.
      </p>

      <div className="admin-cms-grid">
        {groups.map((group) => (
          <section className="admin-panel" key={group.title}>
            <div className="admin-panel-header">
              <div>
                <p className="admin-kicker">{group.title}</p>
                <h2>{group.tables.length} collections</h2>
              </div>
            </div>
            <ul className="admin-cms-list">
              {group.tables.map((table) => (
                <li key={table}>
                  <Link className="admin-record-link" href={`/admin/cms/${table}`}>
                    <strong>{CMS_TABLE_LABELS[table] ?? table}</strong>
                    <span>{CMS_TABLE_DESCRIPTIONS[table] ?? "Protected CMS collection."}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

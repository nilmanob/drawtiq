import type { Metadata } from "next";
import { AdminPageHeader } from "../_components/admin-ui";
import { CmsCollectionTable } from "../cms/collection-table";
import type { CmsTable } from "../cms/config";

export const metadata: Metadata = {
  title: "Site settings",
};

const RETURN_TO = "/admin/settings";

// Only global configuration. Page content lives under Website pages.
const SETTINGS: {
  table: CmsTable;
  pageKey?: string;
  title: string;
  description: string;
}[] = [
  {
    table: "global_settings",
    title: "General",
    description:
      "Site name, logos, contact and careers email, footer copy, social links, and default SEO.",
  },
  {
    table: "nav_items",
    title: "Header navigation",
    description: "Links in the site header, in order.",
  },
  {
    table: "footer_links",
    title: "Footer links",
    description: "Link lists in the footer.",
  },
  {
    table: "footer_social",
    title: "Footer social links",
    description: "Social and contact links in the footer.",
  },
  {
    table: "page_sections",
    pageKey: "global",
    title: "Header & footer labels",
    description:
      "Logo alt text and the call-to-action labels and links in the header, mobile menu, and footer.",
  },
];

export default function SiteSettingsPage() {
  return (
    <>
      <AdminPageHeader
        kicker="Site settings"
        title="Site settings"
        description="Global configuration shared by every page. Page content is edited under Website pages."
      />

      <div className="admin-page-sections">
        {SETTINGS.map((setting) => (
          <section className="admin-panel" key={setting.table}>
            <div className="admin-panel-header">
              <div>
                <p className="admin-kicker">Settings</p>
                <h2>{setting.title}</h2>
                <p className="admin-field-hint">{setting.description}</p>
              </div>
            </div>
            <CmsCollectionTable
              table={setting.table}
              pageKey={setting.pageKey}
              returnTo={RETURN_TO}
            />
          </section>
        ))}
      </div>
    </>
  );
}

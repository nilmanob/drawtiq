import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "../../_components/admin-ui";
import { CmsCollectionTable } from "../../cms/collection-table";
import { CMS_TABLE_LABELS } from "../../cms/schema";
import { CollectionSummary } from "../collection-summary";
import { getWebsitePage } from "../config";

type PageEditorProps = { params: { page: string } };

export function generateMetadata({ params }: PageEditorProps): Metadata {
  return { title: getWebsitePage(params.page)?.label ?? "Page" };
}

export default function WebsitePageEditor({ params }: PageEditorProps) {
  const page = getWebsitePage(params.page);
  if (!page) notFound();

  const returnTo = `/admin/pages/${page.key}`;

  return (
    <>
      <AdminPageHeader
        kicker="Website pages"
        title={page.label}
        description={page.description}
        actions={
          <a
            className="admin-button admin-button-secondary"
            href={page.publicHref}
            target="_blank"
            rel="noreferrer"
          >
            View page ↗
          </a>
        }
      />

      <div className="admin-page-sections">
        {page.sections.map((section) => (
          <section
            className="admin-panel"
            key={`${section.table}:${section.pageKey ?? ""}`}
          >
            <div className="admin-panel-header">
              <div>
                <p className="admin-kicker">
                  {CMS_TABLE_LABELS[section.table] ?? section.table}
                  {section.pageKey ? ` / ${section.pageKey}` : ""}
                </p>
                <h2>{section.title}</h2>
                <p className="admin-field-hint">{section.description}</p>
              </div>
            </div>
            <CmsCollectionTable
              table={section.table}
              pageKey={section.pageKey}
              returnTo={returnTo}
            />
          </section>
        ))}

        {page.collections?.length ? (
          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <p className="admin-kicker">Content collections</p>
                <h2>Also on this page</h2>
              </div>
            </div>
            <ul className="admin-cms-list">
              {page.collections.map((collection) => (
                <li key={collection.table}>
                  <CollectionSummary collection={collection} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <p className="admin-field-hint">
        Saving a record updates the public page right away. Hidden or empty
        sections fall back to the built-in content for that section.
      </p>
    </>
  );
}

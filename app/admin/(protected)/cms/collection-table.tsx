import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { describeDbError } from "@/lib/admin/errors";
import type { CmsTable } from "./config";
import {
  moveCmsRecordDown,
  moveCmsRecordUp,
  toggleCmsVisibilityAction,
} from "./actions";
import { CMS_SCHEMAS, SINGLETON_TABLES } from "./schema";

// The public site reads these fixed ids first (lib/content/cms.ts), then the
// lowest id. Other rows are legacy duplicates the site never shows.
const CANONICAL_SINGLETON_IDS: Record<string, string> = {
  global_settings: "00000000-0000-0000-0000-000000000001",
  contact_settings: "00000000-0000-0000-0000-000000000002",
};

function recordLabel(record: any) {
  return (
    record.site_name ||
    record.title ||
    record.name ||
    record.label ||
    record.section_key ||
    record.field_name ||
    record.role ||
    record.question ||
    record.feature_text ||
    record.hero_heading ||
    record.form_heading ||
    record.id
  );
}

function recordSubtitle(record: any) {
  return record.meta || record.tagline || record.body || record.quote || record.answer || record.note || "";
}

/** Accept only same-site admin paths as a return destination. */
export function safeAdminReturn(value: string | undefined) {
  return value && /^\/admin(\/[a-z0-9_\-/]*)?$/.test(value) && !value.includes("//")
    ? value
    : undefined;
}

/** Appends ?return= so editors come back to the page they started from. */
export function cmsHref(path: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

/**
 * The shared list for every CMS collection: ordering, visibility toggles, and
 * links into the single record editor at /admin/cms/[table]/[id]. Page editors
 * render it filtered to their own page_sections rows, so there is one editor
 * per record however you navigate to it.
 */
export async function CmsCollectionTable({
  table,
  pageKey,
  returnTo,
}: {
  table: CmsTable;
  /** Limit page_sections to one page. */
  pageKey?: string;
  /** Where the record editor's back link should go. */
  returnTo?: string;
}) {
  const supabase = createSupabaseServerClient();
  const fields = CMS_SCHEMAS[table] ?? [];
  const canOrder = fields.some((field) => field.name === "order_index");
  const isSingleton = (SINGLETON_TABLES as readonly string[]).includes(table);

  let query = supabase.from(table).select("*");
  if (pageKey) {
    query = query.eq("page_key", pageKey);
  }

  const { data, error } = canOrder
    ? await query
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: true })
    : isSingleton
      ? await query.order("id", { ascending: true })
      : await query;

  const records = data ?? [];
  const hasVisibility = fields.some((field) => field.name === "is_visible");
  const showCreate = !isSingleton || records.length === 0;
  const liveSingletonId = isSingleton
    ? records.some((record: any) => record.id === CANONICAL_SINGLETON_IDS[table])
      ? CANONICAL_SINGLETON_IDS[table]
      : (records[0] as any)?.id
    : undefined;
  const newHref = cmsHref(`/admin/cms/${table}/new`, {
    page_key: pageKey,
    return: returnTo,
  });

  if (error) {
    return <p className="admin-alert admin-alert-error">{describeDbError(error)}</p>;
  }

  if (records.length === 0) {
    return (
      <div className="admin-empty admin-empty-compact">
        <p>No records yet. The public page uses its built-in content.</p>
        {showCreate ? (
          <Link className="admin-text-link" href={newHref}>
            {isSingleton ? "Create settings" : "Create the first record"}
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Record</th>
              {canOrder ? <th>Order</th> : null}
              {hasVisibility ? <th>Visible</th> : null}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record: any, index: number) => {
              const subtitle = recordSubtitle(record);
              const editHref = cmsHref(`/admin/cms/${table}/${record.id}`, {
                return: returnTo,
              });
              const isDuplicate = isSingleton && record.id !== liveSingletonId;

              return (
                <tr key={record.id}>
                  <td>
                    <Link className="admin-record-link" href={editHref}>
                      <strong>{recordLabel(record)}</strong>
                      <span>
                        {record.page_key
                          ? `Page: ${record.page_key} / ${record.section_key}`
                          : isSingleton
                            ? isDuplicate
                              ? "Unused duplicate: not shown on the site"
                              : "Live record"
                            : record.id}
                      </span>
                      {subtitle ? <span className="admin-table-preview">{subtitle}</span> : null}
                    </Link>
                  </td>
                  {canOrder ? <td>{record.order_index ?? "—"}</td> : null}
                  {hasVisibility ? (
                    <td>
                      <span className={`admin-badge ${record.is_visible ? "admin-badge-published" : "admin-badge-archived"}`}>
                        {record.is_visible ? "Visible" : "Hidden"}
                      </span>
                    </td>
                  ) : null}
                  <td>
                    <div className="admin-row-actions">
                      {canOrder ? (
                        <>
                          <form
                            className="admin-inline-form"
                            action={moveCmsRecordUp.bind(null, table, record.id)}
                          >
                            <button
                              className="admin-inline-button"
                              type="submit"
                              disabled={index === 0}
                              title="Move up"
                              aria-label={`Move ${recordLabel(record)} up`}
                            >
                              ↑
                            </button>
                          </form>
                          <form
                            className="admin-inline-form"
                            action={moveCmsRecordDown.bind(null, table, record.id)}
                          >
                            <button
                              className="admin-inline-button"
                              type="submit"
                              disabled={index === records.length - 1}
                              title="Move down"
                              aria-label={`Move ${recordLabel(record)} down`}
                            >
                              ↓
                            </button>
                          </form>
                        </>
                      ) : null}
                      {hasVisibility ? (
                        <form
                          className="admin-inline-form"
                          action={toggleCmsVisibilityAction.bind(null, table, record.id)}
                        >
                          <button className="admin-inline-button" type="submit">
                            {record.is_visible ? "Hide" : "Show"}
                          </button>
                        </form>
                      ) : null}
                      <Link className="admin-text-link" href={editHref}>
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showCreate ? (
        <p className="admin-collection-add">
          <Link className="admin-text-link" href={newHref}>
            + Add {pageKey ? "section" : "record"}
          </Link>
        </p>
      ) : null}
    </>
  );
}

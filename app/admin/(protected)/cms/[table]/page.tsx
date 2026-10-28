import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminPageHeader } from "../../_components/admin-ui";
import { isCmsTable } from "../config";
import {
  moveCmsRecordDown,
  moveCmsRecordUp,
  toggleCmsVisibilityAction,
} from "../actions";
import { SINGLETON_TABLES, CMS_SCHEMAS, CMS_TABLE_DESCRIPTIONS, CMS_TABLE_LABELS } from "../schema";

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

export default async function CmsCollectionPage({ params }: { params: { table: string } }) {
  if (!isCmsTable(params.table)) notFound();
  const { supabase } = await requireAdmin();
  const canOrder = (CMS_SCHEMAS[params.table] ?? []).some(
    (field) => field.name === "order_index"
  );
  const isSingleton = (SINGLETON_TABLES as readonly string[]).includes(params.table);
  const query = supabase.from(params.table).select("*");
  const { data, error } = canOrder
    ? await query
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: true })
    : isSingleton
      ? await query.order("id", { ascending: true })
      : await query;

  const records = data ?? [];
  const hasVisibility = records.some((record: any) => record.is_visible !== undefined);
  const showCreate = !isSingleton || records.length === 0;
  const label = CMS_TABLE_LABELS[params.table] ?? params.table.replaceAll("_", " ");

  return (
    <>
      <AdminPageHeader
        kicker="CMS collections"
        title={label}
        description={CMS_TABLE_DESCRIPTIONS[params.table] ?? "Protected CMS collection."}
        actions={
          showCreate ? (
            <Link className="admin-button" href={`/admin/cms/${params.table}/new`}>
              {isSingleton ? "Create settings" : "New record"}
            </Link>
          ) : undefined
        }
      />

      {error ? <p className="admin-alert admin-alert-error">{error.message}</p> : null}

      {!error && records.length === 0 ? (
        <div className="admin-empty">
          <p>No records yet.</p>
          {showCreate ? (
            <Link className="admin-text-link" href={`/admin/cms/${params.table}/new`}>
              Create the first record
            </Link>
          ) : null}
        </div>
      ) : null}

      {!error && records.length > 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Record</th>
                <th>Order</th>
                <th>Visible</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record: any, index: number) => {
                const subtitle = recordSubtitle(record);
                return (
                  <tr key={record.id}>
                    <td>
                      <Link className="admin-record-link" href={`/admin/cms/${params.table}/${record.id}`}>
                        <strong>{recordLabel(record)}</strong>
                        <span>{record.page_key ? `Page: ${record.page_key}` : record.id}</span>
                        {subtitle ? <span className="admin-table-preview">{subtitle}</span> : null}
                      </Link>
                    </td>
                    <td>{record.order_index ?? "—"}</td>
                    <td>
                      {record.is_visible === undefined ? (
                        "—"
                      ) : (
                        <span className={`admin-badge ${record.is_visible ? "admin-badge-published" : "admin-badge-archived"}`}>
                          {record.is_visible ? "Visible" : "Hidden"}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="admin-row-actions">
                        {canOrder ? (
                          <>
                            <form
                              className="admin-inline-form"
                              action={moveCmsRecordUp.bind(null, params.table, record.id)}
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
                              action={moveCmsRecordDown.bind(null, params.table, record.id)}
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
                            action={toggleCmsVisibilityAction.bind(null, params.table, record.id)}
                          >
                            <button className="admin-inline-button" type="submit">
                              {record.is_visible ? "Hide" : "Show"}
                            </button>
                          </form>
                        ) : null}
                        <Link className="admin-text-link" href={`/admin/cms/${params.table}/${record.id}`}>
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
      ) : null}
    </>
  );
}

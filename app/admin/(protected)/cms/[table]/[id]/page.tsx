import { notFound } from "next/navigation";
import { requirePagePermission } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminRecordForm } from "../../../_components/admin-record-form";
import { deleteCmsRecord, saveCmsRecord } from "../../actions";
import { cmsHref, safeAdminReturn } from "../../collection-table";
import { cmsTablePermission, isCmsTable } from "../../config";
import { SINGLETON_TABLES, fieldsFor } from "../../schema";

export default async function CmsRecordPage({
  params,
  searchParams,
}: {
  params: { table: string; id: string };
  searchParams?: { saved?: string; return?: string; page_key?: string };
}) {
  if (!isCmsTable(params.table)) notFound();
  const isNew = params.id === "new";
  const isSingleton = (SINGLETON_TABLES as readonly string[]).includes(params.table);
  await requirePagePermission(cmsTablePermission(params.table));
  const supabase = createSupabaseServerClient();
  const { data } = isNew
    ? { data: null }
    : await supabase.from(params.table).select("*").eq("id", params.id).maybeSingle();
  if (!isNew && !data) notFound();

  const returnTo = safeAdminReturn(searchParams?.return);
  const pageKey =
    isNew && searchParams?.page_key && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(searchParams.page_key)
      ? searchParams.page_key
      : undefined;
  let fields = fieldsFor(
    params.table,
    data ?? (pageKey ? { page_key: pageKey } : undefined)
  );

  if (params.table === "pricing_plan_features") {
    const { data: plans } = await supabase
      .from("pricing_plans")
      .select("id, name")
      .order("order_index", { ascending: true });

    const options = (plans ?? []).map((plan: any) => ({
      value: plan.id as string,
      label: plan.name as string,
    }));

    fields = fields.map((field) =>
      field.name === "plan_id"
        ? {
            ...field,
            type: "select" as const,
            options,
            hint: "Choose the pricing plan this feature belongs to.",
          }
        : field
    );
  }

  return (
    <>
      {!isNew ? (
        <p className="admin-field-hint">
          Record ID: <code>{params.id}</code>
        </p>
      ) : null}
      <AdminRecordForm
        action={saveCmsRecord}
        deleteAction={
          isNew || isSingleton ? undefined : (id) => deleteCmsRecord(params.table, id)
        }
        fields={fields}
        hiddenFields={{ table: params.table }}
        mode={isNew ? "create" : "edit"}
        recordId={isNew ? undefined : params.id}
        itemLabel={isSingleton ? "settings record" : "CMS record"}
        listHref={returnTo ?? `/admin/cms/${params.table}`}
        editHrefTemplate={cmsHref(`/admin/cms/${params.table}/[id]`, { return: returnTo })}
        saved={searchParams?.saved === "1"}
      />
    </>
  );
}

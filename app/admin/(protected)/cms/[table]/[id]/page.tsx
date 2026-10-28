import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminRecordForm } from "../../../_components/admin-record-form";
import { deleteCmsRecord, saveCmsRecord } from "../../actions";
import { isCmsTable } from "../../config";
import { SINGLETON_TABLES, fieldsFor } from "../../schema";

export default async function CmsRecordPage({
  params,
  searchParams,
}: {
  params: { table: string; id: string };
  searchParams?: { saved?: string };
}) {
  if (!isCmsTable(params.table)) notFound();
  const isNew = params.id === "new";
  const isSingleton = (SINGLETON_TABLES as readonly string[]).includes(params.table);
  const { supabase } = await requireAdmin();
  const { data } = isNew
    ? { data: null }
    : await supabase.from(params.table).select("*").eq("id", params.id).maybeSingle();
  if (!isNew && !data) notFound();

  let fields = fieldsFor(params.table, data ?? undefined);

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
        listHref={`/admin/cms/${params.table}`}
        editHrefTemplate={`/admin/cms/${params.table}/[id]`}
        saved={searchParams?.saved === "1"}
      />
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePagePermission } from "@/lib/auth";
import { AdminPageHeader } from "../../_components/admin-ui";
import { cmsHref, CmsCollectionTable } from "../collection-table";
import { cmsTablePermission, isCmsTable } from "../config";
import { CMS_TABLE_DESCRIPTIONS, CMS_TABLE_LABELS, SINGLETON_TABLES } from "../schema";

const PAGE_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default async function CmsCollectionPage({
  params,
  searchParams,
}: {
  params: { table: string };
  searchParams?: { page?: string };
}) {
  if (!isCmsTable(params.table)) notFound();
  await requirePagePermission(cmsTablePermission(params.table));

  const pageKey =
    params.table === "page_sections" && searchParams?.page && PAGE_KEY_PATTERN.test(searchParams.page)
      ? searchParams.page
      : undefined;
  const isSingleton = (SINGLETON_TABLES as readonly string[]).includes(params.table);
  const label = CMS_TABLE_LABELS[params.table] ?? params.table.replaceAll("_", " ");

  return (
    <>
      <AdminPageHeader
        kicker="Content / Collections"
        title={pageKey ? `${label}: ${pageKey}` : label}
        description={CMS_TABLE_DESCRIPTIONS[params.table] ?? "Protected CMS collection."}
        actions={
          isSingleton ? undefined : (
            <Link
              className="admin-button"
              href={cmsHref(`/admin/cms/${params.table}/new`, { page_key: pageKey })}
            >
              New record
            </Link>
          )
        }
      />

      <CmsCollectionTable table={params.table} pageKey={pageKey} />
    </>
  );
}

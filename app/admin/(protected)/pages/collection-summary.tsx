import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PageCollectionLink } from "./config";

async function countRows(table: PageCollectionLink["table"]) {
  const supabase = createSupabaseServerClient();
  const [all, published] = await Promise.all([
    supabase.from(table).select("id", { count: "exact", head: true }),
    supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
  ]);

  return {
    total: all.error ? null : all.count ?? 0,
    published: published.error ? null : published.count ?? 0,
  };
}

/** Links a page editor to the collection editor that feeds it. */
export async function CollectionSummary({
  collection,
}: {
  collection: PageCollectionLink;
}) {
  const { total, published } = await countRows(collection.table);

  return (
    <Link className="admin-record-link" href={collection.href}>
      <strong>{collection.label}</strong>
      <span>{collection.description}</span>
      <span className="admin-table-preview">
        {total === null
          ? "Count unavailable"
          : total === 0
            ? "No records yet: the public page shows its built-in content."
            : `${published} published of ${total}`}
      </span>
    </Link>
  );
}

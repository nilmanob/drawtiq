import type { Metadata } from "next";
import { getService } from "@/lib/admin/data";
import { AdminBackLink, AdminErrorState, AdminPageHeader } from "../../_components/admin-ui";
import { ServiceForm } from "../service-form";

export const metadata: Metadata = {
  title: "Edit service",
};

type PageProps = {
  params: { id: string };
  searchParams?: { saved?: string };
};

export default async function EditServicePage({ params, searchParams }: PageProps) {
  const result = await getService(params.id);

  if (!result.ok) {
    return (
      <>
        <AdminBackLink href="/admin/services">Services</AdminBackLink>
        <AdminErrorState title="Service could not load" message={result.error} />
      </>
    );
  }

  return (
    <>
      <AdminBackLink href="/admin/services">Services</AdminBackLink>
      <AdminPageHeader
        kicker="Content / Services"
        title={result.data.title}
        description={`Editing /${result.data.slug}`}
      />
      <div className="admin-form-card">
        <ServiceForm
          initial={result.data}
          saved={searchParams?.saved === "1"}
        />
      </div>
    </>
  );
}

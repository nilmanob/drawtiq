import type { Metadata } from "next";
import { getProject } from "@/lib/admin/data";
import { AdminBackLink, AdminErrorState, AdminPageHeader } from "../../_components/admin-ui";
import { ProjectForm } from "../project-form";

export const metadata: Metadata = {
  title: "Edit project",
};

type PageProps = {
  params: { id: string };
  searchParams?: { saved?: string };
};

export default async function EditProjectPage({ params, searchParams }: PageProps) {
  const result = await getProject(params.id);

  if (!result.ok) {
    return (
      <>
        <AdminBackLink href="/admin/projects">Projects</AdminBackLink>
        <AdminErrorState title="Project could not load" message={result.error} />
      </>
    );
  }

  return (
    <>
      <AdminBackLink href="/admin/projects">Projects</AdminBackLink>
      <AdminPageHeader
        kicker="Content / Projects"
        title={result.data.title}
        description={`Editing /${result.data.slug}`}
      />
      <div className="admin-form-card">
        <ProjectForm
          initial={result.data}
          saved={searchParams?.saved === "1"}
        />
      </div>
    </>
  );
}

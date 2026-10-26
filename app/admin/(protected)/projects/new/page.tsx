import type { Metadata } from "next";
import { AdminBackLink, AdminPageHeader } from "../../_components/admin-ui";
import { ProjectForm } from "../project-form";

export const metadata: Metadata = {
  title: "New project",
};

export default function NewProjectPage() {
  return (
    <>
      <AdminBackLink href="/admin/projects">Projects</AdminBackLink>
      <AdminPageHeader
        kicker="Content / Projects"
        title="New project"
        description="Create a portfolio project. Drafts are not visible to the public."
      />
      <div className="admin-form-card">
        <ProjectForm />
      </div>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { listProjects } from "@/lib/admin/data";
import { formatAdminDate } from "@/lib/admin/format";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminPageHeader,
  AdminStatusBadge,
} from "../_components/admin-ui";

export const metadata: Metadata = {
  title: "Projects",
};

export default async function AdminProjectsPage() {
  const result = await listProjects();

  return (
    <>
      <AdminPageHeader
        kicker="Content / Portfolio"
        title="Projects"
        description="Case studies and portfolio pieces available to the public site."
        actions={
          <Link className="admin-button" href="/admin/projects/new">
            New project
          </Link>
        }
      />

      {!result.ok ? (
        <AdminErrorState title="Projects could not load" message={result.error} />
      ) : result.data.length === 0 ? (
        <AdminEmptyState
          title="No projects yet"
          description="Create the first portfolio project to start building the work archive."
          action={
            <Link className="admin-button" href="/admin/projects/new">
              Create a project
            </Link>
          }
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Order</th>
                <th>Updated</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {result.data.map((project) => (
                <tr key={project.id}>
                  <td>
                    <Link
                      className="admin-record-link"
                      href={`/admin/projects/${project.id}`}
                    >
                      <strong>{project.title}</strong>
                      <span>/{project.slug}</span>
                    </Link>
                  </td>
                  <td>
                    <AdminStatusBadge status={project.status} />
                  </td>
                  <td>{project.featured ? "Yes" : "—"}</td>
                  <td>{project.sort_order}</td>
                  <td>{formatAdminDate(project.updated_at)}</td>
                  <td>
                    <Link
                      className="admin-text-link"
                      href={`/admin/projects/${project.id}`}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

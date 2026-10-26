import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardData } from "@/lib/admin/data";
import { formatAdminDate, truncate } from "@/lib/admin/format";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminPageHeader,
  AdminStatusBadge,
} from "./_components/admin-ui";

export const metadata: Metadata = {
  title: "Overview",
};

export default async function AdminHomePage() {
  const result = await getDashboardData();

  return (
    <>
      <AdminPageHeader
        kicker="Overview / Studio"
        title="Dashboard"
        description="Manage Drawtiq content and keep an eye on incoming project inquiries."
        actions={
          <Link className="admin-button" href="/admin/projects/new">
            New project
          </Link>
        }
      />

      {!result.ok ? (
        <AdminErrorState
          title="The dashboard could not load"
          message={`${result.error} Apply the Supabase migration if the tables are missing.`}
        />
      ) : (
        <>
          <div className="admin-stat-grid">
            <Link className="admin-stat" href="/admin/projects">
              <span className="admin-stat-label">Projects</span>
              <strong>{result.data.counts.projects}</strong>
              <span className="admin-stat-meta">
                {result.data.counts.projectsPublished} published
              </span>
            </Link>
            <Link className="admin-stat" href="/admin/services">
              <span className="admin-stat-label">Services</span>
              <strong>{result.data.counts.services}</strong>
              <span className="admin-stat-meta">
                {result.data.counts.servicesPublished} published
              </span>
            </Link>
            <Link className="admin-stat" href="/admin/posts">
              <span className="admin-stat-label">Blog posts</span>
              <strong>{result.data.counts.posts}</strong>
              <span className="admin-stat-meta">
                {result.data.counts.postsPublished} published
              </span>
            </Link>
            <Link className="admin-stat admin-stat-accent" href="/admin/inquiries">
              <span className="admin-stat-label">New inquiries</span>
              <strong>{result.data.counts.inquiriesNew}</strong>
              <span className="admin-stat-meta">
                {result.data.counts.inquiries} total
              </span>
            </Link>
          </div>

          <section className="admin-panel">
            <div className="admin-panel-header">
              <div>
                <p className="admin-kicker">Inbox / Latest</p>
                <h2>Recent inquiries</h2>
              </div>
              <Link className="admin-text-link" href="/admin/inquiries">
                View all
              </Link>
            </div>

            {result.data.recentInquiries.length === 0 ? (
              <AdminEmptyState
                title="No inquiries yet"
                description="New project inquiries will appear here."
              />
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Contact</th>
                      <th>Service</th>
                      <th>Status</th>
                      <th>Received</th>
                      <th aria-label="Open" />
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.recentInquiries.map((inquiry) => (
                      <tr key={inquiry.id}>
                        <td>
                          <Link
                            className="admin-record-link"
                            href={`/admin/inquiries/${inquiry.id}`}
                          >
                            <strong>{inquiry.name}</strong>
                            <span>{inquiry.email}</span>
                          </Link>
                          <span className="admin-table-preview">
                            {truncate(inquiry.message, 80)}
                          </span>
                        </td>
                        <td>{inquiry.service || "—"}</td>
                        <td>
                          <AdminStatusBadge status={inquiry.status} />
                        </td>
                        <td>{formatAdminDate(inquiry.created_at)}</td>
                        <td>
                          <Link
                            className="admin-text-link"
                            href={`/admin/inquiries/${inquiry.id}`}
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}

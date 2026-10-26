import type { Metadata } from "next";
import Link from "next/link";
import { listInquiries } from "@/lib/admin/data";
import { formatAdminDateTime, truncate } from "@/lib/admin/format";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminPageHeader,
  AdminStatusBadge,
} from "../_components/admin-ui";

export const metadata: Metadata = {
  title: "Inquiries",
};

const filters = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "read", label: "Read" },
  { value: "replied", label: "Replied" },
  { value: "archived", label: "Archived" },
];

type PageProps = {
  searchParams?: { status?: string };
};

export default async function AdminInquiriesPage({ searchParams }: PageProps) {
  const status = searchParams?.status ?? "";
  const result = await listInquiries(status || undefined);

  return (
    <>
      <AdminPageHeader
        kicker="Inbox / Project requests"
        title="Inquiries"
        description="Read incoming project inquiries and keep their status up to date."
      />

      <div className="admin-filter-row" role="group" aria-label="Filter inquiries">
        {filters.map((filter) => {
          const href = filter.value
            ? `/admin/inquiries?status=${filter.value}`
            : "/admin/inquiries";
          const active = status === filter.value;

          return (
            <Link
              key={filter.label}
              aria-current={active ? "page" : undefined}
              className={`admin-filter-link${active ? " is-active" : ""}`}
              href={href}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      {!result.ok ? (
        <AdminErrorState title="Inquiries could not load" message={result.error} />
      ) : result.data.length === 0 ? (
        <AdminEmptyState
          title={status ? "No inquiries with this status" : "No inquiries yet"}
          description={
            status
              ? "Try another filter or view all inquiries."
              : "New project inquiries submitted through the public site will appear here."
          }
          action={
            status ? (
              <Link className="admin-button admin-button-secondary" href="/admin/inquiries">
                View all inquiries
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Service / budget</th>
                <th>Status</th>
                <th>Received</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {result.data.map((inquiry) => (
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
                      {truncate(inquiry.message, 100)}
                    </span>
                  </td>
                  <td>
                    <span>{inquiry.service || "General inquiry"}</span>
                    {inquiry.budget ? (
                      <span className="admin-table-subtle">{inquiry.budget}</span>
                    ) : null}
                  </td>
                  <td>
                    <AdminStatusBadge status={inquiry.status} />
                  </td>
                  <td>{formatAdminDateTime(inquiry.created_at)}</td>
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
    </>
  );
}

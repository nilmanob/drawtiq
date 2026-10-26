import type { Metadata } from "next";
import Link from "next/link";
import { listServices } from "@/lib/admin/data";
import { formatAdminDate } from "@/lib/admin/format";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminPageHeader,
  AdminStatusBadge,
} from "../_components/admin-ui";

export const metadata: Metadata = {
  title: "Services",
};

export default async function AdminServicesPage() {
  const result = await listServices();

  return (
    <>
      <AdminPageHeader
        kicker="Content / Offer"
        title="Services"
        description="Service pages and offerings shown across the public site."
        actions={
          <Link className="admin-button" href="/admin/services/new">
            New service
          </Link>
        }
      />

      {!result.ok ? (
        <AdminErrorState title="Services could not load" message={result.error} />
      ) : result.data.length === 0 ? (
        <AdminEmptyState
          title="No services yet"
          description="Create the first service to describe what the studio offers."
          action={
            <Link className="admin-button" href="/admin/services/new">
              Create a service
            </Link>
          }
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Status</th>
                <th>Order</th>
                <th>Updated</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {result.data.map((service) => (
                <tr key={service.id}>
                  <td>
                    <Link
                      className="admin-record-link"
                      href={`/admin/services/${service.id}`}
                    >
                      <strong>{service.title}</strong>
                      <span>/{service.slug}</span>
                    </Link>
                  </td>
                  <td>
                    <AdminStatusBadge status={service.status} />
                  </td>
                  <td>{service.sort_order}</td>
                  <td>{formatAdminDate(service.updated_at)}</td>
                  <td>
                    <Link
                      className="admin-text-link"
                      href={`/admin/services/${service.id}`}
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

import type { Metadata } from "next";
import Link from "next/link";
import { getInquiry } from "@/lib/admin/data";
import { formatAdminDateTime } from "@/lib/admin/format";
import { getAdminSession } from "@/lib/auth";
import { hasPermission } from "@/lib/auth/roles";
import {
  AdminBackLink,
  AdminErrorState,
  AdminPageHeader,
  AdminStatusBadge,
} from "../../_components/admin-ui";
import { InquiryStatusForm } from "../status-form";

export const metadata: Metadata = {
  title: "Inquiry",
};

type PageProps = {
  params: { id: string };
};

export default async function AdminInquiryPage({ params }: PageProps) {
  const [result, session] = await Promise.all([
    getInquiry(params.id),
    getAdminSession(),
  ]);

  if (!result.ok) {
    return (
      <>
        <AdminBackLink href="/admin/inquiries">Inquiries</AdminBackLink>
        <AdminErrorState title="Inquiry could not load" message={result.error} />
      </>
    );
  }

  const inquiry = result.data;

  return (
    <>
      <AdminBackLink href="/admin/inquiries">Inquiries</AdminBackLink>
      <AdminPageHeader
        kicker="Inbox / Inquiry"
        title={inquiry.name}
        description={`Received ${formatAdminDateTime(inquiry.created_at)}`}
        actions={<AdminStatusBadge status={inquiry.status} />}
      />

      <div className="admin-inquiry-layout">
        <section className="admin-panel admin-inquiry-message">
          <div className="admin-panel-header">
            <div>
              <p className="admin-kicker">Message</p>
              <h2>Project details</h2>
            </div>
          </div>
          <p className="admin-inquiry-body">{inquiry.message}</p>
        </section>

        <aside className="admin-panel admin-inquiry-side">
          <div className="admin-panel-header">
            <div>
              <p className="admin-kicker">Contact</p>
              <h2>Details</h2>
            </div>
          </div>

          <dl className="admin-meta-list">
            <div>
              <dt>Name</dt>
              <dd>{inquiry.name}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a className="admin-text-link" href={`mailto:${inquiry.email}`}>
                  {inquiry.email}
                </a>
              </dd>
            </div>
            <div>
              <dt>Service</dt>
              <dd>{inquiry.service || "General inquiry"}</dd>
            </div>
            <div>
              <dt>Budget</dt>
              <dd>{inquiry.budget || "Not provided"}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>{inquiry.source}</dd>
            </div>
            <div>
              <dt>Received</dt>
              <dd>{formatAdminDateTime(inquiry.created_at)}</dd>
            </div>
          </dl>

          <div className="admin-divider" />

          {session.admin &&
          hasPermission(session.admin.role, "inquiries:write") ? (
            <InquiryStatusForm id={inquiry.id} status={inquiry.status} />
          ) : (
            <p className="admin-field-hint">
              Your role has read-only access to inquiries.
            </p>
          )}

          <p className="admin-field-hint">
            Updating the status does not send an email to the contact.
          </p>
        </aside>
      </div>

      <p className="admin-detail-footer">
        <Link className="admin-text-link" href="/admin/inquiries">
          Return to all inquiries
        </Link>
      </p>
    </>
  );
}

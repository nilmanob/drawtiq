import type { Metadata } from "next";
import { AdminBackLink, AdminPageHeader } from "../../_components/admin-ui";
import { ServiceForm } from "../service-form";

export const metadata: Metadata = {
  title: "New service",
};

export default function NewServicePage() {
  return (
    <>
      <AdminBackLink href="/admin/services">Services</AdminBackLink>
      <AdminPageHeader
        kicker="Content / Services"
        title="New service"
        description="Create a service offering. Drafts are not visible to the public."
      />
      <div className="admin-form-card">
        <ServiceForm />
      </div>
    </>
  );
}

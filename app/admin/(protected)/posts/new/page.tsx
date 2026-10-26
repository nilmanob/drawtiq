import type { Metadata } from "next";
import { AdminBackLink, AdminPageHeader } from "../../_components/admin-ui";
import { PostForm } from "../post-form";

export const metadata: Metadata = {
  title: "New blog post",
};

export default function NewPostPage() {
  return (
    <>
      <AdminBackLink href="/admin/posts">Blog posts</AdminBackLink>
      <AdminPageHeader
        kicker="Content / Insights"
        title="New blog post"
        description="Create a field note or article. Drafts are not visible to the public."
      />
      <div className="admin-form-card">
        <PostForm />
      </div>
    </>
  );
}

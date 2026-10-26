import type { Metadata } from "next";
import { getPost } from "@/lib/admin/data";
import {
  AdminBackLink,
  AdminErrorState,
  AdminPageHeader,
} from "../../_components/admin-ui";
import { PostForm } from "../post-form";

export const metadata: Metadata = {
  title: "Edit blog post",
};

type PageProps = {
  params: { id: string };
  searchParams?: { saved?: string };
};

export default async function EditPostPage({ params, searchParams }: PageProps) {
  const result = await getPost(params.id);

  if (!result.ok) {
    return (
      <>
        <AdminBackLink href="/admin/posts">Blog posts</AdminBackLink>
        <AdminErrorState title="Blog post could not load" message={result.error} />
      </>
    );
  }

  return (
    <>
      <AdminBackLink href="/admin/posts">Blog posts</AdminBackLink>
      <AdminPageHeader
        kicker="Content / Insights"
        title={result.data.title}
        description={`Editing /${result.data.slug}`}
      />
      <div className="admin-form-card">
        <PostForm
          initial={result.data}
          saved={searchParams?.saved === "1"}
        />
      </div>
    </>
  );
}

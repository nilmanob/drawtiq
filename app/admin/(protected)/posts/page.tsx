import type { Metadata } from "next";
import Link from "next/link";
import { listPosts } from "@/lib/admin/data";
import { formatAdminDate, truncate } from "@/lib/admin/format";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminPageHeader,
  AdminStatusBadge,
} from "../_components/admin-ui";

export const metadata: Metadata = {
  title: "Blog posts",
};

export default async function AdminPostsPage() {
  const result = await listPosts();

  return (
    <>
      <AdminPageHeader
        kicker="Content / Insights"
        title="Blog posts"
        description="Field notes and articles for the insights section."
        actions={
          <Link className="admin-button" href="/admin/posts/new">
            New post
          </Link>
        }
      />

      {!result.ok ? (
        <AdminErrorState title="Blog posts could not load" message={result.error} />
      ) : result.data.length === 0 ? (
        <AdminEmptyState
          title="No blog posts yet"
          description="Write the first field note or article for the insights archive."
          action={
            <Link className="admin-button" href="/admin/posts/new">
              Create a post
            </Link>
          }
        />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Post</th>
                <th>Category</th>
                <th>Status</th>
                <th>Order</th>
                <th>Updated</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {result.data.map((post) => (
                <tr key={post.id}>
                  <td>
                    <Link
                      className="admin-record-link"
                      href={`/admin/posts/${post.id}`}
                    >
                      <strong>{post.title}</strong>
                      <span>/{post.slug}</span>
                    </Link>
                    {post.excerpt ? (
                      <span className="admin-table-preview">
                        {truncate(post.excerpt, 90)}
                      </span>
                    ) : null}
                  </td>
                  <td>{post.category || "—"}</td>
                  <td>
                    <AdminStatusBadge status={post.status} />
                  </td>
                  <td>{post.sort_order}</td>
                  <td>{formatAdminDate(post.updated_at)}</td>
                  <td>
                    <Link
                      className="admin-text-link"
                      href={`/admin/posts/${post.id}`}
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

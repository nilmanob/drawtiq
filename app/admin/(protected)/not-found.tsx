import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="admin-panel admin-error-panel">
      <p className="admin-kicker">Admin / Not found</p>
      <h1>That record does not exist.</h1>
      <p>It may have been deleted, or the link may be incorrect.</p>
      <Link className="admin-button" href="/admin">
        Return to overview
      </Link>
    </div>
  );
}

export default function AdminLoading() {
  return (
    <div className="admin-loading" aria-busy="true" aria-live="polite">
      <div className="admin-skeleton admin-skeleton-kicker" />
      <div className="admin-skeleton admin-skeleton-title" />
      <div className="admin-skeleton admin-skeleton-copy" />
      <div className="admin-skeleton-grid">
        <div className="admin-skeleton admin-skeleton-card" />
        <div className="admin-skeleton admin-skeleton-card" />
        <div className="admin-skeleton admin-skeleton-card" />
      </div>
      <span className="sr-only">Loading admin content</span>
    </div>
  );
}

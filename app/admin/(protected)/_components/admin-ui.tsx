import type { ReactNode } from "react";
import Link from "next/link";

export function AdminPageHeader({
  kicker,
  title,
  description,
  actions,
}: {
  kicker: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="admin-page-header">
      <div>
        <p className="admin-kicker">{kicker}</p>
        <h1 className="admin-page-title">{title}</h1>
        {description ? <p className="admin-page-description">{description}</p> : null}
      </div>
      {actions ? <div className="admin-page-actions">{actions}</div> : null}
    </div>
  );
}

export function AdminStatusBadge({ status }: { status: string }) {
  return (
    <span className={`admin-badge admin-badge-${status}`}>{status}</span>
  );
}

export function AdminEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="admin-empty">
      <span className="admin-empty-mark" aria-hidden="true">
        +
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action ? <div className="admin-empty-action">{action}</div> : null}
    </div>
  );
}

export function AdminErrorState({
  title = "Something went wrong",
  message,
}: {
  title?: string;
  message: string;
}) {
  return (
    <div className="admin-alert admin-alert-error" role="alert">
      <strong>{title}</strong>
      <p>{message}</p>
    </div>
  );
}

export function AdminSavedBanner({ children }: { children: ReactNode }) {
  return (
    <div className="admin-alert admin-alert-success" role="status">
      {children}
    </div>
  );
}

export function AdminBackLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link className="admin-back-link" href={href}>
      ← {children}
    </Link>
  );
}

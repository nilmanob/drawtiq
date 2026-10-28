import Link from "next/link";
import type { ReactNode } from "react";
import { formatDelta } from "@/lib/analytics/format";
import type { AnalyticsMetricComparison } from "@/lib/analytics/types";

export function AnalyticsMetricCard({
  label,
  metric,
  format,
  meta,
  goodWhenDown = false,
}: {
  label: string;
  metric: AnalyticsMetricComparison;
  format: (value: number) => string;
  meta?: ReactNode;
  goodWhenDown?: boolean;
}) {
  const change = metric.changePercent;
  const direction =
    change === null || change === 0
      ? "flat"
      : change > 0
        ? goodWhenDown
          ? "down"
          : "up"
        : goodWhenDown
          ? "up"
          : "down";

  return (
    <article className="admin-analytics-metric">
      <span className="admin-stat-label">{label}</span>
      <strong>{format(metric.current)}</strong>
      <span className={`admin-analytics-delta is-${direction}`}>
        {change === null
          ? "No prior data"
          : `${formatDelta(change)} vs previous period`}
      </span>
      {meta ? <span className="admin-analytics-meta">{meta}</span> : null}
    </article>
  );
}

export function AnalyticsPanel({
  kicker,
  title,
  action,
  children,
  className = "",
}: {
  kicker: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`admin-panel admin-analytics-panel ${className}`.trim()}>
      <div className="admin-panel-header">
        <div>
          <p className="admin-kicker">{kicker}</p>
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AnalyticsBarList({
  rows,
  emptyText,
  hrefFor,
  shareLabel = "sessions",
}: {
  rows: Array<{ label: string; value: number; share: number; href?: string }>;
  emptyText: string;
  hrefFor?: (label: string) => string | undefined;
  shareLabel?: string;
}) {
  if (!rows.length) {
    return <p className="admin-analytics-empty-copy">{emptyText}</p>;
  }

  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <ul className="admin-analytics-bars">
      {rows.map((row) => {
        const href = row.href ?? hrefFor?.(row.label);

        return (
          <li key={row.label}>
            <div className="admin-analytics-bar-head">
              {href ? (
                <Link className="admin-analytics-bar-label" href={href}>
                  {row.label}
                </Link>
              ) : (
                <span className="admin-analytics-bar-label">{row.label}</span>
              )}
              <span>{row.value.toLocaleString("en")}</span>
            </div>
            <div className="admin-analytics-bar-track" aria-hidden="true">
              <span style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }} />
            </div>
            <span className="admin-analytics-bar-share">
              {row.share.toFixed(1)}% of {shareLabel}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

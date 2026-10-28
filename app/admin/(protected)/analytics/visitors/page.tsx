import type { Metadata } from "next";
import Link from "next/link";
import { getAnalyticsVisitors } from "@/lib/analytics/data";
import {
  formatAdminAnalyticsDateTime,
  formatCount,
  formatRelativeTime,
  prettyDevice,
  prettySource,
} from "@/lib/analytics/format";
import {
  getAnalyticsWindow,
  withAnalyticsRange,
} from "@/lib/analytics/range";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminPageHeader,
} from "../../_components/admin-ui";

export const metadata: Metadata = {
  title: "Visitors",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

const RANGE_LINKS = [
  { key: "7d" as const, label: "7 days" },
  { key: "30d" as const, label: "30 days" },
  { key: "90d" as const, label: "90 days" },
];

function pageHref(
  window: ReturnType<typeof getAnalyticsWindow>,
  page: number,
  query: string
) {
  const params = new URLSearchParams(withAnalyticsRange(window).slice(1));

  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));

  return `/admin/analytics/visitors?${params.toString()}`;
}

export default async function AdminVisitorsPage({ searchParams }: PageProps) {
  const window = getAnalyticsWindow(searchParams);
  const queryRaw = Array.isArray(searchParams?.q)
    ? searchParams?.q[0]
    : searchParams?.q;
  const query = queryRaw?.trim() ?? "";
  const result = await getAnalyticsVisitors(window, {
    page: searchParams?.page,
    search: searchParams?.q,
  });
  const analyticsHref = `/admin${withAnalyticsRange(window)}`;

  return (
    <>
      <AdminPageHeader
        kicker="Analytics / Visitors"
        title="Visitors"
        description="Anonymous visitor and session records. IDs are random browser identifiers, not names or fingerprints."
        actions={
          <Link className="admin-button admin-button-secondary" href={analyticsHref}>
            Back to analytics
          </Link>
        }
      />

      <div className="admin-analytics-toolbar">
        <div className="admin-filter-row" role="group" aria-label="Visitor date range">
          {RANGE_LINKS.map((range) => {
            const href = `/admin/analytics/visitors${withAnalyticsRange(window, {
              key: range.key,
            })}`;
            const active = window.key === range.key;

            return (
              <Link
                key={range.key}
                aria-current={active ? "page" : undefined}
                className={`admin-filter-link${active ? " is-active" : ""}`}
                href={href}
              >
                {range.label}
              </Link>
            );
          })}
          {window.key === "custom" ? (
            <span className="admin-filter-link is-active">{window.label}</span>
          ) : null}
        </div>

        <form className="admin-analytics-search" method="get" action="/admin/analytics/visitors">
          <input type="hidden" name="range" value={window.key} />
          {window.key === "custom" ? (
            <>
              <input type="hidden" name="from" value={window.from} />
              <input type="hidden" name="to" value={window.to} />
            </>
          ) : null}
          <input type="hidden" name="granularity" value={window.granularity} />
          <label className="admin-sr-only" htmlFor="visitor-search">
            Search visitors
          </label>
          <input
            id="visitor-search"
            className="admin-input"
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search ID, path, source, browser…"
          />
          <button className="admin-button admin-button-secondary" type="submit">
            Search
          </button>
        </form>
      </div>

      {!result.ok ? (
        <AdminErrorState title="Visitors could not load" message={result.error} />
      ) : !result.data.items.length ? (
        <AdminEmptyState
          title={query ? "No matching visitors" : "No visitors in this period"}
          description={
            query
              ? "Try a different visitor ID, page path, source, or device."
              : "Visitor records will appear after someone accepts anonymous analytics on the public site."
          }
        />
      ) : (
        <>
          <p className="admin-analytics-result-meta">
            {formatCount(result.data.total)} visitor
            {result.data.total === 1 ? "" : "s"} in {window.label}. Page{" "}
            {result.data.page} of{" "}
            {Math.max(1, Math.ceil(result.data.total / result.data.pageSize))}.
          </p>

          <div className="admin-table-wrap">
            <table className="admin-table admin-analytics-table">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Visits</th>
                  <th>Last page</th>
                  <th>Acquisition</th>
                  <th>First seen</th>
                  <th>Last seen</th>
                </tr>
              </thead>
              <tbody>
                {result.data.items.map((visitor) => (
                  <tr key={visitor.visitorId}>
                    <td>
                      <Link
                        className="admin-record-link"
                        href={`/admin/analytics/visitors/${visitor.visitorId}`}
                      >
                        <strong>{visitor.visitorId.slice(0, 8)}…</strong>
                        <span>
                          {visitor.isNewVisitor ? "New visitor" : "Returning"}{" "}
                          · {prettyDevice(visitor.deviceType)}
                        </span>
                      </Link>
                    </td>
                    <td>
                      <span>{formatCount(visitor.sessions)} sessions</span>
                      <span className="admin-table-subtle">
                        {formatCount(visitor.pageviews)} page views
                      </span>
                    </td>
                    <td>
                      <span className="admin-path-cell">{visitor.lastPath}</span>
                      <span className="admin-table-subtle">
                        Entered at {visitor.entryPath}
                      </span>
                    </td>
                    <td>
                      <span>{prettySource(visitor.source)}</span>
                      <span className="admin-table-subtle">
                        {visitor.referrerHost ?? "No referrer"} · {visitor.browser} /{" "}
                        {visitor.os}
                      </span>
                    </td>
                    <td>{formatAdminAnalyticsDateTime(visitor.firstSeen)}</td>
                    <td>
                      <span>{formatRelativeTime(visitor.lastSeen)}</span>
                      <span className="admin-table-subtle">
                        {formatAdminAnalyticsDateTime(visitor.lastSeen)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className="admin-pagination" aria-label="Visitor pages">
            {result.data.page > 1 ? (
              <Link
                className="admin-button admin-button-secondary"
                href={pageHref(window, result.data.page - 1, query)}
              >
                Previous
              </Link>
            ) : (
              <span />
            )}
            {result.data.page * result.data.pageSize < result.data.total ? (
              <Link
                className="admin-button admin-button-secondary"
                href={pageHref(window, result.data.page + 1, query)}
              >
                Next
              </Link>
            ) : null}
          </nav>
        </>
      )}
    </>
  );
}

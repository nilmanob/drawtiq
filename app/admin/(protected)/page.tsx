import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardData } from "@/lib/admin/data";
import { getAdminSession } from "@/lib/auth";
import { hasPermission } from "@/lib/auth/roles";
import {
  ANALYTICS_MAX_ROWS,
  getAnalyticsDashboard,
} from "@/lib/analytics/data";
import {
  formatAdminAnalyticsDateTime,
  formatCount,
  formatDuration,
  formatPercent,
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
} from "./_components/admin-ui";
import { AnalyticsTrendChart } from "./_components/analytics-charts";
import {
  AnalyticsBarList,
  AnalyticsMetricCard,
  AnalyticsPanel,
} from "./_components/analytics-ui";

export const metadata: Metadata = {
  title: "Dashboard",
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

export default async function AdminHomePage({ searchParams }: PageProps) {
  const window = getAnalyticsWindow(searchParams);
  const [analytics, content, session] = await Promise.all([
    getAnalyticsDashboard(window),
    getDashboardData(),
    getAdminSession(),
  ]);
  const canManageContent = session.admin
    ? hasPermission(session.admin.role, "content:write")
    : false;

  const hasData =
    analytics.ok &&
    (analytics.data.summary.sessions.current > 0 ||
      analytics.data.summary.pageviews.current > 0);
  const allVisitorsHref = `/admin/analytics/visitors${withAnalyticsRange(window)}`;

  return (
    <>
      <AdminPageHeader
        kicker="Studio / Dashboard"
        title="Dashboard"
        description={
          canManageContent
            ? "Visitor analytics and a quick overview of the studio content. Anonymous, first-party activity only — no names, emails, or IP addresses are stored."
            : "Visitor analytics for the studio site. Anonymous, first-party activity only — no names, emails, or IP addresses are stored."
        }
        actions={
          <Link className="admin-button" href={allVisitorsHref}>
            All visitors
          </Link>
        }
      />

      <div className="admin-analytics-toolbar">
        <div className="admin-filter-row" role="group" aria-label="Analytics date range">
          {RANGE_LINKS.map((range) => {
            const href = `/admin${withAnalyticsRange(window, { key: range.key })}`;
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
            <span className="admin-filter-link is-active">
              {window.label}
            </span>
          ) : null}
        </div>

        <form className="admin-analytics-date-form" method="get" action="/admin">
          <input type="hidden" name="range" value="custom" />
          <label>
            From
            <input
              className="admin-input"
              type="date"
              name="from"
              defaultValue={window.from}
              max={window.to}
              required
            />
          </label>
          <label>
            To
            <input
              className="admin-input"
              type="date"
              name="to"
              defaultValue={window.to}
              min={window.from}
              required
            />
          </label>
          <button className="admin-button admin-button-secondary" type="submit">
            Apply
          </button>
        </form>
      </div>

      <div className="admin-filter-row admin-analytics-granularity" role="group" aria-label="Trend granularity">
        <span className="admin-analytics-toolbar-label">Trend</span>
        {(["day", "week", "month"] as const).map((granularity) => {
          const href = `/admin${withAnalyticsRange(window, { granularity })}`;
          const active = window.granularity === granularity;

          return (
            <Link
              key={granularity}
              aria-current={active ? "page" : undefined}
              className={`admin-filter-link${active ? " is-active" : ""}`}
              href={href}
            >
              {granularity}
            </Link>
          );
        })}
      </div>

      {!analytics.ok ? (
        <AdminErrorState
          title="Visitor analytics could not load"
          message={analytics.error}
        />
      ) : !hasData ? (
        <AdminEmptyState
          title="No visitor data yet"
          description="Once a visitor accepts anonymous analytics and browses the public site, real sessions, page views, and trends will appear here. Nothing is fabricated while the dashboard is empty."
          action={
            <Link className="admin-button admin-button-secondary" href="/">
              Open public site
            </Link>
          }
        />
      ) : (
        <>
          {analytics.data.limited ? (
            <div className="admin-alert" role="status">
              <strong>Large period</strong>
              <p>
                This period contains more rows than the dashboard loads at once.
                Metrics are based on the most recent{" "}
                {formatCount(ANALYTICS_MAX_ROWS)} rows.
              </p>
            </div>
          ) : null}

          <div className="admin-analytics-metrics">
            <AnalyticsMetricCard
              label="Unique visitors"
              metric={analytics.data.summary.visitors}
              format={formatCount}
              meta={`${formatCount(analytics.data.summary.newVisitors.current)} new · ${formatCount(analytics.data.summary.returningVisitors.current)} returning`}
            />
            <AnalyticsMetricCard
              label="Sessions"
              metric={analytics.data.summary.sessions}
              format={formatCount}
            />
            <AnalyticsMetricCard
              label="Page views"
              metric={analytics.data.summary.pageviews}
              format={formatCount}
            />
            <AnalyticsMetricCard
              label="Average session"
              metric={analytics.data.summary.averageSessionSeconds}
              format={formatDuration}
            />
            <AnalyticsMetricCard
              label="Bounce rate"
              metric={analytics.data.summary.bounceRate}
              format={(value) => formatPercent(value)}
              goodWhenDown
            />
            <AnalyticsMetricCard
              label="New visitors"
              metric={analytics.data.summary.newVisitors}
              format={formatCount}
              meta={`${formatCount(analytics.data.summary.returningVisitors.current)} returning`}
            />
          </div>

          <AnalyticsTrendChart
            series={analytics.data.series}
            rangeLabel={window.label}
          />

          <div className="admin-analytics-columns">
            <AnalyticsPanel
              kicker="Content / Most visited"
              title="Top pages"
              className="admin-analytics-panel-wide"
            >
              <AnalyticsBarList
                rows={analytics.data.topPages.map((page) => ({
                  label: page.path,
                  value: page.views,
                  share: analytics.data.totalPageviewsInWindow
                    ? (page.views / analytics.data.totalPageviewsInWindow) * 100
                    : 0,
                }))}
                emptyText="No page views in this period."
                shareLabel="views"
              />
              {analytics.data.topPages.length ? (
                <p className="admin-analytics-note">
                  Average time on page:{" "}
                  {formatDuration(analytics.data.topPages[0].averageSeconds)} on
                  the busiest page.
                </p>
              ) : null}
            </AnalyticsPanel>

            <AnalyticsPanel kicker="Acquisition / Source" title="Traffic sources">
              <AnalyticsBarList
                rows={analytics.data.sources.map((source) => ({
                  label: prettySource(source.source),
                  value: source.sessions,
                  share: source.share,
                }))}
                emptyText="No sessions in this period."
              />
            </AnalyticsPanel>
          </div>

          <div className="admin-analytics-columns">
            <AnalyticsPanel
              kicker="Audience / Recent"
              title="Recent visitors"
              action={
                <Link className="admin-text-link" href={allVisitorsHref}>
                  View all
                </Link>
              }
              className="admin-analytics-panel-wide"
            >
              {analytics.data.recentVisitors.length ? (
                <div className="admin-table-wrap">
                  <table className="admin-table admin-analytics-table">
                    <thead>
                      <tr>
                        <th>Visitor</th>
                        <th>Activity</th>
                        <th>Source</th>
                        <th>Last seen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.data.recentVisitors.map((visitor) => (
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
                            <span>{formatCount(visitor.pageviews)} page views</span>
                            <span className="admin-table-subtle">
                              {formatCount(visitor.sessions)} session
                              {visitor.sessions === 1 ? "" : "s"} · {visitor.lastPath}
                            </span>
                          </td>
                          <td>{prettySource(visitor.source)}</td>
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
              ) : (
                <p className="admin-analytics-empty-copy">No recent visitors.</p>
              )}
            </AnalyticsPanel>

            <AnalyticsPanel kicker="Technology / Audience" title="Devices & browsers">
              <div className="admin-analytics-stack">
                <div>
                  <p className="admin-analytics-subhead">Devices</p>
                  <AnalyticsBarList
                    rows={analytics.data.devices.map((row) => ({
                      label: prettyDevice(row.label),
                      value: row.sessions,
                      share: row.share,
                    }))}
                    emptyText="No device data."
                  />
                </div>
                <div>
                  <p className="admin-analytics-subhead">Browsers</p>
                  <AnalyticsBarList
                    rows={analytics.data.browsers.map((row) => ({
                      label: row.label,
                      value: row.sessions,
                      share: row.share,
                    }))}
                    emptyText="No browser data."
                  />
                </div>
                <div>
                  <p className="admin-analytics-subhead">Operating systems</p>
                  <AnalyticsBarList
                    rows={analytics.data.operatingSystems.map((row) => ({
                      label: row.label,
                      value: row.sessions,
                      share: row.share,
                    }))}
                    emptyText="No operating system data."
                  />
                </div>
              </div>
            </AnalyticsPanel>
          </div>

          <AnalyticsPanel kicker="Acquisition / Referrers" title="Top referrers">
            <AnalyticsBarList
              rows={analytics.data.referrers.map((referrer) => ({
                label: referrer.referrerHost ?? "Direct",
                value: referrer.sessions,
                share: analytics.data.summary.sessions.current
                  ? (referrer.sessions / analytics.data.summary.sessions.current) * 100
                  : 0,
              }))}
              emptyText="No external referrers recorded. Direct and internal visits are counted in traffic sources."
            />
          </AnalyticsPanel>
        </>
      )}

      {canManageContent ? (
        <section className="admin-panel admin-analytics-content-panel">
          <div className="admin-panel-header">
            <div>
              <p className="admin-kicker">Studio / Content</p>
              <h2>Content overview</h2>
            </div>
            <Link className="admin-text-link" href="/admin/cms">
              Site CMS
            </Link>
          </div>

          {!content.ok ? (
            <AdminErrorState
              title="Content overview unavailable"
              message={content.error}
            />
          ) : (
            <div className="admin-content-overview">
              <Link href="/admin/projects">
                <span>Projects</span>
                <strong>{content.data.counts.projects}</strong>
                <small>{content.data.counts.projectsPublished} published</small>
              </Link>
              <Link href="/admin/services">
                <span>Services</span>
                <strong>{content.data.counts.services}</strong>
                <small>{content.data.counts.servicesPublished} published</small>
              </Link>
              <Link href="/admin/posts">
                <span>Blog posts</span>
                <strong>{content.data.counts.posts}</strong>
                <small>{content.data.counts.postsPublished} published</small>
              </Link>
              <Link href="/admin/inquiries">
                <span>Inquiries</span>
                <strong>{content.data.counts.inquiriesNew}</strong>
                <small>{content.data.counts.inquiries} total</small>
              </Link>
            </div>
          )}
        </section>
      ) : null}
    </>
  );
}

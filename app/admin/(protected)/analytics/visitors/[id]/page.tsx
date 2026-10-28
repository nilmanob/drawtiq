import type { Metadata } from "next";
import Link from "next/link";
import { getAnalyticsVisitor } from "@/lib/analytics/data";
import {
  formatAdminAnalyticsDateTime,
  formatCount,
  formatDuration,
  prettyDevice,
  prettySource,
} from "@/lib/analytics/format";
import { AdminErrorState, AdminPageHeader } from "../../../_components/admin-ui";
import { AnalyticsPanel } from "../../../_components/analytics-ui";

export const metadata: Metadata = {
  title: "Visitor detail",
};

export const dynamic = "force-dynamic";

type PageProps = {
  params: { id: string };
};

export default async function AdminVisitorDetailPage({ params }: PageProps) {
  const result = await getAnalyticsVisitor(params.id);

  if (!result.ok) {
    return (
      <>
        <AdminPageHeader
          kicker="Analytics / Visitors"
          title="Visitor detail"
          actions={
            <Link className="admin-button admin-button-secondary" href="/admin/analytics/visitors">
              Back to visitors
            </Link>
          }
        />
        <AdminErrorState title="Visitor could not load" message={result.error} />
      </>
    );
  }

  const visitor = result.data;
  const location = [visitor.city, visitor.region, visitor.countryCode]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <AdminPageHeader
        kicker="Analytics / Visitor"
        title="Anonymous visitor"
        description={`Random visitor ID ${visitor.visitorId}. This is not a person's name, email, or device fingerprint.`}
        actions={
          <Link className="admin-button admin-button-secondary" href="/admin/analytics/visitors">
            Back to visitors
          </Link>
        }
      />

      <div className="admin-analytics-detail-grid">
        <div>
          <span>Sessions</span>
          <strong>{formatCount(visitor.totalSessions)}</strong>
        </div>
        <div>
          <span>Page views</span>
          <strong>{formatCount(visitor.totalPageviews)}</strong>
        </div>
        <div>
          <span>Average session</span>
          <strong>{formatDuration(visitor.averageSessionSeconds)}</strong>
        </div>
        <div>
          <span>First seen</span>
          <strong>{formatAdminAnalyticsDateTime(visitor.firstSeen)}</strong>
        </div>
        <div>
          <span>Last seen</span>
          <strong>{formatAdminAnalyticsDateTime(visitor.lastSeen)}</strong>
        </div>
        <div>
          <span>Last page</span>
          <strong className="admin-path-cell">{visitor.lastPath}</strong>
        </div>
        <div>
          <span>Acquisition</span>
          <strong>
            {prettySource(visitor.source)}
            {visitor.countryCode ? ` · ${visitor.countryCode}` : ""}
          </strong>
        </div>
        <div>
          <span>Device</span>
          <strong>
            {prettyDevice(visitor.deviceType)} · {visitor.browser} / {visitor.os}
          </strong>
        </div>
        <div>
          <span>Approximate location</span>
          <strong>{location || "Not available"}</strong>
        </div>
      </div>

      <AnalyticsPanel kicker="Activity / Sessions" title="Session history">
        {visitor.sessions.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table admin-analytics-table">
              <thead>
                <tr>
                  <th>Started</th>
                  <th>Duration</th>
                  <th>Path</th>
                  <th>Pages</th>
                  <th>Source</th>
                  <th>Device</th>
                </tr>
              </thead>
              <tbody>
                {visitor.sessions.map((session) => (
                  <tr key={session.id}>
                    <td>{formatAdminAnalyticsDateTime(session.startedAt)}</td>
                    <td>{formatDuration(session.durationSeconds)}</td>
                    <td>
                      <span className="admin-path-cell">{session.entryPath}</span>
                      {session.exitPath !== session.entryPath ? (
                        <span className="admin-table-subtle">
                          Exited at {session.exitPath}
                        </span>
                      ) : null}
                    </td>
                    <td>{formatCount(session.pageviews)}</td>
                    <td>
                      <span>{prettySource(session.source)}</span>
                      <span className="admin-table-subtle">
                        {session.referrerHost ?? "No referrer"}
                      </span>
                    </td>
                    <td>
                      <span>
                        {prettyDevice(session.deviceType)} · {session.browser}
                      </span>
                      <span className="admin-table-subtle">{session.os}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-analytics-empty-copy">No sessions recorded.</p>
        )}
      </AnalyticsPanel>

      <AnalyticsPanel kicker="Activity / Navigation" title="Page view history">
        {visitor.pageviews.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table admin-analytics-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Page</th>
                  <th>Title</th>
                  <th>Time on page</th>
                </tr>
              </thead>
              <tbody>
                {visitor.pageviews.map((pageview) => (
                  <tr key={pageview.id}>
                    <td>{formatAdminAnalyticsDateTime(pageview.occurredAt)}</td>
                    <td className="admin-path-cell">{pageview.path}</td>
                    <td>{pageview.title || "Untitled page"}</td>
                    <td>{formatDuration(pageview.durationSeconds)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="admin-analytics-empty-copy">No page views recorded.</p>
        )}
      </AnalyticsPanel>

      <p className="admin-analytics-privacy-note">
        This record contains only anonymous, first-party analytics. It does not
        include a name, email, IP address, precise location, or cross-site
        tracking data. Use the retention helper in the analytics migration to
        delete old records when needed.
      </p>
    </>
  );
}

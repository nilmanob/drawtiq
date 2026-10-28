import "server-only";

import { describeDbError } from "@/lib/admin/errors";
import { hasSupabaseEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { bucketWindows, type AnalyticsWindow } from "./range";
import type {
  AnalyticsBreakdownRow,
  AnalyticsDashboard,
  AnalyticsDataResult,
  AnalyticsMetricComparison,
  AnalyticsPageRow,
  AnalyticsPageview,
  AnalyticsRecentVisitor,
  AnalyticsReferrerRow,
  AnalyticsSeriesPoint,
  AnalyticsSession,
  AnalyticsSourceRow,
  AnalyticsSummary,
  AnalyticsVisitorDetail,
  AnalyticsVisitorList,
  AnalyticsVisitorListItem,
} from "./types";

const SESSION_COLUMNS =
  "id, visitor_id, started_at, last_seen_at, entry_path, exit_path, pageview_count, is_new_visitor, referrer, referrer_host, source, utm_source, utm_medium, utm_campaign, device_type, browser, os, country_code, region, city";

const PAGEVIEW_COLUMNS =
  "id, session_id, visitor_id, path, title, referrer, occurred_at, duration_ms";

export const ANALYTICS_MAX_ROWS = 20000;
const QUERY_PAGE_SIZE = 1000;
const VISITOR_PAGE_SIZE = 25;

type QueryError = { code?: string; message?: string } | null;

type RangeRows = {
  sessions: AnalyticsSession[];
  pageviews: AnalyticsPageview[];
  limited: boolean;
};

type SummaryNumbers = {
  visitors: number;
  sessions: number;
  pageviews: number;
  averageSessionSeconds: number;
  bounceRate: number;
  newVisitors: number;
  returningVisitors: number;
};

function failure<T>(message: string): AnalyticsDataResult<T> {
  return { ok: false, data: null, error: message };
}

function analyticsError(error: { code?: string; message?: string } | null) {
  if (error?.code === "42P01") {
    return "Visitor analytics is not enabled yet. Apply supabase/migrations/20261028000300_visitor_analytics.sql in the Supabase SQL editor.";
  }

  if (error?.code === "42501") {
    return "The database refused access to analytics. Check the admin session and the analytics RLS policies.";
  }

  return describeDbError(error);
}

/**
 * PostgREST caps a single response at the project's max-rows setting (1000 by
 * default on Supabase). Read in explicit pages so the dashboard does not
 * silently calculate totals from only the first page.
 */
async function fetchPaged<T>(
  fetchPage: (
    from: number,
    to: number
  ) => PromiseLike<{ data: T[] | null; error: QueryError }>
): Promise<{ data: T[] | null; error: QueryError; limited: boolean }> {
  const rows: T[] = [];

  for (let from = 0; from < ANALYTICS_MAX_ROWS; from += QUERY_PAGE_SIZE) {
    const to = Math.min(from + QUERY_PAGE_SIZE - 1, ANALYTICS_MAX_ROWS - 1);
    const { data, error } = await fetchPage(from, to);

    if (error) {
      return { data: null, error, limited: false };
    }

    const page = data ?? [];
    rows.push(...page);

    if (page.length < QUERY_PAGE_SIZE) {
      return { data: rows, error: null, limited: false };
    }

    if (rows.length >= ANALYTICS_MAX_ROWS) {
      break;
    }
  }

  return { data: rows, error: null, limited: rows.length >= ANALYTICS_MAX_ROWS };
}

async function fetchRange(
  start: Date,
  end: Date
): Promise<AnalyticsDataResult<RangeRows>> {
  if (!hasSupabaseEnv()) {
    return failure(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and restart the server."
    );
  }

  const supabase = createSupabaseServerClient();

  const [sessionsResult, pageviewsResult] = await Promise.all([
    fetchPaged<AnalyticsSession>((from, to) =>
      supabase
        .from("analytics_sessions")
        .select(SESSION_COLUMNS)
        .gte("started_at", start.toISOString())
        .lt("started_at", end.toISOString())
        .order("started_at", { ascending: false })
        .order("id", { ascending: true })
        .range(from, to)
    ),
    fetchPaged<AnalyticsPageview>((from, to) =>
      supabase
        .from("analytics_pageviews")
        .select(PAGEVIEW_COLUMNS)
        .gte("occurred_at", start.toISOString())
        .lt("occurred_at", end.toISOString())
        .order("occurred_at", { ascending: false })
        .order("id", { ascending: true })
        .range(from, to)
    ),
  ]);

  const error = sessionsResult.error ?? pageviewsResult.error;

  if (error) {
    return failure(analyticsError(error));
  }

  return {
    ok: true,
    data: {
      sessions: sessionsResult.data ?? [],
      pageviews: pageviewsResult.data ?? [],
      limited: sessionsResult.limited || pageviewsResult.limited,
    },
    error: null,
  };
}

function durationBySession(pageviews: AnalyticsPageview[]): Map<string, number> {
  const durations = new Map<string, number>();

  for (const pageview of pageviews) {
    durations.set(
      pageview.session_id,
      (durations.get(pageview.session_id) ?? 0) + Math.max(0, pageview.duration_ms)
    );
  }

  return durations;
}

function summaryNumbers(
  sessions: AnalyticsSession[],
  pageviews: AnalyticsPageview[]
): SummaryNumbers {
  const visitorIds = new Set(sessions.map((session) => session.visitor_id));
  const newVisitorIds = new Set(
    sessions
      .filter((session) => session.is_new_visitor)
      .map((session) => session.visitor_id)
  );
  const returningVisitorIds = new Set(
    Array.from(visitorIds).filter((visitorId) => !newVisitorIds.has(visitorId))
  );
  const durations = durationBySession(pageviews);
  const totalDuration = sessions.reduce(
    (total, session) => total + (durations.get(session.id) ?? 0),
    0
  );
  const bounces = sessions.filter(
    (session) => session.pageview_count <= 1
  ).length;

  return {
    visitors: visitorIds.size,
    sessions: sessions.length,
    pageviews: pageviews.length,
    averageSessionSeconds: sessions.length
      ? totalDuration / sessions.length / 1000
      : 0,
    bounceRate: sessions.length ? (bounces / sessions.length) * 100 : 0,
    newVisitors: newVisitorIds.size,
    returningVisitors: returningVisitorIds.size,
  };
}

function changePercent(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }

  return ((current - previous) / previous) * 100;
}

function compare(
  current: number,
  previous: number
): AnalyticsMetricComparison {
  return {
    current,
    previous,
    changePercent: changePercent(current, previous),
  };
}

function buildSummary(
  current: SummaryNumbers,
  previous: SummaryNumbers
): AnalyticsSummary {
  return {
    visitors: compare(current.visitors, previous.visitors),
    sessions: compare(current.sessions, previous.sessions),
    pageviews: compare(current.pageviews, previous.pageviews),
    averageSessionSeconds: compare(
      current.averageSessionSeconds,
      previous.averageSessionSeconds
    ),
    bounceRate: compare(current.bounceRate, previous.bounceRate),
    newVisitors: compare(current.newVisitors, previous.newVisitors),
    returningVisitors: compare(
      current.returningVisitors,
      previous.returningVisitors
    ),
  };
}

function timestamp(value: string): number {
  return new Date(value).getTime();
}

function buildSeries(window: AnalyticsWindow, rows: RangeRows): AnalyticsSeriesPoint[] {
  const buckets = bucketWindows(window);

  return buckets.map((bucket) => {
    const start = bucket.start.getTime();
    const end = bucket.end.getTime();
    const bucketSessions = rows.sessions.filter((session) => {
      const time = timestamp(session.started_at);
      return time >= start && time < end;
    });
    const bucketPageviews = rows.pageviews.filter((pageview) => {
      const time = timestamp(pageview.occurred_at);
      return time >= start && time < end;
    });
    const visitors = new Set(
      bucketSessions.map((session) => session.visitor_id)
    );
    const newVisitors = new Set(
      bucketSessions
        .filter((session) => session.is_new_visitor)
        .map((session) => session.visitor_id)
    );

    return {
      bucket: bucket.start.toISOString(),
      label: bucket.label,
      visitors: visitors.size,
      newVisitors: newVisitors.size,
      sessions: bucketSessions.length,
      pageviews: bucketPageviews.length,
    };
  });
}

function buildTopPages(pageviews: AnalyticsPageview[]): AnalyticsPageRow[] {
  const rows = new Map<
    string,
    { views: number; visitors: Set<string>; durationMs: number }
  >();

  for (const pageview of pageviews) {
    const current = rows.get(pageview.path) ?? {
      views: 0,
      visitors: new Set<string>(),
      durationMs: 0,
    };

    current.views += 1;
    current.visitors.add(pageview.visitor_id);
    current.durationMs += Math.max(0, pageview.duration_ms);
    rows.set(pageview.path, current);
  }

  return Array.from(rows.entries())
    .map(([path, row]) => ({
      path,
      views: row.views,
      visitors: row.visitors.size,
      averageSeconds: row.views ? row.durationMs / row.views / 1000 : 0,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
}

function breakdown(
  sessions: AnalyticsSession[],
  pick: (session: AnalyticsSession) => string
): AnalyticsBreakdownRow[] {
  const counts = new Map<string, number>();

  for (const session of sessions) {
    const label = pick(session).trim() || "Unknown";
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({
      label,
      sessions: count,
      share: sessions.length ? (count / sessions.length) * 100 : 0,
    }))
    .sort((a, b) => b.sessions - a.sessions);
}

function buildSources(sessions: AnalyticsSession[]): AnalyticsSourceRow[] {
  return breakdown(sessions, (session) => session.source || "direct").map(
    (row) => ({
      source: row.label,
      sessions: row.sessions,
      share: row.share,
    })
  );
}

function buildReferrers(sessions: AnalyticsSession[]): AnalyticsReferrerRow[] {
  const counts = new Map<string, number>();

  for (const session of sessions) {
    if (!session.referrer_host) continue;
    counts.set(
      session.referrer_host,
      (counts.get(session.referrer_host) ?? 0) + 1
    );
  }

  return Array.from(counts.entries())
    .map(([referrerHost, count]) => ({ referrerHost, sessions: count }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 8);
}

type VisitorAggregate = {
  visitorId: string;
  firstSeen: string;
  lastSeen: string;
  sessions: number;
  pageviews: number;
  entryPath: string;
  lastPath: string;
  source: string;
  referrerHost: string | null;
  deviceType: string;
  browser: string;
  os: string;
  countryCode: string | null;
  isNewVisitor: boolean;
};

function aggregateVisitors(sessions: AnalyticsSession[]): VisitorAggregate[] {
  const groups = new Map<string, AnalyticsSession[]>();

  for (const session of sessions) {
    const group = groups.get(session.visitor_id) ?? [];
    group.push(session);
    groups.set(session.visitor_id, group);
  }

  return Array.from(groups.entries()).map(([visitorId, group]) => {
    const ordered = [...group].sort(
      (a, b) => timestamp(a.started_at) - timestamp(b.started_at)
    );
    const first = ordered[0];
    const latest = [...ordered].sort(
      (a, b) => timestamp(b.last_seen_at) - timestamp(a.last_seen_at)
    )[0];

    return {
      visitorId,
      firstSeen: first.started_at,
      lastSeen: latest.last_seen_at,
      sessions: ordered.length,
      pageviews: ordered.reduce(
        (total, session) => total + session.pageview_count,
        0
      ),
      entryPath: first.entry_path,
      lastPath: latest.exit_path,
      source: latest.source,
      referrerHost: latest.referrer_host,
      deviceType: latest.device_type,
      browser: latest.browser,
      os: latest.os,
      countryCode: latest.country_code,
      isNewVisitor: ordered.some((session) => session.is_new_visitor),
    };
  });
}

function recentVisitors(sessions: AnalyticsSession[]): AnalyticsRecentVisitor[] {
  return aggregateVisitors(sessions)
    .sort((a, b) => timestamp(b.lastSeen) - timestamp(a.lastSeen))
    .slice(0, 6)
    .map((visitor) => ({
      visitorId: visitor.visitorId,
      firstSeen: visitor.firstSeen,
      lastSeen: visitor.lastSeen,
      sessions: visitor.sessions,
      pageviews: visitor.pageviews,
      lastPath: visitor.lastPath,
      source: visitor.source,
      deviceType: visitor.deviceType,
      browser: visitor.browser,
      os: visitor.os,
      countryCode: visitor.countryCode,
      isNewVisitor: visitor.isNewVisitor,
    }));
}

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export async function getAnalyticsDashboard(
  window: AnalyticsWindow
): Promise<AnalyticsDataResult<AnalyticsDashboard>> {
  const [currentResult, previousResult] = await Promise.all([
    fetchRange(window.start, window.end),
    fetchRange(window.previousStart, window.previousEnd),
  ]);

  if (!currentResult.ok) {
    return currentResult;
  }

  if (!previousResult.ok) {
    return previousResult;
  }

  const current = currentResult.data;
  const previous = previousResult.data;
  const currentSummary = summaryNumbers(current.sessions, current.pageviews);
  const previousSummary = summaryNumbers(previous.sessions, previous.pageviews);

  return {
    ok: true,
    data: {
      summary: buildSummary(currentSummary, previousSummary),
      series: buildSeries(window, current),
      topPages: buildTopPages(current.pageviews),
      sources: buildSources(current.sessions),
      referrers: buildReferrers(current.sessions),
      devices: breakdown(
        current.sessions,
        (session) => session.device_type
      ).slice(0, 6),
      browsers: breakdown(
        current.sessions,
        (session) => session.browser
      ).slice(0, 6),
      operatingSystems: breakdown(
        current.sessions,
        (session) => session.os
      ).slice(0, 6),
      recentVisitors: recentVisitors(current.sessions),
      totalPageviewsInWindow: current.pageviews.length,
      limited: current.limited || previous.limited,
    },
    error: null,
  };
}

export async function getAnalyticsVisitors(
  window: AnalyticsWindow,
  options: {
    page?: string | string[];
    search?: string | string[];
  } = {}
): Promise<AnalyticsDataResult<AnalyticsVisitorList>> {
  const rowsResult = await fetchRange(window.start, window.end);

  if (!rowsResult.ok) {
    return rowsResult;
  }

  const searchRaw = Array.isArray(options.search)
    ? options.search[0]
    : options.search;
  const search = searchRaw?.trim().toLowerCase() ?? "";
  const page = parsePage(options.page);
  const grouped = aggregateVisitors(rowsResult.data.sessions)
    .filter((visitor) => {
      if (!search) return true;
      return [
        visitor.visitorId,
        visitor.entryPath,
        visitor.lastPath,
        visitor.source,
        visitor.referrerHost ?? "",
        visitor.deviceType,
        visitor.browser,
        visitor.os,
        visitor.countryCode ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(search);
    })
    .sort((a, b) => timestamp(b.lastSeen) - timestamp(a.lastSeen));

  const total = grouped.length;
  const pageSize = VISITOR_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageGroups = grouped.slice(start, start + pageSize);

  // The range groups only know about visits inside the selected period. Look
  // up each listed visitor's all-time first visit. One indexed query per
  // visitor avoids the PostgREST page cap silently dropping some visitors.
  const firstSeenByVisitor = new Map<string, string>();
  if (pageGroups.length) {
    const supabase = createSupabaseServerClient();
    const firstVisits = await Promise.all(
      pageGroups.map(async (visitor) => {
        const { data, error } = await supabase
          .from("analytics_sessions")
          .select("started_at")
          .eq("visitor_id", visitor.visitorId)
          .order("started_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        return { visitorId: visitor.visitorId, data, error };
      })
    );

    for (const row of firstVisits) {
      if (!row.error && row.data?.started_at) {
        firstSeenByVisitor.set(row.visitorId, row.data.started_at);
      }
    }
  }

  const items: AnalyticsVisitorListItem[] = pageGroups.map((visitor) => ({
    visitorId: visitor.visitorId,
    firstSeen: firstSeenByVisitor.get(visitor.visitorId) ?? visitor.firstSeen,
    lastSeen: visitor.lastSeen,
    sessions: visitor.sessions,
    pageviews: visitor.pageviews,
    entryPath: visitor.entryPath,
    lastPath: visitor.lastPath,
    source: visitor.source,
    referrerHost: visitor.referrerHost,
    deviceType: visitor.deviceType,
    browser: visitor.browser,
    os: visitor.os,
    countryCode: visitor.countryCode,
    isNewVisitor: visitor.isNewVisitor,
  }));

  return {
    ok: true,
    data: { items, total, page: safePage, pageSize },
    error: null,
  };
}

export async function getAnalyticsVisitor(
  visitorId: string
): Promise<AnalyticsDataResult<AnalyticsVisitorDetail>> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(visitorId)) {
    return failure("Invalid visitor id.");
  }

  if (!hasSupabaseEnv()) {
    return failure(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and restart the server."
    );
  }

  const supabase = createSupabaseServerClient();
  const { data: sessionData, error: sessionError } = await supabase
    .from("analytics_sessions")
    .select(SESSION_COLUMNS)
    .eq("visitor_id", visitorId)
    .order("started_at", { ascending: false })
    .limit(200);

  if (sessionError) {
    return failure(analyticsError(sessionError));
  }

  const sessions = (sessionData ?? []) as AnalyticsSession[];

  if (!sessions.length) {
    return failure("Visitor not found.");
  }

  const sessionIds = sessions.map((session) => session.id);
  const { data: pageviewData, error: pageviewError } = await supabase
    .from("analytics_pageviews")
    .select(PAGEVIEW_COLUMNS)
    .in("session_id", sessionIds)
    .order("occurred_at", { ascending: false })
    .limit(500);

  if (pageviewError) {
    return failure(analyticsError(pageviewError));
  }

  const pageviews = (pageviewData ?? []) as AnalyticsPageview[];
  const durations = durationBySession(pageviews);
  const totalPageviews = sessions.reduce(
    (total, session) => total + session.pageview_count,
    0
  );
  const totalDuration = sessions.reduce(
    (total, session) => total + (durations.get(session.id) ?? 0),
    0
  );
  const latest = [...sessions].sort(
    (a, b) => timestamp(b.last_seen_at) - timestamp(a.last_seen_at)
  )[0];
  const first = [...sessions].sort(
    (a, b) => timestamp(a.started_at) - timestamp(b.started_at)
  )[0];

  return {
    ok: true,
    data: {
      visitorId,
      firstSeen: first.started_at,
      lastSeen: latest.last_seen_at,
      sessions: sessions.map((session) => ({
        id: session.id,
        startedAt: session.started_at,
        lastSeenAt: session.last_seen_at,
        entryPath: session.entry_path,
        exitPath: session.exit_path,
        pageviews: session.pageview_count,
        durationSeconds: (durations.get(session.id) ?? 0) / 1000,
        source: session.source,
        referrerHost: session.referrer_host,
        deviceType: session.device_type,
        browser: session.browser,
        os: session.os,
        countryCode: session.country_code,
        region: session.region,
        city: session.city,
      })),
      pageviews: pageviews.map((pageview) => ({
        id: pageview.id,
        path: pageview.path,
        title: pageview.title,
        occurredAt: pageview.occurred_at,
        durationSeconds: Math.max(0, pageview.duration_ms) / 1000,
      })),
      totalSessions: sessions.length,
      totalPageviews,
      averageSessionSeconds: sessions.length
        ? totalDuration / sessions.length / 1000
        : 0,
      lastPath: latest.exit_path,
      source: latest.source,
      deviceType: latest.device_type,
      browser: latest.browser,
      os: latest.os,
      countryCode: latest.country_code,
      region: latest.region,
      city: latest.city,
    },
    error: null,
  };
}

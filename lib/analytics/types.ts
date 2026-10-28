export type AnalyticsSession = {
  id: string;
  visitor_id: string;
  started_at: string;
  last_seen_at: string;
  entry_path: string;
  exit_path: string;
  pageview_count: number;
  is_new_visitor: boolean;
  referrer: string | null;
  referrer_host: string | null;
  source: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  device_type: string;
  browser: string;
  os: string;
  country_code: string | null;
  region: string | null;
  city: string | null;
};

export type AnalyticsPageview = {
  id: string;
  session_id: string;
  visitor_id: string;
  path: string;
  title: string | null;
  referrer: string | null;
  occurred_at: string;
  duration_ms: number;
};

export type AnalyticsMetricComparison = {
  current: number;
  previous: number;
  changePercent: number | null;
};

export type AnalyticsSummary = {
  visitors: AnalyticsMetricComparison;
  sessions: AnalyticsMetricComparison;
  pageviews: AnalyticsMetricComparison;
  averageSessionSeconds: AnalyticsMetricComparison;
  bounceRate: AnalyticsMetricComparison;
  newVisitors: AnalyticsMetricComparison;
  returningVisitors: AnalyticsMetricComparison;
};

export type AnalyticsSeriesPoint = {
  bucket: string;
  label: string;
  visitors: number;
  newVisitors: number;
  sessions: number;
  pageviews: number;
};

export type AnalyticsPageRow = {
  path: string;
  views: number;
  visitors: number;
  averageSeconds: number;
};

export type AnalyticsSourceRow = {
  source: string;
  sessions: number;
  share: number;
};

export type AnalyticsReferrerRow = {
  referrerHost: string | null;
  sessions: number;
};

export type AnalyticsBreakdownRow = {
  label: string;
  sessions: number;
  share: number;
};

export type AnalyticsRecentVisitor = {
  visitorId: string;
  firstSeen: string;
  lastSeen: string;
  sessions: number;
  pageviews: number;
  lastPath: string;
  source: string;
  deviceType: string;
  browser: string;
  os: string;
  countryCode: string | null;
  isNewVisitor: boolean;
};

export type AnalyticsVisitorListItem = AnalyticsRecentVisitor & {
  entryPath: string;
  referrerHost: string | null;
};

export type AnalyticsVisitorList = {
  items: AnalyticsVisitorListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type AnalyticsVisitorSession = {
  id: string;
  startedAt: string;
  lastSeenAt: string;
  entryPath: string;
  exitPath: string;
  pageviews: number;
  durationSeconds: number;
  source: string;
  referrerHost: string | null;
  deviceType: string;
  browser: string;
  os: string;
  countryCode: string | null;
  region: string | null;
  city: string | null;
};

export type AnalyticsVisitorPageview = {
  id: string;
  path: string;
  title: string | null;
  occurredAt: string;
  durationSeconds: number;
};

export type AnalyticsVisitorDetail = {
  visitorId: string;
  firstSeen: string;
  lastSeen: string;
  sessions: AnalyticsVisitorSession[];
  pageviews: AnalyticsVisitorPageview[];
  totalSessions: number;
  totalPageviews: number;
  averageSessionSeconds: number;
  lastPath: string;
  source: string;
  deviceType: string;
  browser: string;
  os: string;
  countryCode: string | null;
  region: string | null;
  city: string | null;
};

export type AnalyticsDashboard = {
  summary: AnalyticsSummary;
  series: AnalyticsSeriesPoint[];
  topPages: AnalyticsPageRow[];
  sources: AnalyticsSourceRow[];
  referrers: AnalyticsReferrerRow[];
  devices: AnalyticsBreakdownRow[];
  browsers: AnalyticsBreakdownRow[];
  operatingSystems: AnalyticsBreakdownRow[];
  recentVisitors: AnalyticsRecentVisitor[];
  totalPageviewsInWindow: number;
  limited: boolean;
};

export type AnalyticsDataResult<T> =
  | { ok: true; data: T; error: null }
  | { ok: false; data: null; error: string };

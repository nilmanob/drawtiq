export type AnalyticsRangeKey = "7d" | "30d" | "90d" | "custom";
export type AnalyticsGranularity = "day" | "week" | "month";

export type AnalyticsWindow = {
  key: AnalyticsRangeKey;
  start: Date;
  end: Date;
  previousStart: Date;
  previousEnd: Date;
  days: number;
  granularity: AnalyticsGranularity;
  from: string;
  to: string;
  label: string;
  previousLabel: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function utcStartOfDay(value: Date): Date {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())
  );
}

function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function formatRangeLabel(start: Date, end: Date): string {
  const endInclusive = new Date(end.getTime() - DAY_MS);
  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  if (start.toISOString().slice(0, 10) === endInclusive.toISOString().slice(0, 10)) {
    return formatter.format(start);
  }

  return `${formatter.format(start)} – ${formatter.format(endInclusive)}`;
}

function parseDate(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function chooseGranularity(
  days: number,
  requested: string | undefined
): AnalyticsGranularity {
  if (requested === "day" || requested === "week" || requested === "month") {
    return requested;
  }

  if (days <= 31) return "day";
  if (days <= 120) return "week";
  return "month";
}

/**
 * Parse dashboard filters from the URL. All boundaries are UTC days so the
 * dashboard, the database timestamps, and the chart labels agree.
 */
export function getAnalyticsWindow(
  searchParams: Record<string, string | string[] | undefined> = {}
): AnalyticsWindow {
  const now = new Date();
  const today = utcStartOfDay(now);
  const end = new Date(today.getTime() + DAY_MS);

  const requestedKey = Array.isArray(searchParams.range)
    ? searchParams.range[0]
    : searchParams.range;
  const requestedGranularity = Array.isArray(searchParams.granularity)
    ? searchParams.granularity[0]
    : searchParams.granularity;
  const fromParam = Array.isArray(searchParams.from)
    ? searchParams.from[0]
    : searchParams.from;
  const toParam = Array.isArray(searchParams.to)
    ? searchParams.to[0]
    : searchParams.to;

  let key: AnalyticsRangeKey =
    requestedKey === "7d" ||
    requestedKey === "30d" ||
    requestedKey === "90d" ||
    requestedKey === "custom"
      ? requestedKey
      : "30d";

  let start: Date;
  let customEnd: Date;

  if (key === "custom") {
    const parsedFrom = parseDate(fromParam);
    const parsedTo = parseDate(toParam);

    if (parsedFrom && parsedTo) {
      const earlier = parsedFrom <= parsedTo ? parsedFrom : parsedTo;
      const later = parsedFrom <= parsedTo ? parsedTo : parsedFrom;
      start = earlier;
      customEnd = new Date(later.getTime() + DAY_MS);

      const maxStart = new Date(customEnd.getTime() - 366 * DAY_MS);
      if (start < maxStart) {
        start = maxStart;
      }
    } else {
      key = "30d";
      start = new Date(end.getTime() - 30 * DAY_MS);
      customEnd = end;
    }
  } else {
    const days = key === "7d" ? 7 : key === "90d" ? 90 : 30;
    start = new Date(end.getTime() - days * DAY_MS);
    customEnd = end;
  }

  const days = Math.max(
    1,
    Math.round((customEnd.getTime() - start.getTime()) / DAY_MS)
  );
  const previousEnd = start;
  const previousStart = new Date(start.getTime() - days * DAY_MS);
  const granularity = chooseGranularity(days, requestedGranularity);

  return {
    key,
    start,
    end: customEnd,
    previousStart,
    previousEnd,
    days,
    granularity,
    from: isoDate(start),
    to: isoDate(new Date(customEnd.getTime() - DAY_MS)),
    label: formatRangeLabel(start, customEnd),
    previousLabel: formatRangeLabel(previousStart, previousEnd),
  };
}

export function withAnalyticsRange(
  window: Pick<AnalyticsWindow, "key" | "from" | "to" | "granularity">,
  overrides: Partial<
    Pick<AnalyticsWindow, "key" | "from" | "to" | "granularity">
  > = {}
): string {
  const values = { ...window, ...overrides };
  const params = new URLSearchParams();

  if (values.key === "custom") {
    params.set("range", "custom");
    params.set("from", values.from);
    params.set("to", values.to);
  } else {
    params.set("range", values.key);
  }

  params.set("granularity", values.granularity);
  return `?${params.toString()}`;
}

export function bucketWindows(
  window: Pick<AnalyticsWindow, "start" | "end" | "granularity">
): Array<{ start: Date; end: Date; label: string }> {
  const buckets: Array<{ start: Date; end: Date; label: string }> = [];
  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const monthFormatter = new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  if (window.granularity === "month") {
    let cursor = new Date(
      Date.UTC(window.start.getUTCFullYear(), window.start.getUTCMonth(), 1)
    );

    while (cursor < window.end) {
      const next = new Date(
        Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1)
      );
      buckets.push({
        start: cursor < window.start ? window.start : cursor,
        end: next > window.end ? window.end : next,
        label: monthFormatter.format(cursor),
      });
      cursor = next;
    }

    return buckets;
  }

  if (window.granularity === "week") {
    let cursor = new Date(window.start);

    while (cursor < window.end) {
      const next = new Date(cursor.getTime() + 7 * DAY_MS);
      buckets.push({
        start: cursor,
        end: next > window.end ? window.end : next,
        label: `Week of ${formatter.format(cursor)}`,
      });
      cursor = next;
    }

    return buckets;
  }

  let cursor = new Date(window.start);

  while (cursor < window.end) {
    const next = new Date(cursor.getTime() + DAY_MS);
    buckets.push({
      start: cursor,
      end: next > window.end ? window.end : next,
      label: formatter.format(cursor),
    });
    cursor = next;
  }

  return buckets;
}

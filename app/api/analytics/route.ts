import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSupabasePublicEnv, hasSupabaseEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AnalyticsPayload = {
  eventId?: unknown;
  eventType?: unknown;
  sessionId?: unknown;
  visitorId?: unknown;
  path?: unknown;
  title?: unknown;
  referrer?: unknown;
  durationMs?: unknown;
  context?: unknown;
};

type BrowserInfo = {
  deviceType: string;
  browser: string;
  os: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let analyticsClient: SupabaseClient | undefined;

function getClient(): SupabaseClient {
  if (analyticsClient) {
    return analyticsClient;
  }

  const env = getSupabasePublicEnv();
  analyticsClient = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: { "x-client-info": "drawtiq-analytics" },
      },
    }
  );

  return analyticsClient;
}

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function number(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.min(86400000, Math.round(value)))
    : fallback;
}

function object(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function browserInfo(userAgent: string): BrowserInfo {
  const ua = userAgent.toLowerCase();

  if (/bot|crawler|spider|headless|preview/.test(ua)) {
    return { deviceType: "bot", browser: "Bot", os: "Unknown" };
  }

  const deviceType = /ipad|tablet|playbook|silk/.test(ua)
    ? "tablet"
    : /mobile|iphone|ipod|android.*mobile|windows phone/.test(ua)
      ? "mobile"
      : "desktop";

  let browser = "Other";
  if (/edg\//.test(ua)) browser = "Edge";
  else if (/opr\/|opera/.test(ua)) browser = "Opera";
  else if (/samsungbrowser/.test(ua)) browser = "Samsung Internet";
  else if (/firefox|fxios/.test(ua)) browser = "Firefox";
  else if (/chrome|crios/.test(ua)) browser = "Chrome";
  else if (/safari/.test(ua)) browser = "Safari";

  let os = "Other";
  if (/windows/.test(ua)) os = "Windows";
  else if (/iphone|ipad|ipod/.test(ua)) os = "iOS";
  else if (/android/.test(ua)) os = "Android";
  else if (/mac os x|macintosh/.test(ua)) os = "macOS";
  else if (/linux/.test(ua)) os = "Linux";

  return { deviceType, browser, os };
}

function decodeGeo(value: string | null): Record<string, unknown> {
  if (!value) return {};

  try {
    const decoded = JSON.parse(value) as unknown;
    return object(decoded);
  } catch {
    // Netlify has shipped this header both as JSON and as a URL-encoded
    // payload. Try the other common representation without failing the event.
    try {
      return object(JSON.parse(decodeURIComponent(value)));
    } catch {
      try {
        return object(
          JSON.parse(Buffer.from(value, "base64").toString("utf8"))
        );
      } catch {
        return {};
      }
    }
  }
}

function geoFromHeaders(headers: Headers): {
  countryCode: string | null;
  region: string | null;
  city: string | null;
} {
  const netlifyGeo = decodeGeo(headers.get("x-nf-geo"));
  const countryCode =
    text(headers.get("x-vercel-ip-country"), 8) ??
    text(headers.get("cf-ipcountry"), 8) ??
    text(headers.get("x-country-code"), 8) ??
    text(netlifyGeo.country, 8) ??
    text(netlifyGeo.country_code, 8);
  const region =
    text(headers.get("x-vercel-ip-country-region"), 128) ??
    text(netlifyGeo.region, 128) ??
    text(netlifyGeo.subdivision, 128);
  const rawCity =
    text(headers.get("x-vercel-ip-city"), 128) ??
    text(netlifyGeo.city, 128);

  let city = rawCity;
  if (city) {
    try {
      city = decodeURIComponent(city);
    } catch {
      // Keep the already-decoded header value.
    }
  }

  return {
    countryCode: countryCode ? countryCode.toUpperCase() : null,
    region,
    city,
  };
}

function safeReferrer(value: unknown): string | null {
  const raw = text(value, 2048);
  if (!raw) return null;

  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    // Referrers can contain search terms, tokens, or other personal data in
    // their query string. Store only the origin and path.
    return `${url.origin}${url.pathname}`;
  } catch {
    return null;
  }
}

function referrerHost(referrer: string | null): string | null {
  if (!referrer) return null;

  try {
    return new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function sourceFor(
  host: string | null,
  siteHost: string | null
): string {
  if (!host) return "direct";
  if (siteHost && host === siteHost) return "internal";
  if (/(^|\.)(google|bing|duckduckgo|yahoo|ecosia|baidu)\./.test(host)) {
    return "search";
  }
  if (
    /(^|\.)(facebook|instagram|linkedin|twitter|x|t|pinterest|youtube|tiktok|reddit)\./.test(
      host
    )
  ) {
    return "social";
  }
  return "referral";
}

export async function POST(request: Request) {
  let payload: AnalyticsPayload;

  try {
    payload = (await request.json()) as AnalyticsPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const eventId = text(payload.eventId, 64);
  const eventType = text(payload.eventType, 32);
  const sessionId = text(payload.sessionId, 64);
  const visitorId = text(payload.visitorId, 64);
  const path = text(payload.path, 2048);

  if (
    !eventId ||
    !UUID_PATTERN.test(eventId) ||
    !sessionId ||
    !UUID_PATTERN.test(sessionId) ||
    !visitorId ||
    !UUID_PATTERN.test(visitorId) ||
    (eventType !== "pageview" && eventType !== "pageview_end") ||
    !path ||
    !path.startsWith("/")
  ) {
    return NextResponse.json({ error: "Invalid analytics event." }, { status: 400 });
  }

  // Analytics must never be able to break a public request. If Supabase is not
  // configured, accept and drop the event.
  if (!hasSupabaseEnv()) {
    return new NextResponse(null, {
      status: 204,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const headers = request.headers;
  const userAgent = headers.get("user-agent") ?? "";
  const info = browserInfo(userAgent);
  const geo = geoFromHeaders(headers);
  const referrer = safeReferrer(payload.referrer);
  const host = referrerHost(referrer);
  const siteHost = (
    headers.get("x-forwarded-host") ??
    headers.get("host") ??
    ""
  )
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase() || null;
  const clientContext = object(payload.context);

  const context = {
    site_host: siteHost,
    referrer_host: host,
    source: sourceFor(host, siteHost),
    device_type: info.deviceType,
    browser: info.browser,
    os: info.os,
    country_code: geo.countryCode,
    region: geo.region,
    city: geo.city,
    utm_source: text(clientContext.utm_source, 128),
    utm_medium: text(clientContext.utm_medium, 128),
    utm_campaign: text(clientContext.utm_campaign, 128),
  };

  try {
    const { error } = await getClient().rpc("record_analytics_event", {
      p_event_id: eventId,
      p_event_type: eventType,
      p_session_id: sessionId,
      p_visitor_id: visitorId,
      p_path: path,
      p_title: text(payload.title, 320),
      p_referrer: referrer,
      p_duration_ms: number(payload.durationMs),
      p_context: context,
    });

    if (
      error &&
      error.code !== "42P01" &&
      error.code !== "PGRST202"
    ) {
      console.error("[analytics] event could not be recorded:", error.message);
    }
  } catch (error) {
    console.error(
      "[analytics] event could not be recorded:",
      error instanceof Error ? error.message : "unknown error"
    );
  }

  return new NextResponse(null, {
    status: 204,
    headers: { "Cache-Control": "no-store" },
  });
}

export function GET() {
  return NextResponse.json(
    { error: "Method not allowed." },
    { status: 405, headers: { Allow: "POST" } }
  );
}

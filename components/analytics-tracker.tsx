"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type ConsentState = "loading" | "unknown" | "granted" | "denied";

type PageView = {
  eventId: string;
  sessionId: string;
  visitorId: string;
  path: string;
  startedAt: number;
};

type AnalyticsEvent = {
  eventId: string;
  eventType: "pageview" | "pageview_end";
  sessionId: string;
  visitorId: string;
  path: string;
  title: string | null;
  referrer: string | null;
  durationMs: number;
  context: {
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
  };
};

const CONSENT_KEY = "drawtiq.analytics.consent.v1";
const VISITOR_KEY = "drawtiq.analytics.visitor.v1";
const SESSION_KEY = "drawtiq.analytics.session.v1";
const SESSION_IDLE_MS = 30 * 60 * 1000;

function makeUuid(): string {
  const cryptoObject = globalThis.crypto;

  if (cryptoObject?.randomUUID) {
    return cryptoObject.randomUUID();
  }

  const bytes = new Uint8Array(16);

  if (cryptoObject?.getRandomValues) {
    cryptoObject.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes).map((byte) =>
    byte.toString(16).padStart(2, "0")
  );

  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10).join(""),
  ].join("-");
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function localStore(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function sessionStore(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function readStorage(storage: Storage | null, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeStorage(storage: Storage | null, key: string, value: string) {
  try {
    storage?.setItem(key, value);
  } catch {
    // A blocked storage API must not affect the public site.
  }
}

function removeStorage(storage: Storage | null, key: string) {
  try {
    storage?.removeItem(key);
  } catch {
    // Ignore blocked storage.
  }
}

function visitorId(): string {
  const storage = localStore();
  const stored = readStorage(storage, VISITOR_KEY);

  if (stored && isUuid(stored)) {
    return stored;
  }

  const created = makeUuid();
  writeStorage(storage, VISITOR_KEY, created);
  return created;
}

function sessionId(): { id: string; isNew: boolean } {
  const storage = sessionStore();
  const stored = readStorage(storage, SESSION_KEY);
  const now = Date.now();

  if (stored) {
    try {
      const parsed = JSON.parse(stored) as {
        id?: unknown;
        lastActivity?: unknown;
      };

      if (
        typeof parsed.id === "string" &&
        isUuid(parsed.id) &&
        typeof parsed.lastActivity === "number" &&
        now - parsed.lastActivity < SESSION_IDLE_MS
      ) {
        writeStorage(
          storage,
          SESSION_KEY,
          JSON.stringify({ id: parsed.id, lastActivity: now })
        );
        return { id: parsed.id, isNew: false };
      }
    } catch {
      // Replace malformed storage below.
    }
  }

  const created = makeUuid();
  writeStorage(
    storage,
    SESSION_KEY,
    JSON.stringify({ id: created, lastActivity: now })
  );
  return { id: created, isNew: true };
}

function touchSession(id: string) {
  writeStorage(
    sessionStore(),
    SESSION_KEY,
    JSON.stringify({ id, lastActivity: Date.now() })
  );
}

function utmContext(): AnalyticsEvent["context"] {
  const params = new URLSearchParams(window.location.search);

  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
  };
}

function externalReferrer(): string | null {
  if (!document.referrer) return null;

  try {
    return new URL(document.referrer).origin === window.location.origin
      ? null
      : document.referrer;
  } catch {
    return null;
  }
}

function sendEvent(event: AnalyticsEvent, preferBeacon: boolean) {
  const body = JSON.stringify(event);

  if (preferBeacon && typeof navigator.sendBeacon === "function") {
    try {
      if (
        navigator.sendBeacon(
          "/api/analytics",
          new Blob([body], { type: "application/json" })
        )
      ) {
        return;
      }
    } catch {
      // Fall through to fetch.
    }
  }

  try {
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // Analytics is best-effort and must never surface an error to a visitor.
    });
  } catch {
    // Ignore network and privacy-mode failures.
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const [consent, setConsent] = useState<ConsentState>("loading");
  const currentRef = useRef<PageView | null>(null);

  const finalize = useCallback((preferBeacon: boolean) => {
    const current = currentRef.current;

    if (!current) return;

    const now = Date.now();
    const durationMs = Math.min(
      Math.max(0, now - current.startedAt),
      86_400_000
    );

    sendEvent(
      {
        eventId: current.eventId,
        eventType: "pageview_end",
        sessionId: current.sessionId,
        visitorId: current.visitorId,
        path: current.path,
        title: document.title || null,
        referrer: null,
        durationMs,
        context: utmContext(),
      },
      preferBeacon
    );

    // Prevent pagehide/visibilitychange from sending the same page-view end
    // more than once.
    currentRef.current = null;
    touchSession(current.sessionId);
  }, []);

  const startPageView = useCallback((path: string) => {
    const visitor = visitorId();
    const session = sessionId();
    const eventId = makeUuid();
    const current: PageView = {
      eventId,
      sessionId: session.id,
      visitorId: visitor,
      path,
      startedAt: Date.now(),
    };

    currentRef.current = current;

    sendEvent(
      {
        eventId,
        eventType: "pageview",
        sessionId: session.id,
        visitorId: visitor,
        path,
        title: document.title || null,
        referrer: session.isNew ? externalReferrer() : null,
        durationMs: 0,
        context: utmContext(),
      },
      false
    );
  }, []);

  useEffect(() => {
    const doNotTrack =
      navigator.doNotTrack === "1" ||
      (navigator as Navigator & { globalPrivacyControl?: boolean })
        .globalPrivacyControl === true;
    const stored = readStorage(localStore(), CONSENT_KEY);

    if (doNotTrack) {
      setConsent("denied");
      return;
    }

    if (stored === "granted" || stored === "denied") {
      setConsent(stored);
      return;
    }

    setConsent("unknown");
  }, []);

  useEffect(() => {
    if (consent !== "granted") {
      if (consent === "denied") {
        currentRef.current = null;
      }
      return;
    }

    const path = window.location.pathname || "/";
    const current = currentRef.current;

    if (current?.path === path) {
      return;
    }

    if (current) {
      finalize(true);
    }

    startPageView(path);
  }, [consent, finalize, pathname, startPageView]);

  useEffect(() => {
    if (consent !== "granted") return;

    const flush = () => finalize(true);
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flush();
      }
    };

    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [consent, finalize]);

  const decide = (next: "granted" | "denied") => {
    writeStorage(localStore(), CONSENT_KEY, next);
    setConsent(next);

    if (next === "denied") {
      removeStorage(localStore(), VISITOR_KEY);
      removeStorage(sessionStore(), SESSION_KEY);
      currentRef.current = null;
    }
  };

  if (consent !== "unknown") {
    return null;
  }

  return (
    <aside
      className="analytics-consent"
      aria-label="Analytics preferences"
    >
      <div className="analytics-consent-copy">
        <p className="analytics-consent-kicker">Privacy / Analytics</p>
        <p>
          We use anonymous first-party analytics to understand which pages are
          useful. No ads, cross-site tracking, names, emails, or IP storage.
        </p>
      </div>
      <div className="analytics-consent-actions">
        <button
          type="button"
          className="analytics-consent-button"
          onClick={() => decide("granted")}
        >
          Allow analytics
        </button>
        <button
          type="button"
          className="analytics-consent-decline"
          onClick={() => decide("denied")}
        >
          Essential only
        </button>
      </div>
    </aside>
  );
}

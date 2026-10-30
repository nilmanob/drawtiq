import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getContactFormFields } from "@/lib/content/cms";
import { sendInquiryNotification } from "@/lib/email/notify";
import { getSupabasePublicEnv, hasSupabaseEnv } from "@/lib/env";
import {
  INQUIRY_BUDGETS,
  INQUIRY_SERVICES,
  inquirySchema,
  matchOption,
} from "@/lib/validation/inquiry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 32 * 1024;
const RATE_LIMIT_RETRY_SECONDS = 900;
const MIN_FORM_TIME_MS = 1500;

function jsonError(message: string, status: number, headers?: HeadersInit) {
  return NextResponse.json(
    { ok: false, error: message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...headers,
      },
    }
  );
}

function jsonSuccess() {
  return NextResponse.json(
    { ok: true },
    { status: 201, headers: { "Cache-Control": "no-store" } }
  );
}

type Outcome = "sent" | "invalid" | "limited" | "unavailable" | "error";

/**
 * Plain HTML form posts (JavaScript not loaded yet, or blocked) get a redirect
 * back to the page they came from, where the form shows the outcome.
 */
function formRedirect(request: Request, outcome: Outcome) {
  let path = "/contact";
  try {
    const referer = new URL(request.headers.get("referer") ?? "");
    if (referer.origin === new URL(request.url).origin && referer.pathname.startsWith("/")) {
      path = referer.pathname;
    }
  } catch {
    // Missing or foreign referer: fall back to the contact page.
  }
  const target = new URL(path, request.url);
  target.searchParams.set("inquiry", outcome);
  target.hash = "project-form";
  return NextResponse.redirect(target, 303);
}

/**
 * Allowed select values: whatever the CMS contact form currently offers, plus
 * the built-in defaults, so editing options in the admin never breaks the form.
 */
async function allowedOptions() {
  const services = new Set<string>(INQUIRY_SERVICES);
  const budgets = new Set<string>(INQUIRY_BUDGETS);

  try {
    const { data } = await getContactFormFields();
    for (const field of data ?? []) {
      const options = (field.options ?? []).filter(
        (option): option is string => typeof option === "string"
      );
      if (field.field_name === "service") options.forEach((option) => services.add(option));
      if (field.field_name === "budget") options.forEach((option) => budgets.add(option));
    }
  } catch {
    // Defaults only.
  }

  return { services, budgets };
}

function clientIp(request: Request): string | null {
  // Prefer headers set by the hosting proxy. x-forwarded-for is client-supplied
  // in some deployments, so it is the fallback rather than the first choice.
  const candidate =
    request.headers.get("x-nf-client-connection-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    null;

  if (!candidate || candidate.length > 128) {
    return null;
  }

  return candidate;
}

function hashRateLimitValue(value: string): string {
  const salt = process.env.INQUIRY_HASH_SALT?.trim() ?? "";
  return createHash("sha256").update(`drawtiq:${salt}:${value}`).digest("hex");
}

function isRateLimitError(code: string | undefined, message: string): boolean {
  return code === "P0001" || message.toLowerCase().includes("rate_limited");
}

function isMissingFunctionError(code: string | undefined, message: string): boolean {
  return (
    code === "PGRST202" ||
    message.toLowerCase().includes("could not find the function") ||
    message.toLowerCase().includes("schema cache")
  );
}

/**
 * Public inquiry endpoint.
 *
 * The anon key is used deliberately. Direct INSERT privileges on inquiries are
 * revoked by the migration; the only write path is the SECURITY DEFINER
 * submit_inquiry function, which applies per-email and per-IP rate limits.
 * RLS still prevents anon from reading inquiries back.
 */
export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  const isForm = contentType.includes("application/x-www-form-urlencoded");
  if (!contentType.includes("application/json") && !isForm) {
    return jsonError("Send the inquiry as JSON.", 415);
  }

  // Same outcome, shaped for the caller: JSON for the page script, a redirect
  // for a plain form post.
  const respond = (outcome: Outcome, json: () => Response) =>
    isForm ? formRedirect(request, outcome) : json();

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return jsonError("Request body is too large.", 413);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return jsonError("Could not read the request body.", 400);
  }

  if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
    return jsonError("Request body is too large.", 413);
  }

  let payload: unknown;
  if (isForm) {
    const fields = new URLSearchParams(rawBody);
    payload = {
      name: fields.get("name") ?? "",
      email: fields.get("email") ?? "",
      service: fields.get("service") ?? "",
      budget: fields.get("budget") ?? "",
      message: fields.get("message") ?? "",
      website: fields.get("website") ?? "",
    };
  } else {
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return jsonError("Invalid JSON body.", 400);
    }
  }

  const parsed = inquirySchema.safeParse(payload);
  const invalid = (fields: Record<string, string[] | undefined>) =>
    respond("invalid", () =>
      NextResponse.json(
        { ok: false, error: "Please check the highlighted fields.", fields },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      )
    );

  if (!parsed.success) {
    return invalid(parsed.error.flatten().fieldErrors);
  }

  const { name, email, message, website, elapsedMs } = parsed.data;

  // Honeypot and too-fast submissions receive a normal-looking response but
  // are not inserted, so automated senders cannot tune around the trap.
  if (website || (elapsedMs !== undefined && elapsedMs < MIN_FORM_TIME_MS)) {
    return respond("sent", jsonSuccess);
  }

  if (!hasSupabaseEnv()) {
    return respond("unavailable", () =>
      jsonError("Inquiry submissions are not configured yet.", 503)
    );
  }

  const allowed = await allowedOptions();
  const service = matchOption(parsed.data.service, allowed.services);
  if (!service) {
    return invalid({ service: ["Choose a valid service."] });
  }
  // Budget is optional: an unrecognized value (such as a "Choose a range"
  // prompt saved as an option) is stored as no budget instead of rejecting
  // the whole inquiry.
  const budget = matchOption(parsed.data.budget, allowed.budgets) ?? "";
  const budgetValue = /^choose\b/i.test(budget) ? "" : budget;

  const env = getSupabasePublicEnv();
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  const ip = clientIp(request);
  const ipHash = ip ? hashRateLimitValue(`ip:${ip}`) : null;

  const { data, error } = await supabase.rpc("submit_inquiry", {
    p_name: name,
    p_email: email,
    p_service: service,
    p_budget: budgetValue || null,
    p_message: message,
    p_ip_hash: ipHash,
  });

  if (error) {
    // Do not log inquiry contents. Keep server logs useful without PII.
    console.error("Inquiry submission failed:", error.code, error.message);

    if (isRateLimitError(error.code, error.message)) {
      return respond("limited", () =>
        jsonError("Too many inquiries. Please try again later.", 429, {
          "Retry-After": String(RATE_LIMIT_RETRY_SECONDS),
        })
      );
    }

    if (isMissingFunctionError(error.code, error.message)) {
      return respond("unavailable", () =>
        jsonError("Inquiry submissions are not configured yet.", 503)
      );
    }

    return respond("error", () =>
      jsonError("We could not save your inquiry. Please try again.", 500)
    );
  }

  const inquiryId = typeof data === "string" ? data : null;

  try {
    await sendInquiryNotification({
      id: inquiryId,
      name,
      email,
      service: service || null,
      budget: budgetValue || null,
      message,
      createdAt: new Date().toISOString(),
    });
  } catch {
    // The inquiry is already stored. Notification failures must not turn a
    // successful submission into a client error and invite duplicates.
    console.error("Inquiry notification failed unexpectedly.");
  }

  return respond("sent", jsonSuccess);
}

import "server-only";

export type InquiryNotification = {
  id: string | null;
  name: string;
  email: string;
  service: string | null;
  budget: string | null;
  message: string;
  createdAt: string;
};

export type NotificationResult = {
  sent: boolean;
  reason: "sent" | "disabled" | "not-configured" | "unsupported" | "provider-error";
};

function envValue(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function formatSubmittedAt(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toUTCString();
}

function plainTextBody(inquiry: InquiryNotification): string {
  return [
    "New inquiry from the Drawtiq website",
    "",
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Service: ${inquiry.service ?? "Not specified"}`,
    `Budget: ${inquiry.budget ?? "Not specified"}`,
    `Submitted: ${formatSubmittedAt(inquiry.createdAt)}`,
    `Status: new`,
    inquiry.id ? `Inquiry ID: ${inquiry.id}` : null,
    "",
    "Project details:",
    inquiry.message,
    "",
    "Reply directly to this email to contact the sender.",
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

/**
 * Send a best-effort notification using Resend's HTTP API.
 *
 * The inquiry is already stored before this runs. Missing configuration or a
 * provider outage must never cause the visitor to resubmit and create a
 * duplicate inquiry, so this function reports failure instead of throwing.
 */
export async function sendInquiryNotification(
  inquiry: InquiryNotification
): Promise<NotificationResult> {
  const provider = envValue("EMAIL_PROVIDER").toLowerCase() || "resend";

  if (provider === "none" || provider === "disabled") {
    return { sent: false, reason: "disabled" };
  }

  if (provider !== "resend") {
    console.error("Inquiry notification skipped: unsupported EMAIL_PROVIDER.");
    return { sent: false, reason: "unsupported" };
  }

  const apiKey = envValue("RESEND_API_KEY");
  const to = envValue("INQUIRY_NOTIFICATION_TO");
  const from = envValue("INQUIRY_NOTIFICATION_FROM");

  if (!apiKey || !to || !from) {
    return { sent: false, reason: "not-configured" };
  }

  const recipients = to
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (recipients.length === 0) {
    return { sent: false, reason: "not-configured" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: recipients,
        reply_to: inquiry.email,
        subject: `New Drawtiq inquiry — ${inquiry.service ?? "General"}`,
        text: plainTextBody(inquiry),
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Inquiry notification failed:", response.status);
      return { sent: false, reason: "provider-error" };
    }

    return { sent: true, reason: "sent" };
  } catch (error) {
    // Do not log the inquiry body or recipient address.
    console.error(
      "Inquiry notification failed:",
      error instanceof Error ? error.name : "unknown error"
    );
    return { sent: false, reason: "provider-error" };
  } finally {
    clearTimeout(timeout);
  }
}

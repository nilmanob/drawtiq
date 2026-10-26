export function formatAdminDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
    }).format(new Date(value));
  } catch {
    return "—";
  }
}

export function formatAdminDateTime(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "—";
  }
}

export function truncate(value: string | null | undefined, length = 90) {
  if (!value) {
    return "";
  }

  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}

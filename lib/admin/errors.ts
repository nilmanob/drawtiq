type DbError = {
  code?: string;
  message?: string;
} | null;

/**
 * Return a safe, useful admin-facing message without dumping a full SQL
 * payload into the UI.
 */
export function describeDbError(error: DbError) {
  if (!error) {
    return "The database request failed.";
  }

  switch (error.code) {
    case "23505":
      return "That value already exists. Check the slug or another unique field.";
    case "23503":
      return "A referenced record could not be found.";
    case "23514":
      return "Some fields do not meet the database constraints. Check the values and try again.";
    case "42501":
      return "The database refused this action. Check that the admin policy and allowlist are configured.";
    case "P0001":
      return error.message || "The database refused this action.";
    case "42P01":
      return "The database tables are missing. Apply the Supabase migration first.";
    case "PGRST116":
      return "The requested record was not found.";
    default: {
      const code = error.code ? ` (${error.code})` : "";
      return `The database request failed${code}. Please try again.`;
    }
  }
}

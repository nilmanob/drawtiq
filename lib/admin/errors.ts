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
    case "PGRST202":
    case "42883":
      return "A required database function is missing. Apply the Supabase migrations (see README) and try again.";
    case "42703":
      return "The database is missing a column this screen needs. Apply the Supabase migrations and try again.";
    // Custom codes raised by the team functions in 20261029000100_team_access.sql.
    case "DT403":
    case "DT404":
    case "DT409":
    case "DT422":
      return error.message || "The database refused this action.";
    default: {
      const code = error.code ? ` (${error.code})` : "";
      return `The database request failed${code}. Please try again.`;
    }
  }
}

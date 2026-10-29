export const PASSWORD_MIN_LENGTH = 8;
// bcrypt, which Supabase Auth uses, ignores bytes past 72.
export const PASSWORD_MAX_LENGTH = 72;

/**
 * Shared client-side checks for every password form. Supabase Auth still
 * enforces the project's own password policy on the server.
 */
export function validateNewPassword(password: string, confirmPassword: string) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Use at least ${PASSWORD_MIN_LENGTH} characters for your new password.`;
  }

  if (new TextEncoder().encode(password).length > PASSWORD_MAX_LENGTH) {
    return `Use ${PASSWORD_MAX_LENGTH} characters or fewer.`;
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Include at least one letter and one number.";
  }

  if (password !== confirmPassword) {
    return "The two passwords do not match.";
  }

  return null;
}

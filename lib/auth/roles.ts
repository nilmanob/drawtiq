// Database values stay owner/admin/editor/viewer for backward compatibility;
// "owner" is presented as Super Admin throughout the admin.
export const ADMIN_ROLES = ["owner", "admin", "editor", "viewer"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_STATUSES = ["active", "suspended"] as const;

export type AdminStatus = (typeof ADMIN_STATUSES)[number];

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  owner: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

export const ADMIN_ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  owner:
    "Full access, including team members, roles, and access. Keep this role limited to the studio owners.",
  admin:
    "Manages pages, content, site settings, inquiries, and analytics retention. Cannot manage the team or roles.",
  editor:
    "Edits website pages and content collections. Can read inquiries and analytics, but not change site settings, inquiries, or the team.",
  viewer:
    "Read-only access to the dashboard, analytics, and inquiries. Cannot open content editors.",
};

export type AdminPermission =
  | "content:write"
  | "settings:write"
  | "inquiries:write"
  | "users:manage";

// Mirrors the database helpers (can_manage_content, can_manage_settings,
// can_manage_inquiries, can_manage_users). RLS remains the final authority.
const ROLE_PERMISSIONS: Record<AdminRole, readonly AdminPermission[]> = {
  owner: ["content:write", "settings:write", "inquiries:write", "users:manage"],
  admin: ["content:write", "settings:write", "inquiries:write"],
  editor: ["content:write"],
  viewer: [],
};

export const ADMIN_PERMISSION_LABELS: Record<AdminPermission, string> = {
  "content:write": "Edit pages and content",
  "settings:write": "Edit site settings, navigation, and footer",
  "inquiries:write": "Change or delete inquiries",
  "users:manage": "Manage team, roles, and access",
};

export function isAdminRole(value: unknown): value is AdminRole {
  return (
    typeof value === "string" &&
    (ADMIN_ROLES as readonly string[]).includes(value)
  );
}

export function isAdminStatus(value: unknown): value is AdminStatus {
  return (
    typeof value === "string" &&
    (ADMIN_STATUSES as readonly string[]).includes(value)
  );
}

export function hasPermission(
  role: AdminRole,
  permission: AdminPermission
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export const ADMIN_ROLE_OPTIONS = ADMIN_ROLES.map((role) => ({
  value: role,
  label: ADMIN_ROLE_LABELS[role],
  description: ADMIN_ROLE_DESCRIPTIONS[role],
}));

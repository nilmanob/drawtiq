export const ADMIN_ROLES = ["owner", "admin", "editor", "viewer"] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  owner: "Owner",
  admin: "Administrator",
  editor: "Editor",
  viewer: "Viewer",
};

export const ADMIN_ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  owner:
    "Full access, including team roles and site settings. Keep this role limited to the studio owner.",
  admin:
    "Manages content, inquiries, analytics, and retention. Cannot change other team roles.",
  editor:
    "Creates and edits projects, services, posts, and CMS content. Can update inquiry status.",
  viewer:
    "Read-only access to the dashboard, analytics, and inquiries. Cannot open content editors.",
};

export type AdminPermission = "content:write" | "inquiries:write" | "users:manage";

const ROLE_PERMISSIONS: Record<AdminRole, readonly AdminPermission[]> = {
  owner: ["content:write", "inquiries:write", "users:manage"],
  admin: ["content:write", "inquiries:write"],
  editor: ["content:write", "inquiries:write"],
  viewer: [],
};

export function isAdminRole(value: unknown): value is AdminRole {
  return (
    typeof value === "string" &&
    (ADMIN_ROLES as readonly string[]).includes(value)
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

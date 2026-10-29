import type { AdminRole, AdminStatus } from "@/lib/auth/roles";

export type ContentStatus = "draft" | "published" | "archived";
export type InquiryStatus = "new" | "read" | "replied" | "archived";

export type AdminInviteState = "pending" | "never_signed_in" | "accepted" | "unknown";

export type AdminTeamMember = {
  user_id: string;
  email: string;
  display_name: string | null;
  role: AdminRole;
  status: AdminStatus;
  created_at: string;
  invited_at: string | null;
  invited_by_email: string | null;
  status_changed_at: string | null;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  invite_state: AdminInviteState;
};

export type AdminTeamData = {
  members: AdminTeamMember[];
  /** False until 20261029000100_team_access.sql is applied. */
  accessMigrationApplied: boolean;
};

export type AdminAuditEntry = {
  id: number;
  actor_email: string | null;
  action: string;
  target_email: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

export type AdminProject = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  discipline: string | null;
  industry: string | null;
  scope: string | null;
  summary: string | null;
  challenge: string | null;
  approach: string | null;
  solution: string | null;
  outcome: string | null;
  visual_key: string;
  cover_image_path: string | null;
  gallery: unknown[];
  featured: boolean;
  status: ContentStatus;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminService = {
  id: string;
  slug: string;
  title: string;
  blurb: string | null;
  intro: string | null;
  icon: string | null;
  preview_path: string | null;
  tags: string[];
  deliverables: unknown[];
  faqs: unknown[];
  status: ContentStatus;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  read_time: string | null;
  visual: string | null;
  label: string | null;
  display: Record<string, unknown>;
  body: unknown[];
  status: ContentStatus;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminInquiry = {
  id: string;
  name: string;
  email: string;
  service: string | null;
  budget: string | null;
  message: string;
  source: string;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
};

export type AdminDataResult<T> =
  | { ok: true; data: T; error: null }
  | { ok: false; data: null; error: string };

export type AdminDashboardData = {
  counts: {
    projects: number;
    projectsPublished: number;
    services: number;
    servicesPublished: number;
    posts: number;
    postsPublished: number;
    inquiries: number;
    inquiriesNew: number;
  };
  recentInquiries: Pick<
    AdminInquiry,
    "id" | "name" | "email" | "service" | "status" | "created_at" | "message"
  >[];
};

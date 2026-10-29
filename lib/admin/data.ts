import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { inquiryStatusSchema, uuidSchema } from "@/lib/validation/content";
import { isAdminRole, isAdminStatus } from "@/lib/auth/roles";
import { describeDbError } from "./errors";
import type {
  AdminDashboardData,
  AdminDataResult,
  AdminInquiry,
  AdminPost,
  AdminProject,
  AdminService,
  AdminAuditEntry,
  AdminInviteState,
  AdminTeamData,
} from "./types";

function dbFailure<T>(error: Parameters<typeof describeDbError>[0]) {
  return {
    ok: false,
    data: null,
    error: describeDbError(error),
  } as AdminDataResult<T>;
}

function notConfigured<T>(): AdminDataResult<T> {
  return {
    ok: false,
    data: null,
    error:
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local and restart the server.",
  };
}

export async function listProjects(): Promise<AdminDataResult<AdminProject[]>> {
  if (!hasSupabaseEnv()) {
    return notConfigured();
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return dbFailure(error);
  }

  return { ok: true, data: (data ?? []) as AdminProject[], error: null };
}

export async function getProject(
  id: string
): Promise<AdminDataResult<AdminProject>> {
  if (!hasSupabaseEnv()) {
    return notConfigured();
  }

  if (!uuidSchema.safeParse(id).success) {
    return { ok: false, data: null, error: "Invalid project id." };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return dbFailure(error);
  }

  if (!data) {
    return { ok: false, data: null, error: "Project not found." };
  }

  return { ok: true, data: data as AdminProject, error: null };
}

export async function listServices(): Promise<AdminDataResult<AdminService[]>> {
  if (!hasSupabaseEnv()) {
    return notConfigured();
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return dbFailure(error);
  }

  return { ok: true, data: (data ?? []) as AdminService[], error: null };
}

export async function getService(
  id: string
): Promise<AdminDataResult<AdminService>> {
  if (!hasSupabaseEnv()) {
    return notConfigured();
  }

  if (!uuidSchema.safeParse(id).success) {
    return { ok: false, data: null, error: "Invalid service id." };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return dbFailure(error);
  }

  if (!data) {
    return { ok: false, data: null, error: "Service not found." };
  }

  return { ok: true, data: data as AdminService, error: null };
}

export async function listPosts(): Promise<AdminDataResult<AdminPost[]>> {
  if (!hasSupabaseEnv()) {
    return notConfigured();
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return dbFailure(error);
  }

  return { ok: true, data: (data ?? []) as AdminPost[], error: null };
}

export async function getPost(
  id: string
): Promise<AdminDataResult<AdminPost>> {
  if (!hasSupabaseEnv()) {
    return notConfigured();
  }

  if (!uuidSchema.safeParse(id).success) {
    return { ok: false, data: null, error: "Invalid blog post id." };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return dbFailure(error);
  }

  if (!data) {
    return { ok: false, data: null, error: "Blog post not found." };
  }

  return { ok: true, data: data as AdminPost, error: null };
}

export async function listInquiries(
  status?: string
): Promise<AdminDataResult<AdminInquiry[]>> {
  if (!hasSupabaseEnv()) {
    return notConfigured();
  }

  const supabase = createSupabaseServerClient();
  const parsedStatus = inquiryStatusSchema.safeParse(status);
  let query = supabase.from("inquiries").select("*");

  if (parsedStatus.success) {
    query = query.eq("status", parsedStatus.data);
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) {
    return dbFailure(error);
  }

  return { ok: true, data: (data ?? []) as AdminInquiry[], error: null };
}

export async function getInquiry(
  id: string
): Promise<AdminDataResult<AdminInquiry>> {
  if (!hasSupabaseEnv()) {
    return notConfigured();
  }

  if (!uuidSchema.safeParse(id).success) {
    return { ok: false, data: null, error: "Invalid inquiry id." };
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return dbFailure(error);
  }

  if (!data) {
    return { ok: false, data: null, error: "Inquiry not found." };
  }

  return { ok: true, data: data as AdminInquiry, error: null };
}

function inviteState(row: {
  has_auth_user?: boolean | null;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
}): AdminInviteState {
  if (row.has_auth_user === false) {
    return "unknown";
  }

  if (!row.email_confirmed_at) {
    return "pending";
  }

  return row.last_sign_in_at ? "accepted" : "never_signed_in";
}

/**
 * Team list for the owner-only Team screen. Uses list_admin_team(), which
 * joins Supabase Auth sign-in state on the server side of the database, and
 * falls back to the plain allowlist before the team-access migration exists.
 */
export async function listAdminTeam(): Promise<AdminDataResult<AdminTeamData>> {
  if (!hasSupabaseEnv()) {
    return notConfigured();
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.rpc("list_admin_team");

  if (!error) {
    return {
      ok: true,
      data: {
        accessMigrationApplied: true,
        members: ((data ?? []) as any[]).map((member) => ({
          user_id: member.user_id,
          email: member.email,
          display_name: member.display_name ?? null,
          role: isAdminRole(member.role) ? member.role : "viewer",
          status: isAdminStatus(member.status) ? member.status : "suspended",
          created_at: member.created_at,
          invited_at: member.invited_at ?? member.auth_invited_at ?? null,
          invited_by_email: member.invited_by_email ?? null,
          status_changed_at: member.status_changed_at ?? null,
          last_sign_in_at: member.last_sign_in_at ?? null,
          email_confirmed_at: member.email_confirmed_at ?? null,
          invite_state: inviteState(member),
        })),
      },
      error: null,
    };
  }

  if (error.code !== "PGRST202" && error.code !== "42883") {
    return dbFailure(error);
  }

  const fallback = await supabase
    .from("admin_users")
    .select("user_id, email, role, created_at")
    .order("created_at", { ascending: true });

  if (fallback.error) {
    return dbFailure(fallback.error);
  }

  return {
    ok: true,
    data: {
      accessMigrationApplied: false,
      members: (fallback.data ?? []).map((member) => ({
        user_id: member.user_id,
        email: member.email,
        display_name: null,
        role: isAdminRole(member.role) ? member.role : "viewer",
        status: "active" as const,
        created_at: member.created_at,
        invited_at: null,
        invited_by_email: null,
        status_changed_at: null,
        last_sign_in_at: null,
        email_confirmed_at: null,
        invite_state: "unknown" as const,
      })),
    },
    error: null,
  };
}

export async function listAdminAuditLog(
  limit = 25
): Promise<AdminDataResult<AdminAuditEntry[]>> {
  if (!hasSupabaseEnv()) {
    return notConfigured();
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("admin_audit_log")
    .select("id, actor_email, action, target_email, details, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return dbFailure(error);
  }

  return { ok: true, data: (data ?? []) as AdminAuditEntry[], error: null };
}

export async function getDashboardData(): Promise<
  AdminDataResult<AdminDashboardData>
> {
  if (!hasSupabaseEnv()) {
    return notConfigured();
  }

  const supabase = createSupabaseServerClient();

  const [
    projects,
    projectsPublished,
    services,
    servicesPublished,
    posts,
    postsPublished,
    inquiries,
    inquiriesNew,
    recentInquiries,
  ] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase.from("services").select("id", { count: "exact", head: true }),
    supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase.from("blog_posts").select("id", { count: "exact", head: true }),
    supabase
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase.from("inquiries").select("id", { count: "exact", head: true }),
    supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("inquiries")
      .select("id, name, email, service, status, created_at, message")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const failed = [
    projects.error,
    projectsPublished.error,
    services.error,
    servicesPublished.error,
    posts.error,
    postsPublished.error,
    inquiries.error,
    inquiriesNew.error,
    recentInquiries.error,
  ].find(Boolean);

  if (failed) {
    return dbFailure(failed);
  }

  return {
    ok: true,
    data: {
      counts: {
        projects: projects.count ?? 0,
        projectsPublished: projectsPublished.count ?? 0,
        services: services.count ?? 0,
        servicesPublished: servicesPublished.count ?? 0,
        posts: posts.count ?? 0,
        postsPublished: postsPublished.count ?? 0,
        inquiries: inquiries.count ?? 0,
        inquiriesNew: inquiriesNew.count ?? 0,
      },
      recentInquiries: (recentInquiries.data ?? []) as AdminDashboardData["recentInquiries"],
    },
    error: null,
  };
}

import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { inquiryStatusSchema, uuidSchema } from "@/lib/validation/content";
import { describeDbError } from "./errors";
import type {
  AdminDashboardData,
  AdminDataResult,
  AdminInquiry,
  AdminPost,
  AdminProject,
  AdminService,
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

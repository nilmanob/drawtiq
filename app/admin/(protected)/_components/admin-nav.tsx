"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  hasPermission,
  type AdminPermission,
  type AdminRole,
} from "@/lib/auth/roles";

type IconName =
  | "overview"
  | "analytics"
  | "inbox"
  | "home"
  | "grid"
  | "book"
  | "layers"
  | "info"
  | "tag"
  | "briefcase"
  | "pen"
  | "mail"
  | "folder"
  | "quote"
  | "users"
  | "list"
  | "shield"
  | "user"
  | "settings";

// 16px stroke icons drawn on a 24px grid, so they inherit the link colour.
const ICON_PATHS: Record<IconName, string> = {
  overview: "M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z",
  analytics: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  inbox: "M3 13h5l2 3h4l2-3h5M5 5h14l2 8v6H3v-6z",
  home: "M3 11l9-7 9 7M5 10v10h14V10",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  book: "M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 21V5",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5",
  info: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v5M12 8h.01",
  tag: "M3 12V3h9l9 9-9 9zM7.5 7.5h.01",
  briefcase: "M3 8h18v12H3zM8 8V5h8v3M3 13h18",
  pen: "M4 20h4L19 9l-4-4L4 16zM14 6l4 4",
  mail: "M3 5h18v14H3zM3 6l9 7 9-7",
  folder: "M3 6h6l2 2h10v11H3z",
  quote: "M7 7h4v4c0 3-2 5-4 6M15 7h4v4c0 3-2 5-4 6",
  users: "M9 11a4 4 0 100-8 4 4 0 000 8zM2 21c0-4 3-6 7-6s7 2 7 6M17 3a4 4 0 010 8M22 21c0-3-2-5-4-6",
  list: "M9 6h12M9 12h12M9 18h12M4 6h.01M4 12h.01M4 18h.01",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c0-4 4-6 8-6s8 2 8 6",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zM19 12l2-1-1-3-2 .2-1.5-1.5L16.7 4l-3-1-1 2h-1.4l-1-2-3 1 .2 2.7L6 8.2 4 8l-1 3 2 1v1.4l-2 1 1 3 2-.2 1.5 1.5L7.3 20l3 1 1-2h1.4l1 2 3-1-.2-2.7 1.5-1.5 2 .2 1-3-2-1z",
};

function NavIcon({ name }: { name: IconName }) {
  return (
    <svg
      className="admin-nav-icon"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

type NavLink = {
  href: string;
  label: string;
  icon: IconName;
  permission?: AdminPermission;
  /** Extra path prefixes that should highlight this link. */
  matches?: string[];
  exact?: boolean;
};

type NavGroup = {
  id: string;
  label: string;
  links: NavLink[];
};

const SETTINGS_PATHS = [
  "/admin/cms/global_settings",
  "/admin/cms/nav_items",
  "/admin/cms/footer_links",
  "/admin/cms/footer_social",
];

const navGroups: NavGroup[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    links: [
      { href: "/admin", label: "Overview", icon: "overview", exact: true },
      { href: "/admin/analytics/visitors", label: "Analytics", icon: "analytics" },
      { href: "/admin/inquiries", label: "Inquiries", icon: "inbox" },
    ],
  },
  {
    id: "pages",
    label: "Website pages",
    links: [
      { href: "/admin/pages/homepage", label: "Homepage", icon: "home", permission: "content:write" },
      { href: "/admin/pages/work", label: "Work / Portfolio", icon: "grid", permission: "content:write" },
      { href: "/admin/pages/case-studies", label: "Case Studies", icon: "book", permission: "content:write" },
      { href: "/admin/pages/services", label: "Services", icon: "layers", permission: "content:write" },
      { href: "/admin/pages/about", label: "About", icon: "info", permission: "content:write" },
      { href: "/admin/pages/pricing", label: "Pricing", icon: "tag", permission: "content:write" },
      { href: "/admin/pages/careers", label: "Careers", icon: "briefcase", permission: "content:write" },
      { href: "/admin/pages/insights", label: "Insights / Blog", icon: "pen", permission: "content:write" },
      { href: "/admin/pages/contact", label: "Contact", icon: "mail", permission: "content:write" },
    ],
  },
  {
    id: "content",
    label: "Content",
    links: [
      { href: "/admin/projects", label: "Projects", icon: "folder", permission: "content:write" },
      { href: "/admin/services", label: "Services", icon: "layers", permission: "content:write" },
      { href: "/admin/posts", label: "Blog posts", icon: "pen", permission: "content:write" },
      { href: "/admin/cms/testimonials", label: "Testimonials", icon: "quote", permission: "content:write" },
      { href: "/admin/cms/team_members", label: "Public team", icon: "users", permission: "content:write" },
      { href: "/admin/cms", label: "All collections", icon: "list", permission: "content:write", exact: true },
    ],
  },
  {
    id: "access",
    label: "Team & access",
    links: [
      { href: "/admin/team", label: "Team members", icon: "shield", permission: "users:manage" },
      { href: "/admin/account", label: "My account", icon: "user" },
    ],
  },
  {
    id: "settings",
    label: "Site settings",
    links: [
      {
        href: "/admin/settings",
        label: "General & navigation",
        icon: "settings",
        permission: "settings:write",
        matches: SETTINGS_PATHS,
      },
    ],
  },
];

const ALL_LINKS = navGroups.flatMap((group) => group.links);

function matchesPath(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Pick exactly one active link: a record opened from a page editor
 * (?return=/admin/pages/x) highlights that page, otherwise the longest
 * matching prefix wins, and any other CMS record falls back to All collections.
 */
function activeHref(pathname: string, returnTo: string | null) {
  const target =
    returnTo && pathname.startsWith("/admin/cms/") && returnTo.startsWith("/admin/")
      ? returnTo
      : pathname;

  let best: { href: string; length: number } | null = null;
  for (const link of ALL_LINKS) {
    const candidates = link.exact ? [] : [link.href, ...(link.matches ?? [])];
    if (link.exact && target === link.href) {
      return link.href;
    }
    for (const prefix of candidates) {
      if (matchesPath(target, prefix) && (!best || prefix.length > best.length)) {
        best = { href: link.href, length: prefix.length };
      }
    }
  }

  if (!best && target.startsWith("/admin/cms/")) {
    return "/admin/cms";
  }

  return best?.href ?? null;
}

const STORAGE_KEY = "drawtiq-admin-nav-collapsed";

function readCollapsed(): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function AdminNav({ role }: { role: AdminRole }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = activeHref(pathname, searchParams.get("return"));
  const [collapsed, setCollapsed] = useState<string[]>([]);

  useEffect(() => {
    setCollapsed(readCollapsed());
  }, []);

  function toggle(id: string) {
    setCollapsed((previous) => {
      const next = previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Collapsing still works for this visit without storage.
      }
      return next;
    });
  }

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      links: group.links.filter(
        (link) => !link.permission || hasPermission(role, link.permission)
      ),
    }))
    .filter((group) => group.links.length > 0);

  return (
    <nav className="admin-nav" aria-label="Admin navigation">
      {visibleGroups.map((group) => {
        const containsActive = group.links.some((link) => link.href === current);
        // The group holding the current page always stays open.
        const open = containsActive || !collapsed.includes(group.id);
        const listId = `admin-nav-${group.id}`;

        return (
          <div className="admin-nav-group" key={group.id}>
            <button
              className="admin-nav-heading"
              type="button"
              aria-expanded={open}
              aria-controls={listId}
              onClick={() => toggle(group.id)}
              disabled={containsActive}
            >
              {group.label}
              <span className="admin-nav-chevron" aria-hidden="true">
                {open ? "−" : "+"}
              </span>
            </button>
            <div className="admin-nav-links" id={listId} hidden={!open}>
              {group.links.map((link) => {
                const active = link.href === current;

                return (
                  <Link
                    key={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`admin-nav-link${active ? " is-active" : ""}`}
                    href={link.href}
                  >
                    <NavIcon name={link.icon} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

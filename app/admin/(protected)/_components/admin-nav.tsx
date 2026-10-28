"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  hasPermission,
  type AdminPermission,
  type AdminRole,
} from "@/lib/auth/roles";

type NavLink = {
  href: string;
  label: string;
  exact?: boolean;
  permission?: AdminPermission;
};

type NavGroup = {
  label: string;
  links: NavLink[];
};

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    links: [
      { href: "/admin", label: "Dashboard", exact: true },
      { href: "/admin/analytics/visitors", label: "Visitors" },
    ],
  },
  {
    label: "Main pages",
    links: [
      { href: "/admin/inquiries", label: "Inquiries" },
      {
        href: "/admin/projects",
        label: "Projects",
        permission: "content:write",
      },
      {
        href: "/admin/services",
        label: "Services",
        permission: "content:write",
      },
      {
        href: "/admin/posts",
        label: "Blog posts",
        permission: "content:write",
      },
      {
        href: "/admin/cms",
        label: "Site CMS",
        permission: "content:write",
      },
    ],
  },
  {
    label: "Account",
    links: [
      {
        href: "/admin/team",
        label: "Team",
        permission: "users:manage",
      },
    ],
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ role }: { role: AdminRole }) {
  const pathname = usePathname();
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
      {visibleGroups.map((group) => (
        <div className="admin-nav-group" key={group.label}>
          <p className="admin-nav-heading">{group.label}</p>
          {group.links.map((link) => {
            const active = isActive(pathname, link.href, link.exact);

            return (
              <Link
                key={link.href}
                aria-current={active ? "page" : undefined}
                className={`admin-nav-link${active ? " is-active" : ""}`}
                href={link.href}
              >
                <span className="admin-nav-dot" aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

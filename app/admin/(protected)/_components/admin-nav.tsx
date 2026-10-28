"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/posts", label: "Blog posts" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/cms", label: "Site CMS" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="Admin navigation">
      {links.map((link) => {
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
    </nav>
  );
}

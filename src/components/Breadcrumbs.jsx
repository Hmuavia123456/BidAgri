"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = (pathname || "/")
    .split("/")
    .filter(Boolean);

  const crumbs = [];
  let href = "";
  for (let i = 0; i < segments.length; i++) {
    href += `/${segments[i]}`;
    crumbs.push({ label: decodeURIComponent(segments[i]), href });
  }

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--muted)]">
        <li>
          <Link
            href="/"
            className="inline-flex items-center rounded px-1.5 py-0.5 hover:text-[color:var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
            prefetch
          >
            Home
          </Link>
        </li>
        {crumbs.map((crumb, idx) => (
          <li key={crumb.href} className="flex items-center gap-2">
            <span aria-hidden className="text-[color:var(--accent)]">/</span>
            {idx < crumbs.length - 1 ? (
              <Link
                href={crumb.href}
                className="inline-flex items-center rounded px-1.5 py-0.5 hover:text-[color:var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)]"
                prefetch
              >
                {toTitle(crumb.label)}
              </Link>
            ) : (
              <span
                aria-current="page"
                className="inline-flex items-center rounded px-1.5 py-0.5 font-semibold text-[color:var(--primary)]"
              >
                {toTitle(crumb.label)}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function toTitle(str) {
  return String(str)
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

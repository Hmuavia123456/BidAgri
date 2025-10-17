"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/farmers", label: "Farmers" },
  { href: "/buyers", label: "Buyers" },
  { href: "/checkout", label: "Checkout" },
  { href: "/contact", label: "Contact" },
  { href: "/auth/login", label: "Login" },
  { href: "/buyers#register", label: "Register" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href) => (href === "/" ? pathname === href : pathname?.startsWith(href));

  // Removed reduce motion toggle and storage. Animations now respect OS-level preferences only.

  return (
    <header className="w-full fixed top-0 z-[60] bg-white/80 backdrop-blur shadow-none supports-[backdrop-filter]:bg-white/80">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 font-sans sm:px-6" role="navigation" aria-label="Primary">
        <Link
          href="/"
          className="inline-flex items-center text-2xl font-bold tracking-tight text-[color:var(--leaf)] drop-shadow-sm"
        >
          BidAgri
        </Link>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-[color:var(--muted)] transition-colors duration-200 hover:text-[color:var(--leaf)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)] focus:ring-offset-2 lg:hidden"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          onClick={() => setIsOpen((value) => !value)}
        >
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={
                isOpen
                  ? "M6 18 18 6M6 6l12 12"
                  : "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              }
            />
          </svg>
        </button>

        <div className="hidden items-center space-x-6 md:space-x-10 lg:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`border-b-2 pb-1 text-sm font-semibold transition-colors duration-300 ease-in-out hover:text-[color:var(--leaf)] ${
                isActive(href)
                  ? "border-[color:var(--leaf)] text-[color:var(--foreground)]"
                  : "border-transparent text-[color:var(--foreground)]"
              }`}
            >
              {label}
            </Link>
          ))}
          {/* Reduce motion toggle removed */}
        </div>
      </nav>

      <div
        id="mobile-nav"
        className={`lg:hidden overflow-hidden bg-white/90 backdrop-blur shadow-sm transition-all duration-200 ease-out ${
          isOpen
            ? "border-t border-[color:var(--accent)]/30 max-h-64 opacity-100"
            : "border-t-0 pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-2 px-4 py-3 sm:px-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block rounded-md px-3 py-2 text-base font-medium transition-colors duration-300 ease-in-out border-b-2 ${
                isActive(href)
                  ? "border-[color:var(--leaf)] text-[color:var(--foreground)]"
                  : "border-transparent text-[color:var(--foreground)] hover:text-[color:var(--leaf)]"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {label}
            </Link>
          ))}
          {/* Reduce motion toggle removed from mobile menu */}
        </div>
      </div>
      {/* Removed notifications panel */}
    </header>
  );
}

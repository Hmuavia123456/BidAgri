"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "BidAgri" },
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

  return (
    <header className="relative z-[60]" aria-label="Site navigation">
      <nav
        role="navigation"
        aria-label="Primary"
        className="fixed top-0 left-1/2 z-[60] flex w-[95%] max-w-6xl -translate-x-1/2 items-center justify-between gap-4 rounded-full border border-accent/40 bg-base px-5 py-2 text-primary shadow-lg shadow-primary/20 backdrop-blur-md transition-all duration-300 hover:shadow-primary/30"
      >
        <Link
          href="/"
          className="group inline-flex items-center gap-3 rounded-full px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-base"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-semibold text-white shadow-md shadow-primary/30 transition-transform duration-300 group-hover:scale-105">
            <span aria-hidden="true">B</span>
            <span className="sr-only">BidAgri home</span>
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div className="flex items-center gap-6">
            {navItems.map(({ href, label }) => (
              <Link
                key={`${href}-${label}`}
                href={href}
                className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-base ${
                  isActive(href)
                    ? "font-semibold text-secondary"
                    : "hover:text-secondary"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden whitespace-nowrap rounded-full bg-accent/30 px-4 py-2 text-sm font-medium text-primary shadow-sm ring-1 ring-accent/50 sm:inline-flex">
            info@bidagri.com
          </span>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/60 bg-base text-primary shadow-sm transition-colors duration-200 hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-base lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            onClick={() => setIsOpen((value) => !value)}
          >
            <svg
              className="h-5 w-5"
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
        </div>

        <div
          id="mobile-nav"
          className={`absolute left-1/2 top-[calc(100%+0.75rem)] z-10 w-full -translate-x-1/2 overflow-hidden rounded-3xl border border-accent/40 bg-base shadow-xl shadow-primary/20 backdrop-blur-md transition-all duration-300 ease-out lg:hidden ${
            isOpen
              ? "pointer-events-auto max-h-[28rem] opacity-100"
              : "pointer-events-none max-h-0 opacity-0"
          }`}
        >
          <div className="space-y-2 px-5 py-5">
            {navItems.map(({ href, label }) => (
              <Link
                key={`mobile-${href}-${label}`}
                href={href}
                className={`flex items-center justify-between rounded-full px-5 py-3 text-sm text-primary transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-base ${
                  isActive(href)
                    ? "font-semibold text-secondary"
                    : "hover:text-secondary"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {label}
                <svg
                  className="h-4 w-4 text-current opacity-60"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5 15.75 12l-7.5 7.5" />
                </svg>
              </Link>
            ))}

            <span className="inline-flex w-full items-center justify-center rounded-full bg-accent/30 px-4 py-3 text-sm font-medium text-primary shadow-sm ring-1 ring-accent/50">
              info@bidagri.com
            </span>
          </div>
        </div>
      </nav>
    </header>
  );
}

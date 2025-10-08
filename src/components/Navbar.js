"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/farmers", label: "Farmers" },
  { href: "/buyers", label: "Buyers" },
  { href: "/contact", label: "Contact" },
  { href: "/auth/login", label: "Login" },
  { href: "/auth/signup", label: "Sign Up" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href) => (href === "/" ? pathname === href : pathname?.startsWith(href));

  return (
    <header className="w-full fixed top-0 z-50 bg-white shadow-md">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 font-sans sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center text-2xl font-bold tracking-tight text-[#16A34A]"
        >
          BidAgri
        </Link>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 transition-colors duration-200 hover:text-[#16A34A] focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:ring-offset-2 lg:hidden"
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
              className={`border-b-2 pb-1 text-sm font-semibold transition-colors duration-300 hover:text-green-600 ${
                isActive(href)
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-700"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <div
        id="mobile-nav"
        className={`lg:hidden overflow-hidden border-t border-gray-100 bg-white shadow-sm transition-all duration-200 ease-out ${
          isOpen
            ? "max-h-64 opacity-100"
            : "pointer-events-none max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-2 px-4 py-3 sm:px-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`block rounded-md px-3 py-2 text-base font-medium transition-colors duration-300 border-b-2 ${
                isActive(href)
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-700 hover:text-green-600"
              }`}
              onClick={() => setIsOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

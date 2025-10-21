"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/farmers", label: "Farmers" },
  { href: "/buyers", label: "Buyers" },
  { href: "/checkout", label: "Checkout" },
  { href: "/contact", label: "Contact" },
  { href: "/register", label: "Register" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);
  const pathname = usePathname();

  const isActive = (href) => (href === "/" ? pathname === href : pathname?.startsWith(href));

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === "undefined" || tickingRef.current) return;
      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const shouldElevate = currentY > 24 || pathname !== "/";
        setIsScrolled(shouldElevate);

        const isScrollingDown = currentY > lastScrollYRef.current + 4;
        const isScrollingUp = currentY < lastScrollYRef.current - 4;

        if (currentY < 10) {
          setIsHidden(false);
        } else if (isScrollingDown) {
          setIsHidden(true);
        } else if (isScrollingUp) {
          setIsHidden(false);
        }

        lastScrollYRef.current = currentY;
        tickingRef.current = false;
      });
      tickingRef.current = true;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const navClassName = [
    "relative z-[61] mx-auto flex w-[95%] max-w-6xl items-center justify-between gap-4 rounded-full border px-5 py-2 transition-all duration-300 backdrop-blur-md",
    isScrolled
      ? "border-accent/40 bg-base text-primary shadow-lg shadow-primary/20 hover:shadow-primary/30"
      : "border-white/20 bg-transparent text-white shadow-none hover:shadow-none",
  ].join(" ");

  const linkHoverUnderline =
    "relative overflow-visible after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:rounded-full after:bg-current after:transition-all after:duration-300 after:ease-out hover:after:w-full";
  const linkTextClass = isScrolled
    ? `text-primary hover:text-secondary ${linkHoverUnderline}`
    : `text-white hover:text-white/80 ${linkHoverUnderline}`;
  const brandFocusOffsetClass = isScrolled
    ? "focus-visible:ring-offset-base"
    : "focus-visible:ring-offset-transparent";
  const toggleButtonClass = [
    "inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2",
    isScrolled
      ? "border-accent/60 bg-base text-primary shadow-sm hover:text-secondary focus-visible:ring-offset-base"
      : "border-white/30 bg-black/20 text-white backdrop-blur hover:text-white focus-visible:ring-offset-transparent",
  ].join(" ");
  const linkFocusOffsetClass = isScrolled
    ? "focus-visible:ring-offset-base"
    : "focus-visible:ring-offset-transparent";

  const visibilityClasses = isHidden ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100";

  return (
    <header
      className={`fixed top-0 left-0 z-[60] w-screen bg-transparent transition-transform duration-300 ease-out ${visibilityClasses}`}
      aria-label="Site navigation"
    >
      <div className="relative w-full overflow-x-hidden">
        <nav role="navigation" aria-label="Primary" className={navClassName}>
          <Link
            href="/"
            className={`group inline-flex items-center gap-3 rounded-full px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 ${brandFocusOffsetClass}`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-semibold text-white shadow-md shadow-primary/30 transition-transform duration-300 group-hover:scale-105">
              <span aria-hidden="true">B</span>
              <span className="sr-only">BidAgri home</span>
            </span>
          </Link>

          <div className="hidden flex-1 items-center justify-center lg:flex">
            <div className="flex items-center gap-6">
              {navItems.map(({ href, label }) => {
                const isLinkActive = isActive(href);
                const linkClass = isLinkActive
                  ? isScrolled
                    ? `font-semibold text-secondary hover:text-secondary ${linkHoverUnderline} after:w-full`
                    : `font-semibold text-white hover:text-white ${linkHoverUnderline} after:w-full`
                  : linkTextClass;

                return (
                  <Link
                    key={`${href}-${label}`}
                    href={href}
                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 ${linkFocusOffsetClass} ${linkClass}`}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className={`${toggleButtonClass} lg:hidden`}
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
        </nav>

      </div>

      {hasMounted && (
        <div
          id="mobile-nav"
          className={`md:hidden fixed inset-x-0 top-[76px] z-[59] px-4 pb-6 transition-all duration-300 ease-out ${
            hasMounted && isOpen ? "pointer-events-auto opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-3"
          }`}
        aria-hidden={!(hasMounted && isOpen)}
      >
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 rounded-3xl border border-accent/30 bg-base/95 px-6 py-6 text-primary shadow-xl shadow-primary/20 backdrop-blur supports-[backdrop-filter]:bg-base/90 max-h-[calc(100vh-96px)] overflow-y-auto">
            {navItems.map(({ href, label }) => (
              <Link
                key={`mobile-${href}-${label}`}
                href={href}
                className="w-full rounded-full px-5 py-3 text-center text-sm font-semibold transition-colors duration-200 hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-base"
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            ))}

            <span className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-accent/30 px-4 py-3 text-sm font-medium text-primary shadow-sm ring-1 ring-accent/50">
              info@bidagri.com
            </span>
          </div>
        </div>
      )}
    </header>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/userProfile";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/farmers", label: "Farmers" },
  { href: "/buyers", label: "Buyers" },
  { href: "/checkout", label: "Checkout" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState("buyer");
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);
  const mobileNavRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const pathname = usePathname();

  const isActive = (href) => (href === "/" ? pathname === href : pathname?.startsWith(href));

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        (async () => {
          const storedRole =
            (typeof window !== "undefined" && window.localStorage.getItem("bidagri:role")) || null;
          const profile = await getUserProfile(firebaseUser.uid).catch(() => null);
          const resolvedRole =
            profile?.role || storedRole || (firebaseUser.email?.endsWith("@bidagri.com") ? "admin" : "buyer");
          setUserRole(resolvedRole);
          if (typeof window !== "undefined") {
            window.localStorage.setItem("bidagri:role", resolvedRole);
          }
        })();
      } else {
        setUserRole("buyer");
      }
    });
    return () => unsubscribe();
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

  useEffect(() => {
    const node = mobileNavRef.current;
    if (!node) return;
    if (isOpen) {
      node.removeAttribute("inert");
    } else {
      node.setAttribute("inert", "");
      returnFocusToToggle();
    }
  }, [isOpen]);

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
  const filteredNavItems = user
    ? navItems
    : [...navItems, { href: "/register", label: "Register" }];

  const workspaceHref =
    userRole === "admin"
      ? "/admin/dashboard"
      : userRole === "buyer"
      ? "/buyers/dashboard"
      : "/farmers/dashboard";

  const returnFocusToToggle = () => {
    if (typeof document === "undefined") return;
    const active = document.activeElement;
    if (mobileNavRef.current?.contains(active)) {
      toggleButtonRef.current?.focus();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("bidagri:role");
      }
      setUserRole("buyer");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

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

          {hasMounted && (
            <div className="hidden flex-1 items-center justify-center lg:flex">
              <div className="flex items-center gap-6">
                {filteredNavItems.map(({ href, label }) => {
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
          )}

          <div className="flex items-center gap-3">
            {hasMounted && (
              <div className="hidden items-center gap-2 lg:flex">
                {user ? (
                  <>
                    <Link
                      href={workspaceHref}
                      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
                        isScrolled
                          ? "bg-[rgba(var(--leaf-rgb),0.12)] text-[color:var(--leaf)] hover:bg-[rgba(var(--leaf-rgb),0.18)]"
                          : "bg-white/20 text-white hover:bg-white/30"
                      }`}
                    >
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
                        isScrolled
                          ? "border border-[rgba(var(--leaf-rgb),0.25)] text-[color:var(--leaf)] hover:text-[color:var(--secondary)]"
                          : "border border-white/40 text-white hover:text-white/80"
                      }`}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
                        isScrolled
                          ? "bg-[color:var(--leaf)] text-white shadow-md shadow-[rgba(var(--leaf-rgb),0.24)] hover:bg-[color:var(--secondary)]"
                          : "bg-white/20 text-white hover:bg-white/30"
                      }`}
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
                        isScrolled
                          ? "border border-[rgba(var(--leaf-rgb),0.25)] text-[color:var(--leaf)] hover:text-[color:var(--secondary)]"
                          : "border border-white/40 text-white hover:text-white/80"
                      }`}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            )}
            <button
              type="button"
              className={`${toggleButtonClass} lg:hidden`}
              aria-label="Toggle navigation"
              aria-expanded={isOpen}
              aria-controls="mobile-nav"
              ref={toggleButtonRef}
              onClick={() =>
                setIsOpen((value) => {
                  if (value) {
                    returnFocusToToggle();
                  }
                  return !value;
                })
              }
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
        ref={mobileNavRef}
      >
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 rounded-3xl border border-accent/30 bg-base/95 px-6 py-6 text-primary shadow-xl shadow-primary/20 backdrop-blur supports-[backdrop-filter]:bg-base/90 max-h-[calc(100vh-96px)] overflow-y-auto">
            {filteredNavItems.map(({ href, label }) => (
              <Link
                key={`mobile-${href}-${label}`}
                href={href}
                className="w-full rounded-full px-5 py-3 text-center text-sm font-semibold transition-colors duration-200 hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-base"
                onClick={() => {
                  returnFocusToToggle();
                  setIsOpen(false);
                }}
              >
                {label}
              </Link>
            ))}

            <span className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-accent/30 px-4 py-3 text-sm font-medium text-primary shadow-sm ring-1 ring-accent/50">
              info@bidagri.com
            </span>
            {user ? (
              <div className="flex w-full flex-col gap-2 pt-3">
                <Link
                  href={workspaceHref}
                  onClick={() => setIsOpen(false)}
                  className="w-full rounded-full bg-[color:var(--leaf)] px-5 py-3 text-center text-sm font-semibold text-white shadow-md shadow-[rgba(var(--leaf-rgb),0.24)] transition hover:bg-[color:var(--secondary)]"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    handleSignOut();
                    returnFocusToToggle();
                    setIsOpen(false);
                  }}
                  className="w-full rounded-full border border-[rgba(var(--leaf-rgb),0.3)] px-5 py-3 text-center text-sm font-semibold text-[color:var(--leaf)] transition hover:text-[color:var(--secondary)]"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-2 pt-3">
                <Link
                  href="/auth/login"
                  onClick={() => {
                    returnFocusToToggle();
                    setIsOpen(false);
                  }}
                  className="w-full rounded-full bg-[color:var(--leaf)] px-5 py-3 text-center text-sm font-semibold text-white shadow-md shadow-[rgba(var(--leaf-rgb),0.24)] transition hover:bg-[color:var(--secondary)]"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => {
                    returnFocusToToggle();
                    setIsOpen(false);
                  }}
                  className="w-full rounded-full border border-[rgba(var(--leaf-rgb),0.3)] px-5 py-3 text-center text-sm font-semibold text-[color:var(--leaf)] transition hover:text-[color:var(--secondary)]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

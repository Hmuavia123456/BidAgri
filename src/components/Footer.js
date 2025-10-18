"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Facebook, Instagram, Linkedin } from "lucide-react";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/bidagri",
    Icon: Facebook,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/bidagri",
    Icon: Instagram,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/bidagri",
    Icon: Linkedin,
  },
];

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Farmers", href: "/farmers" },
  { label: "Buyers", href: "/buyers" },
  { label: "Products", href: "/products" },
  { label: "Checkout", href: "/checkout" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  const footerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = footerRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  const reveal = isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6";

  return (
    <footer
      ref={footerRef}
      className="relative isolate overflow-hidden px-6 py-16 text-light transition-all duration-700 ease-out md:px-20"
      style={{
        backgroundImage: "url('/images/farming-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 -z-30 bg-dark/90 backdrop-blur-md" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-gradient-to-t from-dark/95 via-dark/80 to-dark/40"
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12 rounded-3xl border border-accent/40 bg-dark/70 px-8 py-10 text-light backdrop-blur-md shadow-xl shadow-dark/50 sm:px-10 md:px-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div
            className={`space-y-5 transition-all duration-700 ${reveal}`}
            style={{ transitionDelay: "0.1s" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl font-extrabold tracking-wide text-white drop-shadow-[0_0_12px_rgba(0,179,134,0.45)]">
                BidAgri
              </span>
              <span aria-hidden className="text-2xl">🌿</span>
            </div>
            <p className="max-w-sm text-base text-light/80">
              Empowering farmers through transparent, climate-smart trade connections.
            </p>
          </div>

          <div
            className={`space-y-5 transition-all duration-700 ${reveal}`}
            style={{ transitionDelay: "0.25s" }}
          >
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 text-light/80 transition-colors duration-200 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base"
                  >
                    <span aria-hidden className="text-xl">›</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`space-y-5 transition-all duration-700 ${reveal}`}
            style={{ transitionDelay: "0.4s" }}
          >
            <h3 className="text-lg font-semibold text-white">Stay Connected</h3>
            <p className="text-sm text-light/80">
              Follow BidAgri for stories from the fields, pricing trends, and market insights.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map(({ name, href, Icon }) => (
                <Link
                  key={name}
                  href={href}
                  aria-label={name}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-accent/50 text-accent transition-colors duration-200 hover:bg-accent/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`h-px w-full bg-light/30 transition-opacity duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "0.55s" }}
        />

        <div
          className={`text-center text-sm text-light/80 transition-all duration-700 ${reveal}`}
          style={{ transitionDelay: "0.65s" }}
        >
          © 2025 BidAgri — Connecting Farmers & Buyers Globally
        </div>
      </div>
    </footer>
  );
}

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
  { label: "Contact", href: "/contact" },
];

const sparklePositions = [
  { top: "10%", left: "15%", size: "12px", delay: "0s" },
  { top: "30%", left: "70%", size: "10px", delay: "1.5s" },
  { top: "65%", left: "25%", size: "14px", delay: "1s" },
  { top: "50%", left: "85%", size: "8px", delay: "2.5s" },
  { top: "80%", left: "40%", size: "9px", delay: "0.75s" },
  { top: "20%", left: "90%", size: "11px", delay: "2s" },
];

export default function Footer() {
  const footerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-up animation once the footer is scrolled into view.
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

  return (
    <footer
      ref={footerRef}
      className={`relative overflow-hidden bg-gradient-to-br from-[#14532D] to-[#1B4332] px-10 py-16 text-[#F1F5F9] transition-all duration-700 ease-out md:px-20 ${
        isVisible ? "opacity-100 translate-y-0" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.15),_transparent_55%)]"></div>
        {sparklePositions.map(({ top, left, size, delay }, index) => (
          <span
            key={`sparkle-${index}`}
            className="sparkle"
            style={{ top, left, width: size, height: size, animationDelay: delay }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div
            className={`space-y-4 transition-all duration-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "0.1s" }}
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl font-extrabold tracking-wide text-white drop-shadow-[0_0_12px_rgba(34,197,94,0.75)]">
                BidAgri
              </span>
              <span className="leaf" aria-hidden="true">
                🌿
              </span>
            </div>
            <p className="max-w-sm text-base text-[#E2E8F0]">
              Empowering Farmers Through Digital Connections.
            </p>
          </div>

          <div
            className={`transition-all duration-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "0.25s" }}
          >
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="footer-link">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`transition-all duration-700 ${
              isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "0.4s" }}
          >
            <h3 className="text-lg font-semibold text-white">Stay Connected</h3>
            <div className="mt-5 flex items-center gap-4">
              {socialLinks.map(({ name, href, Icon }) => (
                <Link
                  key={name}
                  href={href}
                  aria-label={name}
                  className="social-icon"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`h-px w-full bg-[#22C55E] shadow-[0_0_12px_2px_rgba(34,197,94,0.6)] transition-all duration-700 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: "0.6s" }}
        />

        <div
          className={`text-center text-sm text-[#F1F5F9] transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: "0.75s" }}
        >
          © 2025 BidAgri. All rights reserved.
        </div>
      </div>

      <style jsx>{`
        .leaf {
          display: inline-flex;
          font-size: 1.8rem;
          filter: drop-shadow(0 0 10px rgba(34, 197, 94, 0.7));
          animation: leafFloat 5s ease-in-out infinite;
        }

        .footer-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          color: #ffffff;
          font-weight: 500;
          transition: transform 0.3s ease, color 0.3s ease;
        }

        .footer-link::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -4px;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, rgba(34, 197, 94, 0.9), transparent 65%);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }

        .footer-link:hover {
          color: #bbf7d0;
          transform: scale(1.05);
        }

        .footer-link:hover::after {
          transform: scaleX(1);
        }

        .social-icon {
          position: relative;
          display: inline-flex;
          height: 44px;
          width: 44px;
          justify-content: center;
          align-items: center;
          border-radius: 9999px;
          border: 2px solid rgba(255, 255, 255, 0.8);
          color: #ffffff;
          transition: transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease;
        }

        .social-icon:hover {
          transform: scale(1.12) rotate(-4deg);
          border-color: #22c55e;
          box-shadow: 0 0 18px rgba(34, 197, 94, 0.45);
          color: #bbf7d0;
        }

        .sparkle {
          position: absolute;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(226, 252, 214, 0.95), rgba(34, 197, 94, 0));
          opacity: 0;
          animation: sparkle 6s ease-in-out infinite;
        }

        @keyframes leafFloat {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(-4deg);
          }
        }

        @keyframes sparkle {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(0px);
          }
          40% {
            opacity: 0.6;
            transform: scale(1) translateY(-8px);
          }
          70% {
            opacity: 0.4;
            transform: scale(1.1) translateY(-14px);
          }
          100% {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
        }
      `}</style>
    </footer>
  );
}

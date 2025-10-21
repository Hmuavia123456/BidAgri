"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getCategories } from "@/data/categoryUtils";
import Image from "next/image";
import ImageWithFallback from "@/components/ImageWithFallback";
import HeroSection from "@/components/HeroSection";

export default function Home() {
  const categories = [
    {
      title: "Grains",
      description: "Sun-ripened grains with rich soil-grown flavor.",
      image:
        "https://unsplash.com/photos/gB6VQRzgess/download?force=true&w=1170",
    },
    {
      title: "Nuts",
      description: "Crunchy, nutrient-dense nuts roasted on the farm.",
      image:
        "https://images.unsplash.com/photo-1620619795058-8388436cc01c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Fruits",
      description: "Handpicked orchard fruits at the peak of sweetness.",
      image:
        "https://images.unsplash.com/photo-1732155512296-58a6d9d96bcd?q=80&w=1175&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
      title: "Vegetables",
      description: "Vibrant seasonal vegetables harvested at dawn.",
      image:
        "https://images.unsplash.com/photo-1695518044965-cd9596daebf0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
  ];

  const highlightColumns = [
    {
      eyebrow: "For Farmers",
      title: "Sell harvests on your terms.",
      description:
        "Launch transparent auctions, reach vetted buyers in minutes, and stay in control of pricing from the field to final bid.",
      bullets: [
        "Set reserve prices with confidence",
        "Receive payments directly and securely",
        "Build lasting buyer relationships",
      ],
    },
    {
      eyebrow: "For Buyers",
      title: "Source quality with certainty.",
      description:
        "Discover traceable lots, verify quality in real time, and partner with growers who value honesty as much as you do.",
      bullets: [
        "Instant access to verified produce",
        "Competitive bidding with live updates",
        "Streamlined inspections and logistics",
      ],
    },
  ];

  const quickStats = [
    { label: "Lots matched", value: "2,300+" },
    { label: "Buyer satisfaction", value: "97%" },
    { label: "Average payment time", value: "48 hrs" },
    { label: "Active regions", value: "12" },
  ];

  const quickLinks = getCategories()
    .slice(0, 4)
    .flatMap((cat) =>
      (cat.subcategories || [])
        .slice(0, 2)
        .map((sub) => ({
          href: `/products/${cat.slug}/${sub.slug}`,
          label: `${cat.name}: ${sub.name}`,
        }))
    );

  const gridRef = useRef(null);
  const ctaRef = useRef(null);
  const [gridVisible, setGridVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  useEffect(() => {
    const main = document.getElementById("main-content");
    if (!main) return undefined;

    const previousPaddingTop = main.style.paddingTop;
    const previousScrollPaddingTop = main.style.scrollPaddingTop;

    main.style.paddingTop = "0";
    main.style.scrollPaddingTop = "0";

    return () => {
      if (previousPaddingTop) {
        main.style.paddingTop = previousPaddingTop;
      } else {
        main.style.removeProperty("padding-top");
      }

      if (previousScrollPaddingTop) {
        main.style.scrollPaddingTop = previousScrollPaddingTop;
      } else {
        main.style.removeProperty("scroll-padding-top");
      }
    };
  }, []);

  useEffect(() => {
    const node = gridRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setGridVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const node = ctaRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCtaVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white text-[color:var(--foreground)]">
      <HeroSection />

      <section
        id="products"
        className="relative isolate w-full px-4 pb-24 pt-16 text-[color:var(--foreground)] sm:px-6 lg:px-8 lg:pt-24"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-[rgba(var(--leaf-rgb),0.08)] via-transparent to-[rgba(var(--accent-rgb),0.14)]"
          aria-hidden="true"
        />

        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div className="relative overflow-hidden rounded-3xl border border-[rgba(var(--leaf-rgb),0.15)] bg-white shadow-xl shadow-[rgba(var(--leaf-rgb),0.12)]">
            <Image
              src="https://images.unsplash.com/photo-1621788240870-ecd5a58ac8e3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=960"
              alt="Farmer reviewing harvest with buyer, symbolizing trustful farm-to-market connections"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAICAgICAgICAgIDAwMDBAQEBAQEBAgIBAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgP/2wCEAAQEBAQIBAgICAwICAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwP/wAARCAAQABADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCkAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/2Q=="
            />
            <div
              className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/15 to-transparent"
              aria-hidden="true"
            />
            <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-3 p-6 text-white sm:p-8">
              <div className="flex w-full flex-col gap-2 rounded-2xl bg-black/65 p-5 shadow-lg shadow-black/30 backdrop-blur-sm sm:max-w-md">
                <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
                  Field-to-market in one platform
                </span>
                <p className="text-lg font-semibold leading-snug text-white sm:text-xl">
                  Farmers and buyers collaborate through secure, transparent bidding.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-10 rounded-3xl border border-[rgba(var(--leaf-rgb),0.3)] bg-white/90 p-8 shadow-lg shadow-[rgba(var(--leaf-rgb),0.08)] backdrop-blur">
            <div className="space-y-4">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--leaf)]">
                Why BidAgri
              </span>
              <h2 className="text-3xl font-bold leading-tight text-[color:var(--primary)] sm:text-4xl">
                Bridging the gap between farm and marketplace.
              </h2>
              <p className="text-base leading-relaxed text-black sm:text-lg">
                Launch produce auctions, review bids in real time, and form partnerships built on clarity and speed.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {highlightColumns.map(({ eyebrow, title, description, bullets }) => (
                <article
                  key={eyebrow}
                  className="flex h-full flex-col gap-4 rounded-2xl border border-[rgba(var(--leaf-rgb),0.3)] bg-white p-5 shadow-sm shadow-[rgba(var(--leaf-rgb),0.07)]"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[color:var(--leaf)]/80">
                      {eyebrow}
                    </span>
                    <h3 className="text-xl font-semibold text-[color:var(--foreground)]">{title}</h3>
                    <p className="text-sm leading-relaxed text-[color:var(--muted)]">{description}</p>
                  </div>
                  <ul className="mt-auto space-y-2 text-sm text-[color:var(--foreground)]">
                    {bullets.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(var(--leaf-rgb),0.1)] text-[color:var(--leaf)]">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.704 5.29a1 1 0 0 1 .063 1.414l-7.2 7.8a1 1 0 0 1-1.45.03l-3.2-3.2a1 1 0 1 1 1.414-1.414l2.44 2.44 6.502-7.042a1 1 0 0 1 1.43-.028Z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {quickStats.map(({ label, value }) => (
                <div
                  key={label}
                  className="relative overflow-hidden rounded-3xl border border-[rgba(var(--leaf-rgb),0.25)] bg-gradient-to-br from-[rgba(var(--leaf-rgb),0.14)] via-white to-white p-6 shadow-lg shadow-[rgba(var(--leaf-rgb),0.15)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <span
                    className="pointer-events-none absolute -top-16 -right-10 h-32 w-32 rounded-full bg-[rgba(var(--secondary-rgb),0.18)] blur-3xl"
                    aria-hidden
                  />
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-[color:var(--leaf)] shadow-[0_6px_18px_rgba(0,0,0,0.06)]">
                    {label}
                  </span>
                  <div className="mt-4 flex items-end gap-2">
                    <span className="text-3xl font-extrabold tracking-tight text-[color:var(--foreground)] sm:text-4xl">
                      {value}
                    </span>
                  </div>
                  <div className="mt-3 h-[2px] w-12 rounded-full bg-[rgba(var(--leaf-rgb),0.45)]" />
                  <p className="mt-3 text-sm leading-relaxed text-[color:var(--muted)]">
                    Our teams track this milestone every single day.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-12 w-full max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--leaf-rgb),0.2)] bg-[rgba(var(--leaf-rgb),0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--leaf)] sm:text-[13px]">
            Browse by category
          </span>
          <h2 className="mt-4 text-3xl font-bold text-[color:var(--primary)] sm:text-4xl md:text-5xl">
            Fresh Produce Highlights
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base text-neutral-900 sm:text-lg">
            A snapshot of the harvests currently trending on BidAgri—explore the details to see live bids, certifications, and grower stories.
          </p>
        </div>

        <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-3">
          {quickLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              prefetch
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--leaf)] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[rgba(var(--leaf-rgb),0.25)] transition-all duration-300 hover:scale-[1.02] hover:bg-[color:var(--secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)] focus-visible:ring-offset-2 focus-visible:ring-offset-white md:text-base"
            >
              {label}
            </Link>
          ))}
        </div>

        <div
          ref={gridRef}
          className={`mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 transition-all duration-700 ease-out sm:grid-cols-2 xl:grid-cols-4 ${
            gridVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {categories.map((category) => (
            <article
              key={category.title}
              tabIndex={0}
              className="group relative overflow-hidden rounded-3xl border border-[rgba(var(--leaf-rgb),0.12)] bg-white shadow-lg shadow-[rgba(var(--leaf-rgb),0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)]/60"
              aria-label={`${category.title} category card`}
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <ImageWithFallback
                  src={category.image}
                  alt={`${category.title} category`}
                  fallbackSrc="/images/placeholder-produce.jpg"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-transparent transition-opacity duration-500 ease-out group-hover:from-black/60 group-hover:via-black/28"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 z-[2] p-5">
                  <div className="flex flex-col gap-2 rounded-2xl bg-white/10 px-5 py-4 text-left text-white shadow-lg shadow-black/10 ring-1 ring-white/15 backdrop-blur-sm">
                    <h3 className="text-3xl font-bold sm:text-3xl md:text-4xl">
                      <span className="text-white">{category.title}</span>
                    </h3>
                    <p className="text-base font-medium leading-relaxed text-white sm:text-lg">
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative isolate overflow-hidden px-4 pb-24 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-r from-[rgba(var(--leaf-rgb),0.12)] via-transparent to-[rgba(var(--accent-rgb),0.16)]" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[rgba(var(--leaf-rgb),0.12)] blur-[120px]" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-[rgba(var(--accent-rgb),0.18)] blur-[120px]" aria-hidden="true" />

        <div
          ref={ctaRef}
          className={`mx-auto flex w-full max-w-6xl flex-col gap-10 rounded-[32px] border border-[rgba(var(--leaf-rgb),0.35)] bg-white/90 px-6 py-10 text-[color:var(--foreground)] shadow-2xl shadow-[rgba(var(--leaf-rgb),0.15)] backdrop-blur-lg transition-all duration-700 ease-out sm:px-10 sm:py-12 lg:flex-row lg:items-center lg:gap-12 lg:px-16 ${
            ctaVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-[rgba(var(--leaf-rgb),0.4)] bg-[rgba(var(--leaf-rgb),0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--leaf)] sm:text-[13px]">
              The marketplace built on trust
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Join BidAgri Today
            </h2>
              <p
                className="mt-4 max-w-2xl text-sm font-medium leading-relaxed sm:text-base"
                style={{ color: "#000000" }}
              >
                Grow faster with verified partners, transparent pricing, and logistics that match your pace. Thousands already rely on BidAgri to keep fresh produce flowing and revenue stable—let’s bring your supply chain into focus next.
              </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-start sm:gap-4 lg:mt-8">
              <Link
                href="/buyers#register"
                className="inline-flex min-w-[11rem] items-center justify-center rounded-full bg-[color:var(--leaf)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[rgba(var(--leaf-rgb),0.25)] transition-all duration-300 hover:scale-[1.02] hover:bg-[color:var(--secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)] focus-visible:ring-offset-2 focus-visible:ring-offset-white md:text-base"
              >
                Get Started
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex min-w-[11rem] items-center justify-center rounded-full border border-[color:var(--leaf)] bg-[color:var(--leaf)] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[rgba(var(--leaf-rgb),0.25)] transition-all duration-300 hover:bg-[color:var(--secondary)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--leaf)] focus-visible:ring-offset-2 focus-visible:ring-offset-white md:text-base"
              >
                Learn how it works
              </Link>
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Verified logistics",
                  body: "Dispatch coordination, cold-chain partners, and standardized inspections keep deliveries on schedule.",
                },
                {
                  title: "Trust badges",
                  body: "BidAgri verifies growers and buyers through multi-step checks, building confidence before the first handshake.",
                },
                {
                  title: "Live pricing intel",
                  body: "Follow market trends and set reserve prices with data-backed forecasts tailored to your region.",
                },
                {
                  title: "Faster payouts",
                  body: "Funds route directly to your account within 48 hours, so you stay focused on production, not paperwork.",
                },
              ].map(({ title, body }) => (
                <div
                  key={title}
                  className="relative flex h-full flex-col gap-3 overflow-hidden rounded-3xl border border-[rgba(var(--leaf-rgb),0.25)] bg-gradient-to-br from-[rgba(var(--leaf-rgb),0.12)] via-white to-white p-6 shadow-lg shadow-[rgba(var(--leaf-rgb),0.15)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <span
                    className="pointer-events-none absolute -top-14 -right-10 h-28 w-28 rounded-full bg-[rgba(var(--secondary-rgb),0.18)] blur-3xl"
                    aria-hidden
                  />
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[color:var(--leaf)] shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="h-5 w-5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.5 10.5-4 4-4-4m4 4V3" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0c0-4.142-3.358-7.5-7.5-7.5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{title}</h3>
                  <div className="h-[2px] w-10 rounded-full bg-[rgba(var(--leaf-rgb),0.4)]" />
                  <p className="text-sm leading-relaxed text-[color:var(--muted)]">
                    {body}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-[rgba(var(--leaf-rgb),0.12)] bg-white/70 px-6 py-4 text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--muted)] shadow-sm sm:justify-between lg:mt-8">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[color:var(--leaf)]" />
                2,300+ lots matched
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[color:var(--leaf)]" />
                97% buyer satisfaction
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[color:var(--leaf)]" />
                48hr average payouts
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

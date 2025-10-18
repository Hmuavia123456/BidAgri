"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getCategories } from "@/data/categoryUtils";
import Image from "next/image";
import HeroSection from "@/components/HeroSection";
import ImageWithFallback from "@/components/ImageWithFallback";

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

  const gridRef = useRef(null);
  const ctaRef = useRef(null);
  const [gridVisible, setGridVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

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
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white text-[color:var(--foreground)] -mt-20">
      <HeroSection />

      <section
        id="products"
        className="relative flex w-full max-w-none items-center justify-center overflow-hidden bg-white px-4 py-16 text-[color:var(--foreground)] lg:px-8 scroll-mt-20"
      >
        <div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-12 md:flex-row md:items-stretch">
          <div className="relative w-full overflow-hidden rounded-3xl bg-white shadow-lg shadow-[rgba(var(--leaf-rgb),0.1)] transition-all duration-700 md:w-1/2 animate-fade-in-left aspect-video">
            <Image
              src="https://images.unsplash.com/photo-1621788240870-ecd5a58ac8e3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687"
              alt="Farmer reviewing harvest with buyer, symbolizing trustful farm-to-market connections"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAICAgICAgICAgIDAwMDBAQEBAQEBAgIBAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgP/2wCEAAQEBAQIBAgICAwICAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwP/wAARCAAQABADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCkAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/2Q=="
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" aria-hidden="true" />
          </div>

          <div className="flex w-full flex-col gap-10 rounded-3xl bg-white p-8 shadow-lg shadow-[rgba(var(--leaf-rgb),0.1)] md:w-1/2 animate-fade-in-right">
            <div>
              <h2 className="text-3xl font-bold text-[color:var(--primary)] text-center sm:text-4xl md:text-5xl">
                Bridging the Gap Between Farmers and Buyers
              </h2>
              <p className="mt-4 text-base text-[color:var(--muted)] text-center sm:text-lg">
                Building transparent connections rooted in trust and opportunity.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-sm shadow-[rgba(var(--leaf-rgb),0.1)]">
                <h3 className="text-xl font-semibold text-[color:var(--foreground)]">Empowering Farmers</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  BidAgri enables farmers to sell directly, set their own prices, and access fair markets without middlemen.
                </p>
                <ul className="mt-4 space-y-3 text-sm text-[color:var(--foreground)]">
                  {[
                    "Transparent pricing",
                    "Direct payments",
                    "Market expansion",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--surface-2)]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5 text-[color:var(--leaf)]"
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
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-[color:var(--surface)] to-[color:var(--surface-2)] p-6 shadow-sm shadow-[rgba(var(--leaf-rgb),0.1)]">
                <h3 className="text-xl font-semibold text-[color:var(--foreground)]">Trusted Buying Experience</h3>
                <p className="mt-2 text-sm text-[color:var(--muted)]">
                  Buyers get fresh produce, verified quality, and a direct link to the source.
                </p>
                <ul className="mt-4 space-y-3 text-sm text-[color:var(--foreground)]">
                  {[
                    "Verified quality",
                    "Competitive prices",
                    "Reliable logistics",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--surface-2)]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5 text-[color:var(--leaf)]"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.5 2.75c3.175 0 5.75 2.575 5.75 5.75 0 2.232-1.317 4.32-3.21 5.925a14.874 14.874 0 0 1-3.2 2.058.75.75 0 0 1-.68 0 14.874 14.874 0 0 1-3.2-2.058C4.077 12.82 2.76 10.732 2.76 8.5c0-3.175 2.575-5.75 5.75-5.75 1.066 0 2.074.286 2.99.78A5.736 5.736 0 0 0 10.5 2.75Zm.03 3.72a.75.75 0 0 0-1.06 0l-2.95 2.95a.75.75 0 0 0 1.06 1.06l1.17-1.17v3.69a.75.75 0 1 0 1.5 0v-3.69l1.17 1.17a.75.75 0 1 0 1.06-1.06l-2.95-2.95Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[rgba(var(--leaf-rgb),0.2)] via-transparent to-[rgba(var(--accent-rgb),0.2)]" aria-hidden="true" />
      </section>

      <section className="flex w-full max-w-none flex-col items-center bg-white px-4 py-16 lg:px-8">
        <div className="w-full max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-[color:var(--primary)] sm:text-4xl md:text-5xl">
            Our Fresh Categories
          </h2>
          <p className="mt-4 text-base text-[color:var(--muted)] sm:text-lg">
            Discover BidAgri’s premium assortment freshly curated for buyers seeking trusted farm-to-market partners.
          </p>
        </div>

        {/* Quick entry links to popular subcategories */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {getCategories()
            .slice(0, 4)
            .flatMap((cat) => (cat.subcategories || []).slice(0, 2).map((sub) => (
              <Link
                key={`${cat.slug}-${sub.slug}`}
                href={`/products/${cat.slug}/${sub.slug}`}
                prefetch
                className="inline-flex items-center gap-2 rounded-full bg-[color:var(--surface-2)] px-3 py-1.5 text-sm text-[color:var(--leaf)] ring-1 ring-[color:var(--surface-2)] hover:bg-[color:var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[color:var(--leaf)]"
              >
                <span aria-hidden>{sub.icon}</span>
                {cat.name}: {sub.name}
              </Link>
            )))}
        </div>

        <div
          ref={gridRef}
          className={`mt-16 grid w-full max-w-6xl grid-cols-1 gap-6 transition-all duration-700 ease-out sm:grid-cols-2 xl:grid-cols-4 ${
            gridVisible ? "opacity-100 translate-y-0" : "translate-y-10 opacity-0"
          }`}
        >
          {categories.map((category) => (
            <article
              key={category.title}
              tabIndex={0}
              className="relative flex flex-col overflow-hidden rounded-2xl bg-[color:var(--surface)] shadow-lg ring-1 ring-[color:var(--supporting)]/30 focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/60"
              aria-label={`${category.title} category card`}
            >
              <span className="sr-only">{`${category.title}: ${category.description}`}</span>
              <div className="relative h-72 w-full overflow-hidden">
                <ImageWithFallback
                  src={category.image}
                  alt={`${category.title} category`}
                  fallbackSrc="/images/placeholder-produce.jpg"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="text-2xl font-semibold text-[color:var(--foreground)] sm:text-3xl">
                  {category.title}
                </h3>
                <p className="text-sm text-[color:var(--muted)] sm:text-base">
                  {category.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative my-0 flex w-full max-w-none items-center justify-center overflow-hidden bg-white py-12 md:py-16">
        <div className="w-full px-4 md:px-6">
          <div
            ref={ctaRef}
            className={`transition-all duration-700 ease-out ${
              ctaVisible ? "opacity-100 translate-y-0" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl bg-[color:var(--surface)]/70 p-6 text-center shadow-xl ring-1 ring-black/5 backdrop-blur md:gap-5 md:p-8 lg:max-w-2xl">
              <h2 className="flex items-center justify-center text-3xl font-bold tracking-tight text-[color:var(--foreground)] md:text-4xl">
                <span aria-hidden="true" className="mr-2 inline-flex h-6 w-6 items-center justify-center align-middle opacity-90">🌿</span>
                Join BidAgri Today
              </h2>
              <p className="max-w-2xl text-center text-sm leading-relaxed text-[color:var(--muted)] md:text-base">
                Be part of a growing digital revolution that connects farmers and buyers directly. Empower yourself with transparent, fair, and efficient trade.
              </p>
              <div className="flex flex-col items-center gap-4 md:flex-row">
                <Link
                  href="/buyers#register"
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--primary)] px-6 py-2.5 text-sm text-[color:var(--surface)] shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[color:var(--leaf)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--leaf)] md:text-base"
                >
                  Get Started
                </Link>
                <Link
                  href="/how-it-works"
                  className="text-sm text-[color:var(--leaf)] underline-offset-4 transition-colors duration-200 hover:text-[color:var(--primary)] hover:underline"
                >
                  Learn more about how BidAgri works
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

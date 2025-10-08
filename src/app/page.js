"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

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
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-white text-gray-900">
      <section className="relative isolate flex min-h-screen w-full max-w-none items-center justify-center overflow-hidden px-4 py-16 text-white lg:px-8">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-green-900/60" />
        </div>

        <div className="relative z-10 flex w-full flex-col items-center gap-6 text-center md:w-4/5 lg:w-2/3 xl:w-1/2">
          <p className="text-sm uppercase tracking-[0.35em] text-lime-200 animate-fade-in-down sm:text-base">
            Fresh from the fields
          </p>
          <h1 className="text-4xl font-bold leading-tight animate-fade-in-up sm:text-5xl md:text-6xl">
            Buy Directly from the Farmer
          </h1>
          <p className="text-base font-light text-lime-100/90 animate-fade-in-up animate-delay-200 sm:text-lg md:text-xl">
            Empowering farmers and connecting them directly to buyers.
          </p>
          <Link
            href="#products"
            className="inline-flex items-center justify-center rounded-full bg-lime-400 px-8 py-3 font-semibold text-green-950 shadow-lg shadow-lime-500/40 transition-all duration-300 hover:bg-lime-300 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200 animate-fade-in-up animate-delay-300"
          >
            Explore Products
          </Link>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-green-950/40 to-green-950/70" aria-hidden />
      </section>

      <section
        id="products"
        className="relative flex w-full max-w-none items-center justify-center overflow-hidden bg-gradient-to-r from-lime-50 via-white to-lime-100 px-4 py-16 text-green-900 lg:px-8"
      >
        <div className="relative z-10 flex w-full max-w-6xl flex-col items-center gap-12 md:flex-row md:items-stretch">
          <div className="relative w-full overflow-hidden rounded-3xl bg-white shadow-lg shadow-lime-500/10 transition-all duration-700 md:w-1/2 animate-fade-in-left">
            <img
              src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1280&auto=format&fit=crop"
              alt="Farmer and buyer shaking hands in a green field"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-green-900/30 to-transparent" aria-hidden="true" />
          </div>

          <div className="flex w-full flex-col gap-10 rounded-3xl bg-white/80 p-8 backdrop-blur-sm shadow-lg shadow-lime-500/10 md:w-1/2 animate-fade-in-right">
            <div>
              <h2 className="text-3xl font-bold text-[#16A34A] text-center sm:text-4xl md:text-5xl">
                Bridging the Gap Between Farmers and Buyers
              </h2>
              <p className="mt-4 text-base text-green-800/80 text-center sm:text-lg">
                Building transparent connections rooted in trust and opportunity.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-2xl bg-gradient-to-br from-lime-50 to-white p-6 shadow-sm shadow-lime-500/10">
                <h3 className="text-xl font-semibold text-green-900">Empowering Farmers</h3>
                <p className="mt-2 text-sm text-green-700">
                  BidAgri enables farmers to sell directly, set their own prices, and access fair markets without middlemen.
                </p>
                <ul className="mt-4 space-y-3 text-sm text-green-800">
                  {[
                    "Transparent pricing",
                    "Direct payments",
                    "Market expansion",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5 text-lime-600"
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

              <div className="rounded-2xl bg-gradient-to-br from-white to-lime-50 p-6 shadow-sm shadow-lime-500/10">
                <h3 className="text-xl font-semibold text-green-900">Trusted Buying Experience</h3>
                <p className="mt-2 text-sm text-green-700">
                  Buyers get fresh produce, verified quality, and a direct link to the source.
                </p>
                <ul className="mt-4 space-y-3 text-sm text-green-800">
                  {[
                    "Verified quality",
                    "Competitive prices",
                    "Reliable logistics",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5 text-emerald-600"
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

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-green-200/20 via-transparent to-lime-300/20" aria-hidden="true" />
      </section>

      <section className="flex w-full max-w-none flex-col items-center bg-white px-4 py-16 lg:px-8">
        <div className="w-full max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-[#16A34A] sm:text-4xl md:text-5xl">
            Our Fresh Categories
          </h2>
          <p className="mt-4 text-base text-green-800/80 sm:text-lg">
            Discover BidAgri’s premium assortment freshly curated for buyers seeking trusted farm-to-market partners.
          </p>
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
              className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-lg transition duration-300 ease-in-out hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-lime-400/60 focus-visible:scale-105"
              aria-label={`${category.title} category card`}
            >
              <span className="sr-only">{`${category.title}: ${category.description}`}</span>
              <div className="relative h-72 w-full overflow-hidden rounded-2xl">
                <img
                  src={category.image}
                  alt={`${category.title} category`}
                  className="h-72 w-full rounded-2xl object-cover transition-transform duration-300 ease-in-out group-hover:scale-105 group-focus-visible:scale-105"
                  loading={category.title === "Grains" ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-green-700 bg-opacity-40 opacity-0 transition duration-300 ease-in-out group-hover:opacity-100 group-focus-visible:opacity-100">
                  <h3 className="translate-y-1 text-2xl font-semibold text-white opacity-0 transition duration-300 ease-in-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 sm:text-3xl">
                    {category.title}
                  </h3>
                  <p className="mt-3 w-full translate-y-1 px-4 text-center text-sm text-lime-50/90 opacity-0 transition duration-300 ease-in-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 sm:text-base">
                    {category.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative my-0 flex w-full max-w-none items-center justify-center overflow-hidden bg-gradient-to-br from-[#E8F5E9] to-[#D1FAE5] py-12 md:py-16">
        <div className="w-full px-4 md:px-6">
          <div
            ref={ctaRef}
            className={`transition-all duration-700 ease-out ${
              ctaVisible ? "opacity-100 translate-y-0" : "translate-y-10 opacity-0"
            }`}
          >
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl bg-white/70 p-6 text-center shadow-xl ring-1 ring-black/5 backdrop-blur md:gap-5 md:p-8 lg:max-w-2xl">
              <h2 className="flex items-center justify-center text-3xl font-bold tracking-tight text-green-900 md:text-4xl">
                <span aria-hidden="true" className="mr-2 inline-flex h-6 w-6 items-center justify-center align-middle opacity-90">🌿</span>
                Join BidAgri Today
              </h2>
              <p className="max-w-2xl text-center text-sm leading-relaxed text-gray-700 md:text-base">
                Be part of a growing digital revolution that connects farmers and buyers directly. Empower yourself with transparent, fair, and efficient trade.
              </p>
              <div className="flex flex-col items-center gap-4 md:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-green-600 px-6 py-2.5 text-sm text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 md:text-base"
                >
                  Get Started
                </Link>
                <Link
                  href="/how-it-works"
                  className="text-sm text-green-700 underline-offset-4 transition-colors duration-200 hover:text-green-800 hover:underline"
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

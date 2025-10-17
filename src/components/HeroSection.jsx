"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Two cinematic background clips (per request)
const CLIPS = [
  {
    // First Video (Pixabay)
    src: "https://cdn.pixabay.com/video/2021/08/10/84624-585553977_large.mp4",
    label: "Golden field and horizon",
  },
  {
    // Second Video (Pexels): download link provided
    src: "https://www.pexels.com/download/video/4375939/",
    label: "Tractor cutting grass in the field",
  },
];

const FADE_S = 1.5; // smooth fade (1.5s)
const SLIDE_MS = 6500; // 6–7 seconds per clip

function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);
  const mq = useRef(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    mq.current = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setPrefersReduced(mq.current?.matches || false);
    handler();
    mq.current?.addEventListener?.("change", handler);
    return () => mq.current?.removeEventListener?.("change", handler);
  }, []);
  return prefersReduced;
}

export default function HeroSection() {
  const [showFirst, setShowFirst] = useState(true);
  const reduceMotion = usePrefersReducedMotion();
  const v1Ref = useRef(null);
  const v2Ref = useRef(null);
  // Content should always be visible and animate safely without gating

  useEffect(() => {
    console.log("🎥 Video HeroSection loaded successfully");
    if (reduceMotion) return; // respect reduced motion
    const id = setInterval(() => setShowFirst((v) => !v), SLIDE_MS);
    return () => clearInterval(id);
  }, [reduceMotion]);

  // Remove animation gating to prevent content from staying hidden

  // Limit playback to the first 9 seconds and loop that segment
  const handleSegmentTimeUpdate = (videoEl, endSeconds = 9) => {
    if (!videoEl) return;
    if (videoEl.currentTime >= endSeconds) {
      try {
        videoEl.currentTime = 0;
        videoEl.play?.();
      } catch (_) {
        // ignore autoplay or play promise issues
      }
    }
  };

  return (
    <section
      className="relative flex h-screen min-h-screen w-full items-center justify-center overflow-hidden text-[color:var(--surface)]"
      aria-label="Cinematic farming videos with overlay"
    >
      {/* Background video layers */}
      <div className="absolute inset-0 z-0" aria-hidden="true">
        <motion.video
          ref={v1Ref}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          initial={false}
          animate={{ opacity: reduceMotion ? 1 : showFirst ? 1 : 0 }}
          transition={{ duration: reduceMotion ? 0 : FADE_S, ease: "easeInOut" }}
          style={{ willChange: "opacity", filter: "brightness(0.9) contrast(1.05)" }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => void 0}
          onTimeUpdate={(e) => handleSegmentTimeUpdate(e.currentTarget, 9)}
        >
          <source src={CLIPS[0].src} type="video/mp4" />
        </motion.video>

        <motion.video
          ref={v2Ref}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
          initial={false}
          animate={{ opacity: reduceMotion ? 0 : showFirst ? 0 : 1 }}
          transition={{ duration: reduceMotion ? 0 : FADE_S, ease: "easeInOut" }}
          style={{ willChange: "opacity", filter: "brightness(0.9) contrast(1.05)" }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => void 0}
          onTimeUpdate={(e) => handleSegmentTimeUpdate(e.currentTarget, 9)}
        >
          <source src={CLIPS[1].src} type="video/mp4" />
        </motion.video>
      </div>

      {/* Subtle dark overlay for text clarity */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[rgba(0,0,0,0.25)]" aria-hidden="true" />

      {/* Centered overlay content with entrance animations after video loads */}
      <div className="relative z-20 mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reduceMotion ? undefined : { duration: 1 }}
        >
          <h1
            className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl text-[#FEFAE0]"
            style={{ textShadow: "2px 2px 8px rgba(0, 0, 0, 0.4)" }}
          >
            Fresh from the Fields
          </h1>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reduceMotion ? undefined : { duration: 1, delay: 0.3 }}
        >
          <p className="max-w-3xl text-sm font-light text-[color:var(--surface)] sm:text-base md:text-lg">
            Bridging the Gap Between Farmers and Buyers — building transparent connections rooted in trust and opportunity.
          </p>
        </motion.div>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
            transition={reduceMotion ? undefined : { duration: 1, delay: 0.6 }}
          >
            <a
              href="#products"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold bg-[color:var(--leaf)] text-[color:var(--surface)] shadow-md shadow-[rgba(var(--leaf-rgb),0.35)] transition-colors duration-200 ease-out hover:bg-[color:var(--primary)] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--leaf)]"
            >
              Explore Products
            </a>
          </motion.div>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
            transition={reduceMotion ? undefined : { duration: 0.6, ease: "easeInOut", delay: 0.6 }}
          >
            <a
              href="/buyers#register"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold bg-[color:var(--surface)] text-[color:var(--leaf)] ring-1 ring-[color:var(--surface-2)] shadow-sm transition-colors duration-200 ease-out hover:bg-[color:var(--surface-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--leaf)]"
            >
              Get Started
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

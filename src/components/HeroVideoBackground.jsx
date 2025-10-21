"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// Default clips sourced from Pexels (public royalty-free). Optimized to only 2 as requested.
const DEFAULT_CLIPS = [
  {
    // Local 720p clip trimmed to ~9.5s for quick playback
    src: "/videos/tractor-cutting.mp4",
    label: "Tractor cutting grass in the field",
    position: "center",
  },
  {
    // Restore original non-farmer clip (crops in wind)
    src: "https://cdn.pixabay.com/video/2022/09/15/131457-750569039_large.mp4",
    label: "Close-up of green crops in wind",
    position: "center",
  },
];

const FADE_MS = 900; // smooth crossfade
const SLIDE_MS = 6000; // cycle every 6 seconds

export default function HeroVideoBackground({ clips = DEFAULT_CLIPS }) {
  const reduceMotion = usePrefersReducedMotion();
  const [activeIsA, setActiveIsA] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [initialShown, setInitialShown] = useState(false);
  const intervalRef = useRef(null);

  const videoARef = useRef(null);
  const videoBRef = useRef(null);

  const currentClip = clips[currentIndex % clips.length];
  const nextIndex = (currentIndex + 1) % clips.length;
  const nextClip = clips[nextIndex];

  // Helper to safely play without unhandled promise rejections
  const safePlay = async (video) => {
    try {
      await video?.play?.();
    } catch (_) {
      // Autoplay might be blocked in rare cases; keep muted and ignore
    }
  };

  // Initialize first video element
  useEffect(() => {
    if (reduceMotion) return;
    const vA = videoARef.current;
    if (!vA) return;
    vA.muted = true;
    vA.playsInline = true;
    vA.autoplay = true;
    vA.loop = true; // loop video while we schedule timed crossfades
  }, [reduceMotion]);

  // Load current clip into active element
  useEffect(() => {
    if (reduceMotion) return;
    const activeVideo = activeIsA ? videoARef.current : videoBRef.current;
    const standbyVideo = activeIsA ? videoBRef.current : videoARef.current;
    if (!activeVideo || !standbyVideo) return;

    // Assign sources
    activeVideo.src = currentClip?.src || "";
    activeVideo.preload = "auto";
    activeVideo.muted = true;
    activeVideo.playsInline = true;
    activeVideo.autoplay = true;
    activeVideo.loop = true;

    const onCanPlay = () => {
      setInitialShown(true);
      setTimeout(() => safePlay(activeVideo), 0);
    };

    activeVideo.addEventListener("canplay", onCanPlay);

    // Preload standby with next clip (metadata by default)
    standbyVideo.src = nextClip?.src || "";
    standbyVideo.preload = "metadata";
    standbyVideo.muted = true;
    standbyVideo.playsInline = true;
    standbyVideo.autoplay = false;
    standbyVideo.loop = true;

    return () => {
      activeVideo.removeEventListener("canplay", onCanPlay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, activeIsA, reduceMotion]);

  const crossfadeToNext = () => {
    if (reduceMotion || isFading) return;
    const from = activeIsA ? videoARef.current : videoBRef.current;
    const to = activeIsA ? videoBRef.current : videoARef.current;
    if (!from || !to) return;

    // Ensure the standby video is loaded and then play + fade in
    const onReady = () => {
      setIsFading(true);
      safePlay(to);
      setTimeout(() => {
        // Swap active layer after fade
        setActiveIsA((v) => !v);
        setCurrentIndex((i) => (i + 1) % clips.length);
        setIsFading(false);
      }, FADE_MS);
    };

    if (to.readyState >= 2) {
      onReady();
    } else {
      const handler = () => {
        to.removeEventListener("canplay", handler);
        onReady();
      };
      to.addEventListener("canplay", handler, { once: true });
      // Request more aggressive preload right before fade
      to.preload = "auto";
      // Kick decoding
      to.load();
    }
  };

  // Timer-driven crossfade every SLIDE_MS
  useEffect(() => {
    if (reduceMotion) return;
    // Clear any previous timers
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Only start once the initial video is shown
    if (initialShown) {
      intervalRef.current = setInterval(() => {
        crossfadeToNext();
      }, SLIDE_MS);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion, initialShown, activeIsA, currentIndex]);

  // Reduced motion: show static fallback image
  if (reduceMotion) {
    return (
      <section className="relative flex h-[70vh] min-h-[520px] w-full items-center justify-center overflow-hidden text-[color:var(--surface)] sm:h-[78vh] md:h-screen">
        <Image
          src="/images/placeholder-produce.jpg"
          alt="Farming scene"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[rgba(var(--primary-rgb),0.6)]" aria-hidden="true" />
        <HeroOverlay reduceMotion={true} initiallyVisible={true} />
      </section>
    );
  }

  return (
    <section
      className="relative flex h-[70vh] min-h-[520px] w/full items-center justify-center overflow-hidden text-[color:var(--surface)] sm:h-[78vh] md:h-screen"
      aria-label="Cinematic farming videos with overlay"
    >
      {/* Background video layers (A/B) */}
      <div className="absolute inset-0 z-[-1]">
        <video
          ref={videoARef}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out ${
            activeIsA ? (isFading ? "opacity-0" : "opacity-100") : "opacity-0"
          }`}
          style={{ transitionDuration: `${FADE_MS}ms`, objectPosition: currentClip?.position || "center" }}
          playsInline
          autoPlay
          loop
          muted
        />

        <video
          ref={videoBRef}
          aria-hidden="true"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity ease-in-out ${
            !activeIsA ? "opacity-100" : isFading ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDuration: `${FADE_MS}ms`, objectPosition: nextClip?.position || "center" }}
          playsInline
          autoPlay
          loop
          muted
        />
      </div>

      {/* Soft dark/light gradient overlay for readability */}
      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[rgba(var(--primary-rgb),0.65)] via-[rgba(var(--primary-rgb),0.5)] to-[rgba(var(--primary-rgb),0.35)]"
        aria-hidden="true"
      />

      {/* Removed static placeholder to avoid initial flash */}

      {/* Centered overlay content */}
      <HeroOverlay reduceMotion={reduceMotion} initiallyVisible={initialShown} />
    </section>
  );
}

function HeroOverlay({ reduceMotion = false, initiallyVisible = false }) {
  const motionKey = reduceMotion ? "static" : initiallyVisible ? "visible" : "preload";
  return (
    <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
      <motion.p
        key={`sub-${motionKey}`}
        className="text-xs uppercase tracking-[0.35em] text-[color:var(--surface)]/90 sm:text-sm"
        initial={reduceMotion ? false : initiallyVisible ? { opacity: 0, y: 14 } : { opacity: 1, y: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={reduceMotion ? undefined : { duration: 0.6, ease: "easeInOut" }}
      >
        Fresh from the fields
      </motion.p>
      <motion.h1
        key={`h-${motionKey}`}
        className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl"
        initial={reduceMotion ? false : initiallyVisible ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={reduceMotion ? undefined : { duration: 0.8, ease: "easeInOut" }}
      >
        Bridging the Gap Between Farmers and Buyers
      </motion.h1>
      <motion.p
        key={`p-${motionKey}`}
        className="max-w-3xl text-sm font-light text-[color:var(--surface)] sm:text-base md:text-lg"
        initial={reduceMotion ? false : initiallyVisible ? { opacity: 0, y: 18 } : { opacity: 1, y: 0 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={reduceMotion ? undefined : { duration: 0.8, ease: "easeInOut", delay: 0.2 }}
      >
        Building transparent connections rooted in trust and opportunity.
      </motion.p>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <motion.a
          key={`btn1-${motionKey}`}
          href="#products"
          className="inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold bg-[color:var(--leaf)] text-[color:var(--surface)] shadow-md shadow-[rgba(var(--leaf-rgb),0.35)] transition-colors duration-200 ease-out hover:bg-[color:var(--primary)] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--leaf)]"
          initial={reduceMotion ? false : initiallyVisible ? { opacity: 0, scale: 0.97 } : { opacity: 1, scale: 1 }}
          animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={reduceMotion ? undefined : { duration: 0.6, ease: "easeInOut", delay: 0.4 }}
        >
          Explore Products
        </motion.a>
        <motion.a
          key={`btn2-${motionKey}`}
          href="/buyers#register"
          className="inline-flex items-center justify-center rounded-full px-8 py-3 text-base font-semibold bg-[color:var(--surface)] text-[color:var(--leaf)] ring-1 ring-[color:var(--surface-2)] shadow-sm transition-colors duration-200 ease-out hover:bg-[color:var(--surface-2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--leaf)]"
          initial={reduceMotion ? false : initiallyVisible ? { opacity: 0, scale: 0.97 } : { opacity: 1, scale: 1 }}
          animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={reduceMotion ? undefined : { duration: 0.6, ease: "easeInOut", delay: 0.5 }}
        >
          Get Started
        </motion.a>
      </div>
    </div>
  );
}

function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);
  const mediaQuery = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    mediaQuery.current = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setPrefersReduced(mediaQuery.current?.matches || false);
    handler();
    mediaQuery.current?.addEventListener?.("change", handler);
    return () => mediaQuery.current?.removeEventListener?.("change", handler);
  }, []);

  return prefersReduced;
}

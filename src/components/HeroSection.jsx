"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const VIDEO_SOURCES = [
  {
    id: "field-harvest",
    sources: [
      {
        src: "https://cdn.pixabay.com/video/2021/08/10/84624-585553977_large.mp4",
        type: "video/mp4",
      },
    ],
  },
  {
    id: "tractor-cutting",
    sources: [
      {
        src: "/videos/tractor-cutting.mp4",
        type: "video/mp4",
      },
    ],
  },
];

const SWITCH_INTERVAL_MS = 10000;

export default function HeroSection() {
  const videoRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [videoReady, setVideoReady] = useState(VIDEO_SOURCES.map(() => false));
  const readyStateRef = useRef(videoReady);

  const anyClipPlaying = videoReady.some((isReady) => isReady);

  useEffect(() => {
    const testLink = document.createElement("link");
    const canPreloadVideo =
      typeof testLink.relList?.supports === "function" ? testLink.relList.supports("preload") : true;

    if (!canPreloadVideo) {
      return undefined;
    }

    const preloadLinks = VIDEO_SOURCES.flatMap((video) =>
      video.sources
        .filter((source) => source.src.toLowerCase().endsWith(".mp4"))
        .map((source) => {
          const link = document.createElement("link");
          link.setAttribute("rel", "preload");
          link.setAttribute("as", "video");
          link.setAttribute("href", source.src);
          link.setAttribute("type", source.type || "video/mp4");
          if (/^https?:\/\//i.test(source.src)) {
            link.setAttribute("crossorigin", "anonymous");
          }
          document.head.appendChild(link);
          return link;
        }),
    );

    return () => {
      preloadLinks.forEach((link) => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      });
    };
  }, []);

  useEffect(() => {
    readyStateRef.current = videoReady;
  }, [videoReady]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((prev) => {
        const readySnapshot = readyStateRef.current;
        const total = readySnapshot.length;
        for (let offset = 1; offset <= total; offset += 1) {
          const candidate = (prev + offset) % total;
          if (readySnapshot[candidate]) {
            return candidate;
          }
        }
        return prev;
      });
    }, SWITCH_INTERVAL_MS);
    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      video.muted = true;
      video.playsInline = true;
      video.loop = true;
      if (index === activeIndex) {
        try {
          video.currentTime = 0;
        } catch (_) {
          // Ignore seek errors on metadata-less videos.
        }
      }
      if (video.paused) {
        const playPromise = video.play?.();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(() => {
            // Autoplay might be deferred until the browser is ready.
          });
        }
      }
    });
  }, [activeIndex, videoReady]);

  useEffect(() => {
    if (videoReady[activeIndex]) return;
    const firstReady = videoReady.findIndex((ready) => ready);
    if (firstReady !== -1 && firstReady !== activeIndex) {
      setActiveIndex(firstReady);
    }
  }, [activeIndex, videoReady]);

  const handleVideoLoaded = (index, element) => {
    setVideoReady((prev) => {
      if (prev[index]) {
        return prev;
      }
      const next = [...prev];
      next[index] = true;
      return next;
    });
    const playPromise = element.play?.();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Ignore autoplay rejections; playback resumes once permitted.
      });
    }
  };

  return (
    <section
      className="relative flex h-screen min-h-screen w-full items-start justify-center overflow-hidden bg-black text-[color:var(--surface)]"
      aria-label="Cinematic farming videos with overlay"
    >
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {VIDEO_SOURCES.map((video, index) => {
          const isActive = activeIndex === index;
          const isReady = videoReady[index];
          return (
            <video
              key={video.id}
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-900 ease-in-out ${
                isActive ? "opacity-100" : "opacity-0"
              } ${isReady || isActive ? "" : "opacity-0"}`}
              preload="auto"
              autoPlay
              muted
              loop
              playsInline
              onLoadedData={(event) => handleVideoLoaded(index, event.currentTarget)}
              onCanPlay={(event) => handleVideoLoaded(index, event.currentTarget)}
              onLoadedMetadata={(event) => handleVideoLoaded(index, event.currentTarget)}
              onError={(event) => {
                const videoEl = event.currentTarget;
                videoEl.removeAttribute("poster");
                try {
                  videoEl.load();
                } catch (_) {
                  // Ignore load retries; browser will move to the next <source>.
                }
              }}
            >
              {video.sources.map((source, sourceIdx) => (
                <source
                  key={`${video.id}-${sourceIdx}`}
                  src={source.src}
                  type={source.type || "video/mp4"}
                />
              ))}
            </video>
          );
        })}

      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-black/25" aria-hidden="true" />

      <HeroContent hasLoaded={anyClipPlaying} />
    </section>
  );
}

function HeroContent({ hasLoaded }) {
  return (
    <div className="absolute inset-0 z-[2] flex h-full w-full items-center justify-center px-5 py-20 text-center mix-blend-normal sm:px-6 md:px-10 lg:px-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 text-center sm:gap-8">
        <motion.div
          className="w-full max-w-4xl"
          initial={{ opacity: 0, y: 30 }}
          animate={hasLoaded ? { opacity: 1, y: 0 } : { opacity: 0.85, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          <h1
            className="relative z-[2] text-balance text-center text-3xl font-extrabold leading-snug tracking-tight text-white drop-shadow-[0_6px_18px_rgba(0,0,0,1)] sm:text-4xl md:text-6xl md:leading-tight"
            style={{ color: "#ffffff" }}
          >
            Convey trust, transparency, and opportunity.
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={hasLoaded ? { opacity: 1, y: 0 } : { opacity: 0.85, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <p className="relative z-[2] mx-auto mt-4 w-full max-w-3xl text-center text-base font-medium tracking-wide !text-white drop-shadow-[0_6px_18px_rgba(0,0,0,1)] sm:text-lg md:text-xl">
            Bridging fields and markets with fairness and hope.
          </p>
        </motion.div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={hasLoaded ? { opacity: 1, scale: 1 } : { opacity: 0.85, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.5 }}
          >
            <a
              href="/products"
              className="inline-flex min-w-[11rem] items-center justify-center rounded-full bg-primary px-10 py-3 text-base font-semibold text-white shadow-md shadow-primary/30 transition-all duration-200 ease-out hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-base"
            >
              Explore Products
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

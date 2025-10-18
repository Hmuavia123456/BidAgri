"use client";
import { motion, useReducedMotion } from "framer-motion";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=300&q=80";

export default function AnimatedTestimonial({ story }) {
  const imageSrc = story.image?.trim() ? story.image.trim() : FALLBACK_IMAGE;

  return (
    <motion.div
      {...(() => {
        const prefersReduced = useReducedMotion();
        const initial = prefersReduced ? { opacity: 0 } : { opacity: 0, y: 50 };
        const animate = prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 };
        const transition = prefersReduced ? { duration: 0.001 } : { duration: 0.6, ease: "easeOut" };
        return { initial, whileInView: animate, transition };
      })()}
      viewport={{ once: true }}
      className="rounded-2xl bg-[color:var(--surface)] p-6 text-center shadow-lg"
    >
      <img
        src={imageSrc}
        alt={story.name}
        onError={(event) => {
          if (event.currentTarget.src !== FALLBACK_IMAGE) {
            event.currentTarget.src = FALLBACK_IMAGE;
          }
        }}
        className="mx-auto h-20 w-20 rounded-full object-cover mb-4 ring-2 ring-[color:var(--surface-2)] shadow-md"
      />
      <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{story.name}</h3>
      <p className="text-sm text-[color:var(--muted)] mb-2">{story.location}</p>
      <p className="text-[color:var(--muted)] italic mb-4">"{story.quote}"</p>
      <div className="flex justify-center gap-1">
        {[...Array(story.rating)].map((_, i) => (
          <span key={i} className="text-[color:var(--accent)] text-lg">⭐</span>
        ))}
      </div>
    </motion.div>
  );
}

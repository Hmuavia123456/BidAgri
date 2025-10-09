"use client";
import { motion } from "framer-motion";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=300&q=80";

export default function AnimatedTestimonial({ story }) {
  const imageSrc = story.image?.trim() ? story.image.trim() : FALLBACK_IMAGE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
      className="p-6 bg-white shadow-lg rounded-2xl hover:shadow-2xl transition-all duration-500 text-center"
    >
      <img
        src={imageSrc}
        alt={story.name}
        onError={(event) => {
          if (event.currentTarget.src !== FALLBACK_IMAGE) {
            event.currentTarget.src = FALLBACK_IMAGE;
          }
        }}
        className="mx-auto h-20 w-20 rounded-full object-cover mb-4 ring-2 ring-green-200 shadow-md"
      />
      <h3 className="text-lg font-semibold text-green-800">{story.name}</h3>
      <p className="text-sm text-gray-500 mb-2">{story.location}</p>
      <p className="text-gray-700 italic mb-4">"{story.quote}"</p>
      <div className="flex justify-center gap-1">
        {[...Array(story.rating)].map((_, i) => (
          <span key={i} className="text-yellow-400 text-lg">⭐</span>
        ))}
      </div>
    </motion.div>
  );
}

"use client";
import { motion, useReducedMotion } from "framer-motion";

export default function FarmerAnimations({ children }) {
  const prefersReduced = useReducedMotion();
  const initial = prefersReduced ? { opacity: 0 } : { opacity: 0, y: 40 };
  const animate = prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 };
  const transition = prefersReduced ? { duration: 0.001 } : { duration: 0.6, ease: "easeOut" };
  return (
    <motion.div initial={initial} whileInView={animate} transition={transition} viewport={{ once: true }}>
      {children}
    </motion.div>
  );
}

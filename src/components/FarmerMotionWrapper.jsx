"use client";
import { motion, useReducedMotion } from "framer-motion";

export function FadeIn({ children, className, ...rest }) {
  const prefersReduced = useReducedMotion();
  const initial = prefersReduced ? { opacity: 0 } : { opacity: 0, y: 40 };
  const animate = prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 };
  const transition = prefersReduced ? { duration: 0.001 } : { duration: 0.6, ease: "easeOut" };
  return (
    <motion.div initial={initial} whileInView={animate} transition={transition} viewport={{ once: true }} className={className} {...rest}>
      {children}
    </motion.div>
  );
}

export function AnimatedHeading({ children, className, ...rest }) {
  const prefersReduced = useReducedMotion();
  const initial = prefersReduced ? { opacity: 0 } : { opacity: 0, y: 20 };
  const animate = prefersReduced ? { opacity: 1 } : { opacity: 1, y: 0 };
  const transition = prefersReduced ? { duration: 0.001 } : { duration: 0.6, ease: "easeOut" };
  return (
    <motion.h2 initial={initial} whileInView={animate} transition={transition} viewport={{ once: true }} className={className} {...rest}>
      {children}
    </motion.h2>
  );
}

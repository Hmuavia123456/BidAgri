"use client";

// Accessible inline error message component.
// Props:
// - id: string (used by inputs via aria-describedby)
// - message: string (error text)
// - className: string (optional extra classes)
export default function InlineError({ id, message, className = "" }) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={`mt-2 text-sm font-semibold text-rose-600 ${className}`}
    >
      {message}
    </p>
  );
}

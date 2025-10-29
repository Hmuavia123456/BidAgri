"use client";

import React, { useMemo } from "react";

function formatTimestamp(value) {
  if (!value) return "";
  try {
    const date = typeof value === "string" ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function DeliveryTimeline({ events = [], className = "" }) {
  const activeIndex = useMemo(() => {
    if (!Array.isArray(events) || !events.length) return -1;
    const pendingIndex = events.findIndex((event) => event?.status !== "completed");
    return pendingIndex === -1 ? events.length - 1 : pendingIndex;
  }, [events]);

  if (!Array.isArray(events) || events.length === 0) {
    return null;
  }

  return (
    <ol className={`relative space-y-4 border-l border-[rgba(var(--leaf-rgb),0.2)] pl-4 text-sm ${className}`} role="list">
      {events.map((event, index) => {
        const label = event?.label || "Milestone";
        const detail = event?.detail || "";
        const status = event?.status || "pending";
        const rawTimestamp =
          typeof event?.timestamp?.toDate === "function" ? event.timestamp.toDate() : event?.timestamp;
        const displayTimestamp = formatTimestamp(rawTimestamp);
        const isCompleted = status === "completed";
        const isActive = !isCompleted && index === activeIndex;

        const dotColor = isCompleted
          ? "bg-[color:var(--leaf)] border-[color:var(--leaf)] text-white"
          : isActive
          ? "bg-[color:var(--accent)] border-[color:var(--accent)] text-white"
          : "bg-white border-[rgba(var(--leaf-rgb),0.35)] text-[color:var(--muted)]";

        return (
          <li key={`${label}-${index}`} className="relative pl-4">
            <span
              aria-hidden
              className={`absolute left-[-2.25rem] top-1 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold ${dotColor}`}
            >
              {isCompleted ? "✓" : index + 1}
            </span>
            <div className="rounded-xl border border-[rgba(var(--leaf-rgb),0.15)] bg-white/95 p-3 shadow-[0_6px_16px_rgba(15,23,42,0.08)]">
              <p className="text-sm font-semibold text-[color:var(--foreground)]">{label}</p>
              {detail && <p className="mt-1 text-xs text-[color:var(--muted)]">{detail}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[color:var(--muted)]">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
                    isCompleted
                      ? "bg-[rgba(var(--leaf-rgb),0.14)] text-[color:var(--leaf)]"
                      : isActive
                      ? "bg-[rgba(var(--accent-rgb),0.18)] text-[color:var(--accent)]"
                      : "bg-[rgba(var(--leaf-rgb),0.08)] text-[color:var(--muted)]"
                  }`}
                >
                  {isCompleted ? "Completed" : isActive ? "In progress" : "Pending"}
                </span>
                {displayTimestamp && <span>{displayTimestamp}</span>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

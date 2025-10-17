"use client";

// Ensure deterministic SSR/CSR by defaulting to false for loading/disabled.
export default function LoadMoreButton({ onClick, loading = false, disabled = false }) {
  return (
    <div className="mt-8 flex justify-center">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        className="inline-flex items-center gap-2 rounded-full bg-[color:var(--primary)] text-[color:var(--surface)] px-5 py-2.5 shadow hover:bg-[color:var(--leaf)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        <span>{loading ? "Loading…" : "Load more"}</span>
      </button>
    </div>
  );
}

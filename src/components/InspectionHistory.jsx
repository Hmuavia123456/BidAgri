"use client";

import React, { useState } from "react";
import { InspectionCard, InspectionModal } from "@/components/InspectionCard";

export default function InspectionHistory({ qa }) {
  const [openItem, setOpenItem] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const inspections = qa?.inspections || [];
  const visible = expanded ? inspections : inspections.slice(0, 1);
  const remaining = Math.max(0, inspections.length - visible.length);
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[color:var(--muted)]">Verified inspections: {inspections.length}</p>
        {inspections.length > 1 && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-sm font-medium text-[color:var(--primary)] hover:text-[color:var(--secondary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--primary)] rounded"
            aria-expanded={expanded}
            aria-controls="inspection-list"
          >
            {expanded ? "Collapse" : `Expand (+${remaining})`}
          </button>
        )}
      </div>
      <div id="inspection-list" className="mt-3 space-y-3">
        {visible.map((insp) => (
          <div key={insp.id}>
            <InspectionCard item={insp} onOpen={setOpenItem} />
            <InspectionModal open={openItem?.id === insp.id} item={openItem} onClose={() => setOpenItem(null)} />
          </div>
        ))}
        {inspections.length === 0 && (
          <p className="text-sm text-[color:var(--muted)]">No inspection records yet.</p>
        )}
      </div>
    </div>
  );
}

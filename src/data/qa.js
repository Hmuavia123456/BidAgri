// Client-side stubs for QA/inspection history and delivery milestones

export const DELIVERY_STEPS = ["Ordered", "Packed", "In transit", "Delivered"];

// Simple mock database keyed by product id
const QA_DB = {
  almonds: {
    grade: "A",
    verified: true,
    inspections: [
      {
        id: "almonds-1",
        inspector: "Ali Raza",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        note: "Moisture 10%. Kernel count and size within spec. No aflatoxin detected.",
        images: [
          "https://images.unsplash.com/photo-1604762524889-3b58f6e0ff0b?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      {
        id: "almonds-2",
        inspector: "Sajid Mehmood",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        note: "Color uniformity verified. Packaging sealed with tamper-evident tape.",
        images: [
          "https://images.unsplash.com/photo-1604762525399-0d954965221c?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    delivery: { current: 2, eta: "Arrives in 3 days" },
  },
  mango: {
    grade: "A-",
    verified: true,
    inspections: [
      {
        id: "mango-1",
        inspector: "Tariq Khan",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
        note: "Firmness and Brix at 13°. No bruising observed on sampled cartons.",
        images: [
          "https://images.unsplash.com/photo-1542834369-f10ebf06d3cb?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    delivery: { current: 1, eta: "Packed today • ETA 4 days" },
  },
  rice: {
    grade: "B+",
    verified: true,
    inspections: [
      {
        id: "rice-1",
        inspector: "Ali Raza",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
        note: "Broken ratio 3%. Moisture 11.2%. Fumigation certificate attached.",
        images: [
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    delivery: { current: 0, eta: "Order confirmed • ETA 6 days" },
  },
};

export function getQAForProduct(id) {
  const fallback = {
    grade: "A",
    verified: true,
    inspections: [
      {
        id: `${id}-insp-1`,
        inspector: "Quality Team",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
        note: "Visual inspection passed. Random sampling matched declared spec.",
        images: [
          "https://images.unsplash.com/photo-1604762525716-3ee1ce8593f0?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    ],
    delivery: { current: 1, eta: "Processing • ETA 5 days" },
  };

  const entry = QA_DB[id] || fallback;
  // Always include shared delivery steps
  return { ...entry, steps: DELIVERY_STEPS };
}

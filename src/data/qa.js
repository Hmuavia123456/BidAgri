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
        images: ["/images/inspection-quality.svg"],
      },
      {
        id: "almonds-2",
        inspector: "Sajid Mehmood",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        note: "Color uniformity verified. Packaging sealed with tamper-evident tape.",
        images: ["/images/inspection-quality.svg"],
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
        images: ["/images/inspection-quality.svg"],
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
        images: ["/images/inspection-quality.svg"],
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
        images: ["/images/inspection-quality.svg"],
      },
    ],
    delivery: { current: 1, eta: "Processing • ETA 5 days" },
  };

  const entry = QA_DB[id] || fallback;
  // Always include shared delivery steps
  return { ...entry, steps: DELIVERY_STEPS };
}

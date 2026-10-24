import type { SizeGuide } from "@/types";

export const mockSizeGuides: Record<string, SizeGuide> = {
  tops: {
    id: "tops",
    title: "Shirts — Size Guide",
    unit: "inches",
    columns: ["Size", "Chest", "Length", "Shoulder", "Sleeve"],
    rows: [
      ["S", "38", "28", "17", "24"],
      ["M", "40", "29", "17.5", "24.5"],
      ["L", "42", "30", "18", "25"],
      ["XL", "44", "31", "18.5", "25.5"],
      ["XXL", "46", "32", "19", "26"],
    ],
    notes: ["Measurements are of the garment laid flat.", "Between sizes? Choose the larger size for a relaxed fit."],
  },
  bottoms: {
    id: "bottoms",
    title: "Pants — Size Guide",
    unit: "inches",
    columns: ["Size", "Waist", "Hip", "Inseam", "Leg opening"],
    rows: [
      ["30", "30", "39", "30", "14"],
      ["32", "32", "41", "31", "14.5"],
      ["34", "34", "43", "31", "15"],
      ["36", "36", "45", "32", "15.5"],
      ["38", "38", "47", "32", "16"],
    ],
    notes: ["Waist measured at the waistband.", "Hemming is not included with demo orders."],
  },
  shoes: {
    id: "shoes",
    title: "Sneakers — Size Guide",
    unit: "cm",
    columns: ["EU", "UK", "US", "Foot length"],
    rows: [
      ["39", "6", "7", "24.5"],
      ["40", "6.5", "7.5", "25"],
      ["41", "7.5", "8.5", "26"],
      ["42", "8", "9", "26.5"],
      ["43", "9", "10", "27.5"],
      ["44", "9.5", "10.5", "28"],
    ],
    notes: ["Measure your foot from heel to longest toe.", "If you are between sizes, size up."],
  },
  belts: {
    id: "belts",
    title: "Belts — Size Guide",
    unit: "inches",
    columns: ["Size", "Fits waist", "Total length"],
    rows: [
      ["32", "30–32", "38"],
      ["34", "32–34", "40"],
      ["36", "34–36", "42"],
      ["38", "36–38", "44"],
    ],
    notes: ["Choose one size up from your pant waist size."],
  },
};

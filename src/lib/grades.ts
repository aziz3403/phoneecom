export type GradeId = "pristine" | "excellent" | "good" | "fair";

export interface Grade {
  id: GradeId;
  /** customer-facing name */
  label: string;
  /** matching warehouse-sheet grade letters */
  sheet: string;
  tagline: string;
  cosmetic: string;
  /** Amazon-Renewed-style per-area condition standards */
  screen: string;
  body: string;
  battery: string;
  /** primary hex used for badges, rings and the 3D wear overlay */
  hex: string;
  /** softer companion hex */
  hexSoft: string;
  score: number; // 1..4
  savings: string; // typical headline saving vs new
}

/**
 * Four-tier condition grading (New / Excellent / Good / Fair), defined in the
 * Amazon Renewed style with explicit screen/body/battery standards. Each grade
 * maps to our warehouse sheet letters (New, A+/A/AB, B, C). Every device —
 * whatever the grade — is fully functional, works like new, and ships with a
 * battery above 80% of original capacity.
 *
 * NOTE: the internal id "pristine" is the top grade; its customer-facing label
 * is "New". The id is kept stable so existing data/keys don't churn.
 */
export const GRADES: Record<GradeId, Grade> = {
  pristine: {
    id: "pristine",
    label: "New",
    sheet: "New",
    tagline: "Brand new, factory sealed",
    cosmetic: "Brand-new condition — no marks anywhere, sealed and unused.",
    screen: "Flawless — no scratches or marks.",
    body: "No cosmetic wear at all; indistinguishable from new.",
    battery: "100% — a brand-new battery.",
    hex: "#34e6a8",
    hexSoft: "#6ff7c8",
    score: 4,
    savings: "Sealed in box",
  },
  excellent: {
    id: "excellent",
    label: "Excellent",
    sheet: "A+ · A · AB",
    tagline: "Looks new from a foot away",
    cosmetic: "No screen scratches and no cosmetic damage visible from 12 inches.",
    screen: "No scratches.",
    body: "No signs of cosmetic damage visible when held 12 inches away.",
    battery: "Above 80% of original capacity.",
    hex: "#38d1ff",
    hexSoft: "#7fe7ff",
    score: 3,
    savings: "Save up to 30%",
  },
  good: {
    id: "good",
    label: "Good",
    sheet: "B",
    tagline: "Light, barely-visible wear",
    cosmetic: "No screen scratches; light body scratches barely visible at 12 inches.",
    screen: "No scratches.",
    body: "Light scratches, barely visible at 12 inches and imperceptible to touch.",
    battery: "Above 80% of original capacity.",
    hex: "#f5c451",
    hexSoft: "#ffe0a3",
    score: 2,
    savings: "Save up to 45%",
  },
  fair: {
    id: "fair",
    label: "Fair",
    sheet: "C",
    tagline: "Honest wear, biggest savings",
    cosmetic: "A few shallow screen scratches (invisible when on); body scratches visible at 12 inches.",
    screen: "May have a few shallow scratches, invisible when the screen is on.",
    body: "Light scratches, clearly visible at 12 inches and perceptible to touch.",
    battery: "Above 80% of original capacity.",
    hex: "#fb923c",
    hexSoft: "#fdba74",
    score: 1,
    savings: "Save up to 60%",
  },
};

export const GRADE_ORDER: GradeId[] = ["pristine", "excellent", "good", "fair"];

export function grade(id: GradeId): Grade {
  return GRADES[id];
}

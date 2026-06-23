export type GradeId = "pristine" | "excellent" | "good" | "fair";

export interface Grade {
  id: GradeId;
  label: string;
  tagline: string;
  cosmetic: string;
  /** primary hex used for badges, rings and the 3D wear overlay */
  hex: string;
  /** softer companion hex */
  hexSoft: string;
  score: number; // 1..4
  savings: string; // typical headline saving vs new
}

/**
 * Four-tier cosmetic grading, modeled on the clearest consumer systems
 * (Back Market's Fair/Good/Excellent/Premium). Every device, regardless of
 * cosmetic grade, is fully functional and certified across 50+ checkpoints.
 */
export const GRADES: Record<GradeId, Grade> = {
  pristine: {
    id: "pristine",
    label: "Pristine",
    tagline: "Indistinguishable from new",
    cosmetic: "Zero visible scratches or marks. Screen and frame flawless under any light.",
    hex: "#34e6a8",
    hexSoft: "#6ff7c8",
    score: 4,
    savings: "Save up to 15%",
  },
  excellent: {
    id: "excellent",
    label: "Excellent",
    tagline: "Looks new from arm's length",
    cosmetic: "Only the faintest micro-marks, invisible during everyday use.",
    hex: "#38d1ff",
    hexSoft: "#7fe7ff",
    score: 3,
    savings: "Save up to 30%",
  },
  good: {
    id: "good",
    label: "Good",
    tagline: "Light, honest wear",
    cosmetic: "Minor visible scratches on frame or back. Screen remains clean.",
    hex: "#f5c451",
    hexSoft: "#ffe0a3",
    score: 2,
    savings: "Save up to 45%",
  },
  fair: {
    id: "fair",
    label: "Fair",
    tagline: "Maximum value, more character",
    cosmetic: "Noticeable scuffs and scratches. Works perfectly — priced to move.",
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

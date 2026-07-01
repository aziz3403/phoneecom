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
  /** reassurance that the device is fully working, whatever the cosmetic grade */
  functional: string;
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
    cosmetic: "Brand-new condition — no marks anywhere, sealed and unused. Fully functional and works exactly like new.",
    screen: "Flawless — no scratches or marks.",
    body: "No cosmetic wear at all; indistinguishable from new.",
    battery: "100% — a brand-new battery.",
    functional: "100% functional — works exactly like new (because it is).",
    hex: "#34e6a8",
    hexSoft: "#6ff7c8",
    score: 4,
    savings: "Sealed in box",
  },
  excellent: {
    id: "excellent",
    label: "Excellent",
    sheet: "A+ · A",
    tagline: "Looks like new — works like new",
    cosmetic: "Practically flawless — no screen scratches and no cosmetic marks you'd notice from a foot away. Fully tested and works exactly like new.",
    screen: "No scratches.",
    body: "No signs of wear visible when held at arm's length.",
    battery: "Above 80% of original capacity.",
    functional: "Passes our 50-point test — 100% functional, works exactly like new.",
    hex: "#38d1ff",
    hexSoft: "#7fe7ff",
    score: 3,
    savings: "Save up to 30%",
  },
  good: {
    id: "good",
    label: "Good",
    sheet: "AB",
    tagline: "Gently used — works like new",
    cosmetic: "Light signs of everyday use — a few small marks, maybe a faint scratch — with a clear, fully-working screen. Fully tested and works exactly like new.",
    screen: "Clear and fully working; any marks are faint and easy to miss.",
    body: "A few light marks from normal use — nothing that affects how it works.",
    battery: "Above 80% of original capacity.",
    functional: "Passes our 50-point test — 100% functional, works exactly like new.",
    hex: "#f5c451",
    hexSoft: "#ffe0a3",
    score: 2,
    savings: "Save up to 45%",
  },
  fair: {
    id: "fair",
    label: "Fair",
    sheet: "B · C",
    tagline: "Honest wear — works like new, biggest savings",
    cosmetic: "More visible marks and scratches up close from real-world use — but always crack-free, and it works exactly like new. The smart pick for maximum savings.",
    screen: "May have light scratches; always clear and fully working when the screen is on.",
    body: "Visible scratches and marks from everyday use — never any cracks or chips.",
    battery: "Above 80% of original capacity.",
    functional: "Passes our 50-point test — 100% functional, works exactly like new.",
    hex: "#fb923c",
    hexSoft: "#fdba74",
    score: 1,
    savings: "Save up to 60%",
  },
};

/** Real condition photos per grade (main · back · screen · edge) — a 2×2 set. */
export const GRADE_PHOTOS: Record<GradeId, string[]> = {
  pristine: [
    "/grades/new-main.png",
    "/grades/new-back.png",
    "/grades/new-screen.png",
    "/grades/new-edge.png",
  ],
  excellent: [
    "/grades/excellent-main.png",
    "/grades/excellent-back.png",
    "/grades/excellent-screen.png",
    "/grades/excellent-edge.png",
  ],
  good: [
    "/grades/good-main.png",
    "/grades/good-back.png",
    "/grades/good-screen.png",
    "/grades/good-edge.png",
  ],
  fair: [
    "/grades/fair-main.png",
    "/grades/fair-back.png",
    "/grades/fair-screen.png",
    "/grades/fair-edge.png",
  ],
};

export const GRADE_ORDER: GradeId[] = ["pristine", "excellent", "good", "fair"];

export function grade(id: GradeId): Grade {
  return GRADES[id];
}

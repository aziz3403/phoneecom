import type { GradeId } from "@/lib/grades";
import { cn } from "@/lib/utils";

// Deterministic PRNG so marks are identical on server & client (no hydration drift).
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Scratch {
  x: number;
  y: number;
  len: number;
  angle: number;
  w: number;
  o: number;
}
interface Scuff {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  o: number;
}

const INTENSITY: Record<GradeId, number> = { pristine: 0, excellent: 0.28, good: 0.62, fair: 1 };

function build(grade: GradeId, seed: number): { scratches: Scratch[]; scuffs: Scuff[] } {
  const intensity = INTENSITY[grade];
  if (intensity === 0) return { scratches: [], scuffs: [] };
  const rand = mulberry32(seed);
  const nScr = Math.round(2 + intensity * 16);
  const nScuff = Math.round(intensity * 7);
  const scratches: Scratch[] = [];
  for (let i = 0; i < nScr; i++) {
    scratches.push({
      x: 8 + rand() * 84,
      y: 6 + rand() * 88,
      len: 3 + rand() * (6 + intensity * 22),
      angle: rand() * 180,
      w: 0.25 + rand() * 0.5,
      o: 0.12 + rand() * 0.33 * intensity,
    });
  }
  const scuffs: Scuff[] = [];
  for (let i = 0; i < nScuff; i++) {
    // bias scuffs toward corners/edges
    const edge = rand();
    const cx = edge < 0.5 ? 6 + rand() * 24 + (rand() > 0.5 ? 64 : 0) : 15 + rand() * 70;
    const cy = 8 + rand() * 84;
    scuffs.push({ cx, cy, rx: 3 + rand() * 9, ry: 2 + rand() * 7, o: 0.06 + rand() * 0.16 * intensity });
  }
  return { scratches, scuffs };
}

// Precompute once per grade (module scope) — stable across renders.
const MARKS: Record<GradeId, { scratches: Scratch[]; scuffs: Scuff[] }> = {
  pristine: build("pristine", 1),
  excellent: build("excellent", 7),
  good: build("good", 23),
  fair: build("fair", 91),
};

/** Surface scuffs & scratches that intensify with worse cosmetic grade.
 *  Pass a stable `seed` to vary the mark pattern per tile (e.g. a gallery of
 *  examples) — omit it to use the shared per-grade pattern. */
export function WearOverlay({
  grade,
  seed,
  className,
}: {
  grade: GradeId;
  seed?: number;
  className?: string;
}) {
  const { scratches, scuffs } = seed === undefined ? MARKS[grade] : build(grade, seed);
  if (!scratches.length && !scuffs.length) return null;
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ mixBlendMode: "overlay" }}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        {scuffs.map((s, i) => (
          <ellipse key={`f${i}`} cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill="#ffffff" opacity={s.o} />
        ))}
        {scratches.map((s, i) => {
          const rad = (s.angle * Math.PI) / 180;
          const x2 = s.x + Math.cos(rad) * s.len;
          const y2 = s.y + Math.sin(rad) * s.len;
          return (
            <line
              key={`s${i}`}
              x1={s.x}
              y1={s.y}
              x2={x2}
              y2={y2}
              stroke="#ffffff"
              strokeWidth={s.w}
              strokeLinecap="round"
              opacity={s.o}
            />
          );
        })}
      </svg>
    </div>
  );
}

interface LeafProps {
  size?: number;
  /** colour of the centre vein stroke (defaults to white for accent backgrounds) */
  vein?: string;
  className?: string;
}

/** The reMint leaf mark — a single shape used in the logo, drawer and impact section. */
export function Leaf({ size = 19, vein = "#fff", className }: LeafProps) {
  return (
    <span className={className ?? "logoleaf"}>
      <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
        <path d="M12 3C5.5 8 5.5 16 12 21C18.5 16 18.5 8 12 3Z" fill="currentColor" />
        <path d="M12 5.5V19" stroke={vein} strokeWidth="1.1" opacity=".55" />
      </svg>
    </span>
  );
}

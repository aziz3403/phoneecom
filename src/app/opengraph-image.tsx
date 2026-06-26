import { ImageResponse } from "next/og";

export const alt = "reMint — certified pre-owned phones, retail & wholesale";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #07070f 0%, #241066 48%, #04040a 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg, #7430ff, #38d1ff)",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 44, fontWeight: 800, display: "flex" }}>reMint</div>
        </div>
        <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1.04, marginTop: 44, display: "flex" }}>
          Premium phones,
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            lineHeight: 1.04,
            display: "flex",
            background: "linear-gradient(90deg,#a886ff,#7fe7ff,#6ff7c8)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          half the price.
        </div>
        <div style={{ fontSize: 32, color: "#b9b3e0", marginTop: 28, display: "flex" }}>
          Certified pre-owned · iPhone, Galaxy & iPad · retail & wholesale
        </div>
        <div style={{ display: "flex", gap: "14px", marginTop: 40 }}>
          {["12-month warranty", "50-point inspection", "Free 2-day shipping"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                padding: "12px 24px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                fontSize: 26,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}

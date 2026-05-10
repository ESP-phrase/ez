import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PolyGoat — AI Trading Tools for Polymarket & Kalshi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "linear-gradient(135deg, #040a14 0%, #060e1f 50%, #040a14 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow orbs */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -120,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(37,99,235,0.25)",
            filter: "blur(80px)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(124,58,237,0.18)",
            filter: "blur(80px)",
            display: "flex",
          }}
        />

        {/* Logo row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #2563eb, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
            }}
          >
            🐐
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
            <span style={{ fontSize: 38, fontWeight: 800, color: "white", letterSpacing: "-1px" }}>
              Poly
            </span>
            <span style={{ fontSize: 38, fontWeight: 800, color: "#60a5fa", letterSpacing: "-1px" }}>
              Goat
            </span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "baseline",
            gap: 18,
            maxWidth: 960,
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 76, fontWeight: 900, color: "white", letterSpacing: "-3px", lineHeight: 1 }}>
            Be the
          </span>
          <span style={{ fontSize: 76, fontWeight: 900, color: "#60a5fa", letterSpacing: "-3px", lineHeight: 1 }}>
            GOAT
          </span>
          <span style={{ fontSize: 76, fontWeight: 900, color: "white", letterSpacing: "-3px", lineHeight: 1 }}>
            on prediction markets
          </span>
        </div>

        {/* Subtext */}
        <div
          style={{
            display: "flex",
            fontSize: 24,
            color: "rgba(255,255,255,0.45)",
            textAlign: "center",
            marginBottom: 52,
          }}
        >
          AI analysis · Expert picks · Copy trading · Live BTC signals
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 56, alignItems: "center" }}>
          {[
            { value: "300+", label: "Active Traders" },
            { value: "4.9/5", label: "User Rating" },
            { value: "$4.2M+", label: "Tracked Volume" },
            { value: "<10s", label: "AI Analysis" },
          ].map((s) => (
            <div
              key={s.label}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
            >
              <span style={{ fontSize: 30, fontWeight: 800, color: "#60a5fa" }}>
                {s.value}
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Domain tag */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            right: 48,
            display: "flex",
            fontSize: 18,
            color: "rgba(255,255,255,0.2)",
            fontWeight: 600,
          }}
        >
          polygoat.io
        </div>
      </div>
    ),
    { ...size }
  );
}

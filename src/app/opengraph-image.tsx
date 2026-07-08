import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ReadMeForge — AI README Generator for Developers";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          backgroundColor: "#0a0a0a",
          padding: "60px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}>
          <span style={{ color: "#f59e0b", fontSize: "44px", fontWeight: "bold" }}>ReadMe</span>
          <span style={{ color: "#ffffff", fontSize: "44px", fontWeight: "bold" }}>Forge</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <h1
            style={{
              display: "flex",
              fontSize: "58px",
              fontWeight: "800",
              color: "#ffffff",
              lineHeight: 1.1,
              margin: "0 0 20px 0",
            }}
          >
            Ship Docs as Fast as Code
          </h1>
          <p style={{ display: "flex", fontSize: "26px", color: "#a1a1aa", margin: 0 }}>
            AI-generated READMEs scored 0–100. Paste a repo URL, get a production-ready README.
          </p>
        </div>

        <div style={{ display: "flex", gap: "16px", marginTop: "40px" }}>
          {["AI Generated", "Quality Score", "One Click", "Free Tier"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#18181b",
                borderRadius: "8px",
                padding: "10px 20px",
                color: "#f59e0b",
                fontSize: "18px",
                border: "1px solid #27272a",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

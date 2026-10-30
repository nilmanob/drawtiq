import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/seo";

// Default share image for every page (pages can add their own later).
export const alt = "Drawtiq — independent design studio for digital products and brands";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// The Node build of the image renderer cannot locate its bundled font when the
// project path contains a space (common on Windows); the edge build can.
export const runtime = "edge";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#f5f3ed",
          color: "#171916",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 22, height: 22, borderRadius: 999, background: "#c8ff43", border: "2px solid #171916" }} />
          <div style={{ fontSize: 30, letterSpacing: 6, textTransform: "uppercase", color: "#666960" }}>
            Independent design studio
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 112, fontWeight: 800, letterSpacing: -5, lineHeight: 1 }}>
            Drawtiq
          </div>
          <div style={{ marginTop: 26, fontSize: 46, lineHeight: 1.15, maxWidth: 900 }}>
            Design that moves brands forward.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#666960" }}>
          <div>UI/UX · Brand identity · Graphic · Motion · Video</div>
          <div style={{ background: "#c8ff43", color: "#20251a", padding: "10px 22px", borderRadius: 4 }}>
            {new URL(SITE_URL).host}
          </div>
        </div>
      </div>
    ),
    size
  );
}

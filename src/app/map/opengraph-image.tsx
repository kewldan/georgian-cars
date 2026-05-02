import { ImageResponse } from "next/og";
import { ASH, INK, LIME, Mark, OG_CONTENT_TYPE, OG_SIZE, OGShell, PAPER, Wordmark } from "@/lib/og";
import { loadOgFonts } from "@/lib/og-fonts";

export const alt = "GeorgianCars — Map";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  const fonts = await loadOgFonts();
  return new ImageResponse(
    <OGShell topLabel="GEORGIANCARS · MAP" pageNumber="GEORGIA · 8 CITIES">
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "space-between",
          gap: 40,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 600 }}>
          <div style={{ display: "flex" }}>
            <Wordmark size={80} />
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: 56,
              fontWeight: 800,
              color: PAPER,
              letterSpacing: "-0.03em",
            }}
          >
            On the <span style={{ color: LIME, marginLeft: 16 }}>map.</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 16,
              fontSize: 22,
              fontWeight: 500,
              color: ASH,
              letterSpacing: "-0.01em",
            }}
          >
            Tbilisi · Batumi · Kutaisi · Rustavi · Gori · Zugdidi · Poti · Telavi
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: 360,
            height: 360,
            background: "#0f1812",
            border: `1px solid ${INK}`,
            borderRadius: 24,
            position: "relative",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="360"
            height="360"
            viewBox="0 0 360 360"
            xmlns="http://www.w3.org/2000/svg"
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            <title>map</title>
            <g stroke="#1f2a22" strokeWidth="2" fill="none">
              <path d="M0 140 Q120 90 220 160 T360 110" />
              <path d="M70 0 Q100 110 70 220 T120 360" />
              <path d="M260 0 L300 360" />
              <path d="M0 260 Q160 240 360 280" />
            </g>
          </svg>
          <div style={{ display: "flex", position: "absolute", top: 90, left: 130 }}>
            <Mark size={88} />
          </div>
          <div style={{ display: "flex", position: "absolute", top: 60, left: 60, opacity: 0.7 }}>
            <Mark size={48} />
          </div>
          <div style={{ display: "flex", position: "absolute", top: 230, left: 250, opacity: 0.7 }}>
            <Mark size={48} />
          </div>
        </div>
      </div>
    </OGShell>,
    { ...size, fonts }
  );
}

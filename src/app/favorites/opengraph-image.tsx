import { ImageResponse } from "next/og";
import { ASH, LIME, Mark, OG_CONTENT_TYPE, OG_SIZE, OGShell, PAPER, Wordmark } from "@/lib/og";

export const alt = "GeorgianCars — Favorites";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return new ImageResponse(
    <OGShell topLabel="GEORGIANCARS · FAVORITES" pageNumber="SAVED CARS">
      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          gap: 64,
        }}
      >
        <Mark size={220} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex" }}>
            <Wordmark size={88} />
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
            Your <span style={{ color: LIME, marginLeft: 16 }}>shortlist.</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 16,
              fontSize: 22,
              fontWeight: 500,
              color: ASH,
              letterSpacing: "-0.01em",
              maxWidth: 640,
            }}
          >
            Cars you saved with the heart icon — stays with you across sessions.
          </div>
        </div>
      </div>
    </OGShell>,
    { ...size }
  );
}

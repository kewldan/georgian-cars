import { ImageResponse } from "next/og";
import { LIME, Mark, OG_CONTENT_TYPE, OG_SIZE, OGShell, PAPER } from "@/lib/og";

export const alt = "GeorgianCars";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return new ImageResponse(
    <OGShell topLabel="GEORGIANCARS · BRAND" pageNumber="LOGO · BOOK · 2025">
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Mark size={260} />
        <div
          style={{
            display: "flex",
            marginTop: 48,
            gap: 18,
            fontFamily: "monospace",
            fontSize: 18,
            fontWeight: 700,
            letterSpacing: "0.22em",
            color: LIME,
          }}
        >
          <span>FIND</span>
          <span style={{ color: PAPER, opacity: 0.3 }}>·</span>
          <span>LOCAL</span>
          <span style={{ color: PAPER, opacity: 0.3 }}>·</span>
          <span>DRIVE</span>
        </div>
      </div>
    </OGShell>,
    { ...size }
  );
}

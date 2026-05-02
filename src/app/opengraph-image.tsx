import { ImageResponse } from "next/og";
import { ASH, LIME, Mark, OG_CONTENT_TYPE, OG_SIZE, OGShell, PAPER, Wordmark } from "@/lib/og";

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
        <Mark size={220} />
        <div style={{ display: "flex", marginTop: 40 }}>
          <Wordmark size={104} />
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 26,
            fontWeight: 500,
            color: ASH,
            letterSpacing: "-0.01em",
          }}
        >
          Авто из Telegram-каналов Грузии · нормализовано ИИ
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
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

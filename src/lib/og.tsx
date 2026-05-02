import type { ReactNode } from "react";

export const LIME = "#d4ff3a";
export const INK = "#0a0a0a";
export const PAPER = "#fafaf9";
export const ASH = "#737373";
export const SLATE = "#171717";
export const FAINT = "#262626";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

export function Mark({ size = 120 }: { size?: number }) {
  const w = (size * 36) / 48;
  return (
    <svg width={w} height={size} viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg">
      <title>GeorgianCars</title>
      <path d="M18 0 C28 0 36 8 36 18 C36 30 18 48 18 48 C18 48 0 30 0 18 C0 8 8 0 18 0 Z" fill={LIME} />
      <circle cx="18" cy="18" r="13" fill={INK} />
      <path d="M28 8 L8 18 L16 21 L18 28 L28 8 Z" fill={LIME} />
      <path d="M28 8 L16 21 L18 28 Z" fill={LIME} fillOpacity="0.4" />
    </svg>
  );
}

export function CornerBrackets() {
  const stroke = LIME;
  return (
    <svg
      width="1200"
      height="630"
      viewBox="0 0 1200 630"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: "absolute", top: 0, left: 0 }}
    >
      <title>frame</title>
      <g stroke={stroke} strokeWidth="2" fill="none">
        <path d="M50 50 L50 90 M50 50 L90 50" />
        <path d="M1150 50 L1150 90 M1150 50 L1110 50" />
        <path d="M50 580 L50 540 M50 580 L90 580" />
        <path d="M1150 580 L1150 540 M1150 580 L1110 580" />
      </g>
      <g opacity="0.05" stroke={LIME} strokeWidth="1">
        {Array.from({ length: 21 }, (_, i) => i * 60).map((x) => (
          <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="630" />
        ))}
        {Array.from({ length: 12 }, (_, i) => i * 60).map((y) => (
          <line key={`h-${y}`} y1={y} x1="0" y2={y} x2="1200" />
        ))}
      </g>
    </svg>
  );
}

export function Wordmark({ size = 88 }: { size?: number }) {
  return (
    <div
      style={{
        display: "flex",
        fontSize: size,
        fontWeight: 800,
        letterSpacing: "-0.03em",
        color: PAPER,
        lineHeight: 1,
      }}
    >
      <span>Georgian</span>
      <span style={{ color: LIME }}>Cars</span>
    </div>
  );
}

export function MonoLabel({ children, color = ASH }: { children: ReactNode; color?: string }) {
  return (
    <div
      style={{
        display: "flex",
        fontFamily: "monospace",
        fontSize: 18,
        letterSpacing: "0.22em",
        fontWeight: 700,
        color,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

export function OGShell({
  children,
  showBrackets = true,
  topLabel,
  pageNumber,
}: {
  children: ReactNode;
  showBrackets?: boolean;
  topLabel?: string;
  pageNumber?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: INK,
        color: PAPER,
        display: "flex",
        flexDirection: "column",
        padding: 80,
        fontFamily: "sans-serif",
        position: "relative",
      }}
    >
      {showBrackets ? <CornerBrackets /> : null}
      {topLabel || pageNumber ? (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <MonoLabel>{topLabel ?? "GeorgianCars"}</MonoLabel>
          <MonoLabel>{pageNumber ?? "Авто · Telegram · GE"}</MonoLabel>
        </div>
      ) : null}
      {children}
    </div>
  );
}

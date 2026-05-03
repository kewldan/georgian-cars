import { ImageResponse } from "next/og";
import { apiServer } from "@/lib/api-server";
import { FX, type Listing } from "@/lib/data";
import { ASH, INK, LIME, Mark, OG_CONTENT_TYPE, OG_SIZE, OGShell, PAPER, SLATE } from "@/lib/og";
import { loadOgFonts } from "@/lib/og-fonts";
import { type PriceRating, RATING_META } from "@/lib/rating";
import { fmt } from "@/lib/utils";

export const alt = "GeorgianCars listing";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

const ratingOgLabel: Record<PriceRating, string> = {
  great: "GREAT DEAL",
  good: "GOOD PRICE",
  fair: "FAIR PRICE",
  high: "ABOVE MARKET",
  overpriced: "OVERPRICED",
};

function formatKmCompact(n: number) {
  return `${Math.round(n / 1000)}k km`;
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await apiServer<Listing>(`/listings/${encodeURIComponent(id)}`);
  const fonts = await loadOgFonts();

  if (!listing) {
    return new ImageResponse(
      <OGShell topLabel="GEORGIANCARS · LISTING" pageNumber="NOT FOUND">
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <Mark size={200} />
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 28,
              color: ASH,
            }}
          >
            Listing not found
          </div>
        </div>
      </OGShell>,
      { ...size, fonts }
    );
  }

  const rating = RATING_META[listing.priceRating];
  const ratingLabelText = ratingOgLabel[listing.priceRating];

  return new ImageResponse(
    <OGShell topLabel={`GEORGIANCARS · ${listing.id}`} pageNumber={listing.channel.name.toUpperCase()}>
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: 56,
          marginTop: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <Mark size={64} />

          <div
            style={{
              display: "flex",
              marginTop: 32,
              fontSize: 64,
              fontWeight: 800,
              color: PAPER,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {listing.make} {listing.model}
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 16,
              fontFamily: "monospace",
              fontSize: 22,
              fontWeight: 600,
              color: ASH,
              letterSpacing: "0.02em",
              gap: 14,
            }}
          >
            <span>{listing.year}</span>
            <span style={{ color: PAPER, opacity: 0.3 }}>·</span>
            <span>{listing.body}</span>
            <span style={{ color: PAPER, opacity: 0.3 }}>·</span>
            <span>{listing.fuel === "Electric" ? "EV" : `${listing.engine}L`}</span>
            <span style={{ color: PAPER, opacity: 0.3 }}>·</span>
            <span>{formatKmCompact(listing.mileage)}</span>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontFamily: "monospace",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: LIME,
            }}
          >
            {listing.city.toUpperCase()} · GEORGIA
          </div>

          <div style={{ display: "flex", flex: 1 }} />

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 20,
              paddingTop: 28,
              borderTop: `2px solid ${SLATE}`,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 80,
                fontWeight: 800,
                color: PAPER,
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              {fmt.price(listing.price, "USD", FX)}
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "monospace",
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: "0.18em",
                color: rating.color,
              }}
            >
              {ratingLabelText}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: 420,
            height: 420,
            borderRadius: 20,
            overflow: "hidden",
            border: `2px solid ${SLATE}`,
            position: "relative",
            alignSelf: "center",
            background: INK,
          }}
        >
          {/* biome-ignore lint/performance/noImgElement: ImageResponse/Satori does not support next/image */}
          <img
            src={listing.photos[0]}
            alt=""
            width={420}
            height={420}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          {listing.vinChecked ? (
            <div
              style={{
                display: "flex",
                position: "absolute",
                top: 16,
                left: 16,
                background: LIME,
                color: INK,
                fontFamily: "monospace",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: "0.2em",
                padding: "6px 12px",
                borderRadius: 4,
              }}
            >
              VIN OK
            </div>
          ) : null}
        </div>
      </div>
    </OGShell>,
    { ...size, fonts }
  );
}

import { ImageResponse } from "next/og";
import { FX, LISTINGS } from "@/lib/data";
import { ASH, INK, LIME, Mark, OG_CONTENT_TYPE, OG_SIZE, OGShell, PAPER, SLATE, Wordmark } from "@/lib/og";
import { PRICE_BAR_GRADIENT, type PriceRating, RATING_META } from "@/lib/rating";
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
  const listing = LISTINGS.find((l) => l.id === id);

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
          <Mark size={180} />
          <div style={{ display: "flex", marginTop: 32 }}>
            <Wordmark size={72} />
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: 28,
              color: ASH,
            }}
          >
            Listing not found
          </div>
        </div>
      </OGShell>,
      { ...size }
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
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Mark size={68} />
            <Wordmark size={36} />
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 36,
              fontSize: 80,
              fontWeight: 800,
              color: PAPER,
              letterSpacing: "-0.04em",
              lineHeight: 1,
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
              flexDirection: "column",
              gap: 14,
              paddingTop: 28,
              borderTop: `2px solid ${SLATE}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 88,
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

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginTop: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flex: 1,
                  height: 8,
                  borderRadius: 4,
                  background: PRICE_BAR_GRADIENT,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    position: "absolute",
                    top: -3,
                    left: `${rating.pct}%`,
                    width: 4,
                    height: 14,
                    background: PAPER,
                    borderRadius: 2,
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "monospace",
                  fontSize: 16,
                  color: ASH,
                }}
              >
                fair {fmt.price(Math.round(listing.fairPrice), "USD", FX)}
              </div>
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
              VIN ✓
            </div>
          ) : null}
        </div>
      </div>
    </OGShell>,
    { ...size }
  );
}

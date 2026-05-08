# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **bun** (see `bun.lock`, `Dockerfile`). `pnpm`/`npm` work too.

- `bun dev` — Next.js dev server (default port 3000). Requires the backend on `http://localhost:8080` for live data; `next.config.ts` rewrites `/api/:path*` → `http://localhost:8080/:path*`.
- `bun run build` — production build. `bun run start` runs `next start -p 80` (used in the Docker image).
- `bun run lint` / `bun run lint:fix` — Biome check (lint + format). `bun run format` formats only.
- No test runner is configured.

## Architecture

Next.js 15 App Router + React 19 (with React Compiler enabled in `next.config.ts`). Strict TypeScript, path alias `@/* → src/*`. Frontend-only — all data comes from a separate backend over `/api`.

### Data flow

The app is a thin client over a FastAPI backend. There is no DB layer here; `src/lib/data.ts` only declares the wire-format `Listing` type and an FX table — it does not contain mock data anymore (despite what `README.md` says).

- **Browser fetch** — `src/lib/api.ts` (`api()`, `fetcher`). Base URL is `process.env.NEXT_PUBLIC_API_BASE ?? "/api"`. Injects an `X-Device-Id` header (UUID stored in `localStorage` under `gc_device_id`) so the backend can scope per-device state (favorites, etc.) without auth.
- **Server fetch** — `src/lib/api-server.ts` (`apiServer()`, `import "server-only"`). Used by RSC, `generateMetadata`, and `opengraph-image.tsx`. Resolves base URL from `API_URL` → absolute `NEXT_PUBLIC_API_BASE` → `http://localhost:8080`. Returns `null` on 404; default `next.revalidate: 30`.
- **Production routing** — `docker-compose.yml` runs nginx (`conf.d/`) in front of `web`. The browser hits same-origin `/api/...`; server-side RSC uses `API_URL=http://proxy/api` to go back through nginx so the same `/api → cars-api` rule applies in both contexts.

### Listings: filters, URL state, infinite scroll

The listings page is the central feature; understand this before touching it.

- **Filter state lives in the URL**, not Zustand. `src/lib/listings-params.ts` parses/serializes `FilterState` + `search` + `sort` to/from `URLSearchParams`. `useListingsParams()` is the single hook for reading and updating; it calls `router.replace(..., { scroll: false })`. Adding a new filter requires updating both `NUM_KEYS`/`ARRAY_KEYS` here **and** the `FilterState` type in `src/lib/store.ts`.
- **Zustand (`src/lib/store.ts`) only holds device-local prefs**: `currency`, `palette`, `viewMode`. Persisted under key `gc_app`. Do not put filter state here.
- **Fetching** — `src/components/listings-page.tsx` uses `useSWRInfinite`. Page key is built by `listingsKey()` in `src/lib/api-listings.ts` (same serialization rules as the URL). `LISTINGS_PAGE_SIZE = 24`. End-of-list sentinel + `IntersectionObserver` triggers `setSize`.
- **Facets** — dropdown options and numeric ranges come from `GET /facets` via `useFacets()` (`src/lib/use-facets.ts`); a hardcoded `FALLBACK` keeps the UI usable while the request is in flight or fails.
- **Favorites** — server-owned, scoped by `X-Device-Id`. `useFavorites()` (`src/lib/use-favorites.ts`) does optimistic SWR mutations against `/favorites/ids` and `POST/DELETE /favorites/{id}`.

### i18n + theming

- **next-intl** with locales `ru | en | ka` (default `ru`). Locale stored in the `NEXT_LOCALE` cookie; switched via the server action in `src/app/actions.ts`. Messages in `messages/{ru,en,ka}.json`. Config: `src/i18n/request.ts` (also wired into `next.config.ts` via `createNextIntlPlugin`).
- **Theme** is custom, not `next-themes` (despite README). `src/components/theme-provider.tsx` toggles `dark` class on `<html>` from `localStorage["theme"]`; `themeInitScript` is inlined in `<head>` for no-flash bootstrap.
- **Palettes** — four CSS-var palettes in `src/app/globals.css` selected by `data-palette` (electric/sunset/azure/tbilisi); `palette` is persisted in the Zustand `gc_app` store.

### OpenGraph images

Each route has its own `opengraph-image.tsx` (`/`, `/listing/[id]`, `/favorites`, `/saved`, `/map`). Shared rendering helpers are in `src/lib/og.tsx` and `src/lib/og-fonts.ts`. These run server-side and use `apiServer()` for data — `metadataBase` in `src/app/layout.tsx` reads `NEXT_PUBLIC_SITE_URL`.

## Conventions

- **Biome** is the formatter and linter (config in `biome.json`): 2-space indent, double quotes, semicolons, trailing commas `es5`, line width 120. Always run `bun run lint:fix` before committing.
- Listing image URLs are served from the backend at paths like `/api/images/<id>.webp`. Use `next/image` for them; image hosts must be allowlisted in `next.config.ts → images.remotePatterns`.
- `"use client"` is used per-component; the app router defaults to RSC. The split matters because `apiServer` is `server-only` and `useListingsParams`/SWR hooks are client-only.

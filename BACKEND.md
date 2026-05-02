# GeorgianCars — Backend spec

Stack: **FastAPI + Beanie (async ODM) + Motor/PyMongo + Uvicorn**, MongoDB as the only datastore. REST. Consumed by the Next.js frontend in this repo via `fetch` + SWR.

---

## 1. Project layout

```
backend/
  pyproject.toml
  .env                         # MONGO_URL, MONGO_DB, CORS_ORIGINS, JWT_SECRET, ...
  app/
    main.py                    # FastAPI() instance, lifespan, router mount, CORS
    settings.py                # pydantic-settings BaseSettings
    db.py                      # init_beanie(motor_client[db], document_models=[...])
    deps.py                    # get_current_user, pagination, etc.
    models/
      listing.py               # Listing (Beanie Document)
      channel.py               # TgChannel
      favorite.py              # Favorite
      saved_search.py          # SavedSearch
      user.py                  # User
    schemas/
      listing.py               # ListingOut, ListingFilters, ListingPage
      facets.py                # FacetsOut
      saved_search.py          # SavedSearchIn/Out
    routers/
      listings.py
      facets.py
      favorites.py
      saved_searches.py
      map.py
      auth.py                  # if you add accounts; otherwise device-id headers
      health.py
    services/
      filters.py               # build Mongo query from FilterState
      sorting.py               # sort spec mapping
      pricing.py               # priceRating + fairPrice
      ingest.py                # write path from Telegram pipeline (out of scope here)
```

Run:

```bash
uv sync                # or: pip install -e .
uvicorn app.main:app --reload --port 8000
```

---

## 2. Document models (Beanie)

All models inherit from `beanie.Document`. The frontend's `Listing` shape (see `src/lib/data.ts`) is the contract — names match exactly so the JSON can flow straight into the React components without remapping.

### `models/listing.py`

```python
from datetime import datetime
from typing import Literal
from beanie import Document, Indexed
from pydantic import Field

PriceRating = Literal["great", "good", "fair", "high", "overpriced"]
Currency    = Literal["USD"]

class TgChannelEmbed(BaseModel):
    id:   str
    name: str
    subs: int

class Listing(Document):
    # Public id used in URLs (e.g. "GC-10042"). Indexed unique.
    id_code: Indexed(str, unique=True) = Field(alias="id")

    make:   Indexed(str)
    model:  Indexed(str)
    year:   Indexed(int)
    fuel:   Indexed(str)
    engine: float
    power:  Indexed(int)
    mileage: Indexed(int)
    transmission: Indexed(str)
    drive:  Indexed(str)
    body:   Indexed(str)
    color:  str
    city:   Indexed(str)

    price:        Indexed(int)             # always normalized to USD
    currency:     Currency = "USD"
    price_rating: PriceRating              # alias="priceRating"
    fair_price:   int                      # alias="fairPrice"

    vin_checked:     bool = False          # alias="vinChecked"
    customs_cleared: bool = False          # alias="customsCleared"
    has_photos:      bool = True           # alias="hasPhotos"
    photos:          list[str]             # URLs or data URIs

    channel: TgChannelEmbed
    posted_at: datetime                    # source of posted_days/posted_hours

    summary: str
    features: list[str] = []
    seller: str
    description: str
    bargain: bool = False

    # GeoJSON Point [lng, lat] for the map endpoint.
    location: dict | None = None           # {"type":"Point","coordinates":[lon,lat]}

    class Settings:
        name = "listings"
        # Compound and text indexes — see §8.

    class Config:
        populate_by_name = True            # so the alias-based fields serialize cleanly
```

The response serializer must derive the frontend-facing fields:

| frontend field | derivation                                                                                 |
|---|---|
| `id`           | `id_code`                                                                                  |
| `priceRating`  | `price_rating`                                                                             |
| `fairPrice`    | `fair_price`                                                                               |
| `vinChecked`   | `vin_checked`                                                                              |
| `customsCleared` | `customs_cleared`                                                                        |
| `hasPhotos`    | `has_photos`                                                                               |
| `postedDays`   | `(now - posted_at).days`                                                                   |
| `postedHours`  | `((now - posted_at).seconds // 3600)`                                                      |

### `models/channel.py`

```python
class TgChannel(Document):
    id_code: Indexed(str, unique=True) = Field(alias="id")
    name: str
    subs: int
    class Settings: name = "channels"
```

### `models/saved_search.py`

```python
class SavedSearch(Document):
    user_id: Indexed(str)
    name: str
    filters: FilterStateModel    # mirrors frontend FilterState (see schemas/listing.py)
    notify: bool = True          # the "Telegram / off" toggle on /saved
    last_match_at: datetime | None = None
    fresh_count: int = 0
    total_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings: name = "saved_searches"
```

### `models/favorite.py`

```python
class Favorite(Document):
    user_id:    Indexed(str)
    listing_id: Indexed(str)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    class Settings:
        name = "favorites"
        indexes = [[("user_id", 1), ("listing_id", 1)], {"unique": True}]
```

### `models/user.py` (only if you add accounts; otherwise treat the `X-Device-Id` header as the user key)

```python
class User(Document):
    email: Indexed(str, unique=True)
    name: str | None = None
    locale: Literal["ru","en","ka"] = "ru"
    currency: Literal["USD","RUB"] = "USD"
    palette: Literal["electric","sunset","azure","tbilisi"] = "electric"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    class Settings: name = "users"
```

---

## 3. App startup (`app/main.py`)

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from .settings import settings
from .models import Listing, TgChannel, SavedSearch, Favorite, User
from .routers import listings, facets, favorites, saved_searches, map as map_router, health

@asynccontextmanager
async def lifespan(app: FastAPI):
    client = AsyncIOMotorClient(settings.MONGO_URL)
    await init_beanie(database=client[settings.MONGO_DB],
                      document_models=[Listing, TgChannel, SavedSearch, Favorite, User])
    yield
    client.close()

app = FastAPI(title="GeorgianCars API", version="1", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,           # ["http://localhost:3000", "https://your-domain.tld"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router,        prefix="/v1/health",          tags=["health"])
app.include_router(listings.router,      prefix="/v1/listings",        tags=["listings"])
app.include_router(facets.router,        prefix="/v1/facets",          tags=["facets"])
app.include_router(favorites.router,     prefix="/v1/favorites",       tags=["favorites"])
app.include_router(saved_searches.router,prefix="/v1/saved-searches",  tags=["saved"])
app.include_router(map_router.router,    prefix="/v1/map",             tags=["map"])
```

The frontend should hit `${process.env.NEXT_PUBLIC_API_URL}/v1/...`.

---

## 4. Conventions used by every endpoint

- **Versioned prefix** `/v1/...`. Bump if you ever break a response shape.
- **JSON only**, snake_case **inside Mongo**, **camelCase on the wire** (use Pydantic aliases).
- **Pagination**: `?page=1&page_size=24` (max 100). Response wrapper: `{ "items": [...], "total": N, "page": p, "page_size": s }`.
- **Sorting**: `?sort=newest|best_deal|cheap|expensive|mileage_asc|year_desc|year_asc` — match the frontend's `sort.*` keys.
- **Identity**: until you wire real auth, accept an opaque `X-Device-Id` header (the frontend can issue/persist a UUID in `localStorage` next to the existing `gc_app` Zustand state). Server treats it as the `user_id`. When you add accounts, swap for a `Bearer` JWT with the same `user_id` claim.
- **Error shape**: FastAPI default `{"detail": "..."}` is fine; for validation use the standard 422 body.
- **Caching**: GETs that don't depend on identity (listings, facets, map) should set `Cache-Control: public, max-age=30, stale-while-revalidate=120`. SWR will revalidate; the CDN can hold short copies.

---

## 5. Endpoints

### 5.1 `GET /v1/listings`

The main feed for `/`, `/favorites`, and `/listing/[id]/similar`. Mirrors the frontend's `applyFilters` + `applySort` + pagination.

**Query params** (all optional, all flat — easier to compose with `URLSearchParams`):

| param          | type      | example          | maps to                 |
|----------------|-----------|------------------|-------------------------|
| `q`            | string    | `bmw x5 tbilisi` | text search across `make model id city` |
| `priceFrom` / `priceTo` | int | `2000` / `30000` | `price` range |
| `yearFrom` / `yearTo`   | int | `2015` / `2024`  | `year` range  |
| `mileageFrom` / `mileageTo` | int |              | `mileage` range |
| `engineFrom` / `engineTo`   | float |            | `engine` range  |
| `powerFrom` / `powerTo`     | int |              | `power` range   |
| `makes`        | repeated  | `?makes=BMW&makes=Audi` | `make ∈ ...` |
| `models`       | repeated  |                          | `model ∈ ...` |
| `fuels` / `trans` / `drives` / `bodies` / `cities` / `colors` | repeated | | exact match in their respective fields |
| `channel`      | string    | `tbilisi_auto`   | `channel.id == ?` |
| `vinOnly`      | bool      | `true`           | `vin_checked == true` |
| `priceOnly`    | bool      | `true`           | `price > 0` |
| `sort`         | enum      | `best_deal`      | server-side sort spec |
| `page`         | int ≥ 1   | default `1`      |                         |
| `pageSize`     | int 1..100| default `24`     |                         |

**Response** `200`:

```json
{
  "items": [ Listing, ... ],
  "total": 1342,
  "page": 1,
  "pageSize": 24
}
```

**Implementation hint** — `services/filters.py`:

```python
def build_query(f: ListingFilters, q: str | None) -> dict:
    where: dict = {}
    if q:
        where["$text"] = {"$search": q}
    if f.price_from is not None or f.price_to is not None:
        where["price"] = {k:v for k,v in {"$gte": f.price_from, "$lte": f.price_to}.items() if v is not None}
    # repeat for year/mileage/engine/power
    for field, vals in [("make", f.makes), ("model", f.models), ("fuel", f.fuels),
                        ("transmission", f.trans), ("drive", f.drives),
                        ("body", f.bodies), ("city", f.cities), ("color", f.colors)]:
        if vals: where[field] = {"$in": vals}
    if f.channel:   where["channel.id"] = f.channel
    if f.vin_only:  where["vin_checked"] = True
    if f.price_only:where["price"] = {"$gt": 0, **where.get("price", {})}
    return where
```

`services/sorting.py`:

```python
SORT_SPECS = {
  "newest":      [("posted_at", -1)],
  "cheap":       [("price",  1)],
  "expensive":   [("price", -1)],
  "mileage_asc": [("mileage", 1)],
  "year_desc":   [("year",  -1)],
  "year_asc":    [("year",   1)],
  "best_deal":   [("price_rating_rank", 1), ("posted_at", -1)],   # store a precomputed int 0..4
}
```

### 5.2 `GET /v1/listings/{id}`

Returns the same `Listing` shape as the list endpoint but with the full body (description, features, all photos). 404 if not found. Used by `/listing/[id]/page.tsx`.

### 5.3 `GET /v1/listings/{id}/similar`

`?limit=4`. Server-side: same make **or** same body, exclude `id`. Sort by `posted_at` desc.

### 5.4 `GET /v1/facets`

Powers the filters panel — returns the available enum values plus the makes→models map. Static-ish; cache hard.

```json
{
  "makes":      { "Toyota": ["Camry","Corolla",...], "BMW": [...] },
  "fuels":      ["Petrol","Diesel","Hybrid","Electric","LPG"],
  "transmissions":["Automatic","Manual","Robot","CVT"],
  "drives":     ["FWD","RWD","AWD","4WD"],
  "bodies":     ["Sedan","SUV","Hatchback","Wagon","Coupe","Pickup","Minivan"],
  "cities":     ["Tbilisi","Batumi","Kutaisi","Rustavi","Gori","Zugdidi","Poti","Telavi"],
  "colors":     ["Black","White","Silver","Grey","Blue","Red","Green","Beige"],
  "channels":   [{ "id": "tbilisi_auto", "name": "Tbilisi Auto", "subs": 24800 }, ...],
  "ranges": {
    "price":   { "min": 1500, "max": 240000 },
    "year":    { "min": 1995, "max": 2025 },
    "mileage": { "min": 0,    "max": 480000 },
    "engine":  { "min": 0.0,  "max": 6.0 },
    "power":   { "min": 60,   "max": 700 }
  }
}
```

Build with a single `aggregate` (`$facet` or N `distinct` calls). Re-aggregate every 5 min and cache in-memory.

### 5.5 Favorites — `/v1/favorites`

User-scoped via `X-Device-Id`. The frontend already keeps `favorites: string[]` in Zustand; once the backend exists, replace `toggleFav` with these calls.

| method | path                       | body / params              | response                             |
|--------|----------------------------|----------------------------|--------------------------------------|
| GET    | `/v1/favorites`            | —                          | `{ "items": [Listing, ...] }`        |
| GET    | `/v1/favorites/ids`        | —                          | `{ "ids": ["GC-10042", ...] }`       |
| POST   | `/v1/favorites/{listingId}`| —                          | `204`                                |
| DELETE | `/v1/favorites/{listingId}`| —                          | `204`                                |

Note: the `ids` endpoint exists so the favorite state on `ListingCard` can render via SWR without fetching every listing's full body.

### 5.6 Saved searches — `/v1/saved-searches`

Powers `/saved`. Stores a serialized `FilterState` and a notify flag.

| method | path                                | body                                              | response          |
|--------|-------------------------------------|---------------------------------------------------|-------------------|
| GET    | `/v1/saved-searches`                | —                                                 | `{ "items": [SavedSearchOut, ...] }` |
| POST   | `/v1/saved-searches`                | `{ "name": "BMW X5 до $30k", "filters": {...}, "notify": true }` | `SavedSearchOut`  |
| PATCH  | `/v1/saved-searches/{id}`           | partial of the above                              | `SavedSearchOut`  |
| DELETE | `/v1/saved-searches/{id}`           | —                                                 | `204`             |
| POST   | `/v1/saved-searches/{id}/run`       | —                                                 | `{ "items": [Listing, ...], "total": N, "freshCount": F }` (re-runs the saved filters now and updates `total_count` / `fresh_count` / `last_match_at`) |

`SavedSearchOut` shape:

```json
{
  "id": "65e0...",
  "name": "BMW X5 до $30k",
  "crit": "BMW X5 · 2018+ · до 30 000$ · Tbilisi",
  "filters": { ... FilterState ... },
  "notify": true,
  "total": 27,
  "fresh": 4,
  "lastMatchAt": "2026-05-02T10:21:00Z"
}
```

`crit` is computed server-side from `filters` for the `/saved` row preview (so the same human label appears regardless of locale fallback). Rendering it in the UI can be a one-line join over the active fields — match the existing mock format on `src/app/saved/page.tsx`.

### 5.7 Map — `/v1/map/cities`

For `/map`. Returns the city counts aggregation that the page currently computes from `LISTINGS`.

```json
{
  "cities": [
    { "name": "Tbilisi", "count": 412, "lat": 41.7151, "lng": 44.8271 },
    ...
  ],
  "total": 1342
}
```

A second route `GET /v1/map/cities/{name}/listings?limit=6` returns the right-panel listings for a selected city.

### 5.8 `GET /v1/health`

`{"ok": true, "db": true}`. Pings Mongo with `await db.command("ping")`.

---

## 6. Pricing service (`services/pricing.py`)

The fields `price_rating` and `fair_price` should be set on **write** (ingest) so reads stay cheap and sortable. Mirror the frontend's expectation (`great`/`good`/`fair`/`high`/`overpriced` — see `src/lib/rating.ts`):

```python
def rate(price: int, fair: int) -> tuple[PriceRating, int]:
    delta = (price - fair) / fair
    if delta < -0.12: return ("great",     0)
    if delta < -0.04: return ("good",      1)
    if delta <  0.06: return ("fair",      2)
    if delta <  0.15: return ("high",      3)
    return                  ("overpriced", 4)
```

Persist the rank as `price_rating_rank` so `sort=best_deal` is a clean indexed sort.

---

## 7. Indexes (run once on bootstrap or via a migration script)

```python
# Listing
listings.create_index([("posted_at", -1)])
listings.create_index([("price", 1)])
listings.create_index([("year", -1)])
listings.create_index([("mileage", 1)])
listings.create_index([("price_rating_rank", 1), ("posted_at", -1)])
listings.create_index([("city", 1)])
listings.create_index([("make", 1), ("model", 1)])
listings.create_index([("location", "2dsphere")])
listings.create_index(
  [("make", "text"), ("model", "text"), ("city", "text"), ("id_code", "text")],
  weights={"make": 5, "model": 5, "id_code": 10, "city": 1},
  default_language="none"   # the corpus is multilingual; let the text index just split tokens
)

# Favorite
favorites.create_index([("user_id", 1), ("listing_id", 1)], unique=True)

# SavedSearch
saved_searches.create_index([("user_id", 1), ("created_at", -1)])
```

---

## 8. Frontend wiring (fetch + SWR)

Add a tiny client shim and use the same URL builder from the existing Zustand store. The frontend already speaks the camelCase shape — no remappers needed if your aliases are right.

`src/lib/api.ts`

```ts
const BASE = process.env.NEXT_PUBLIC_API_URL!;        // e.g. https://api.your-domain.tld

let deviceId: string | null = null;
function getDeviceId() {
  if (deviceId) return deviceId;
  if (typeof window === "undefined") return "";
  let d = window.localStorage.getItem("gc_device_id");
  if (!d) { d = crypto.randomUUID(); window.localStorage.setItem("gc_device_id", d); }
  return (deviceId = d);
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "X-Device-Id": getDeviceId(), ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.status === 204 ? (undefined as T) : res.json();
}

export const fetcher = (path: string) => api(path);
```

`src/lib/api-listings.ts`

```ts
import type { FilterState } from "@/lib/store";

export function listingsKey(filters: FilterState, search: string, sort: string, page = 1, pageSize = 24) {
  const p = new URLSearchParams();
  if (search) p.set("q", search);
  for (const [k, v] of Object.entries(filters)) {
    if (v == null || (Array.isArray(v) && v.length === 0)) continue;
    if (Array.isArray(v)) v.forEach((x) => p.append(k, String(x)));
    else p.set(k, String(v));
  }
  p.set("sort", sort);
  p.set("page", String(page));
  p.set("pageSize", String(pageSize));
  return `/v1/listings?${p.toString()}`;
}
```

Page-level usage:

```tsx
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { listingsKey } from "@/lib/api-listings";

const { data, isLoading } = useSWR(listingsKey(filters, search, sort), fetcher);
```

Mutations (favorites):

```ts
import useSWR, { useSWRConfig } from "swr";
import { fetcher, api } from "@/lib/api";

const { data } = useSWR<{ ids: string[] }>("/v1/favorites/ids", fetcher);
const { mutate } = useSWRConfig();
async function toggleFav(id: string) {
  const isFav = data?.ids.includes(id);
  await api(`/v1/favorites/${id}`, { method: isFav ? "DELETE" : "POST" });
  mutate("/v1/favorites/ids");
  mutate("/v1/favorites");
}
```

Tips:
- Pass `keepPreviousData: true` in SWR options on the listings hook so filter/sort changes don't flash to skeletons.
- Use `dedupingInterval: 30_000` for `/v1/facets` — it changes rarely.
- For SSR pages (`listing/[id]/page.tsx` already runs on the server), call the API directly via `fetch` in the RSC and pass results down — no SWR needed there.

---

## 9. settings.py

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URL: str = "mongodb://localhost:27017"
    MONGO_DB:  str = "georgiancars"
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    JWT_SECRET: str | None = None
    class Config:
        env_file = ".env"

settings = Settings()
```

`.env`:

```
MONGO_URL=mongodb://localhost:27017
MONGO_DB=georgiancars
CORS_ORIGINS=["http://localhost:3000","https://your-domain.tld"]
```

---

## 10. Out of scope here, but worth knowing

- **Ingest** of new listings from Telegram channels lives in a separate worker. It writes to `listings` and re-evaluates `saved_searches.fresh_count`/`last_match_at` on insert. The API is read-only over those collections from the frontend's POV.
- **Search relevance**: the `$text` index above is a starting point. If you want fuzzy/multilingual search, swap to Atlas Search or a Meilisearch sidecar; the route stays `?q=...`.
- **Observability**: add `prometheus-fastapi-instrumentator` and a `request_id` middleware before this hits real traffic.

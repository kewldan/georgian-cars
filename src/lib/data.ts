// Mock dataset for GeorgianCars

import type { PriceRating } from "./rating";

export type Listing = {
  id: string;
  make: string;
  model: string;
  year: number;
  fuel: string;
  engine: number;
  power: number;
  mileage: number;
  transmission: string;
  drive: string;
  body: string;
  color: string;
  city: string;
  price: number;
  currency: "USD";
  priceRating: PriceRating;
  fairPrice: number;
  vinChecked: boolean;
  customsCleared: boolean;
  hasPhotos: boolean;
  photos: string[];
  channel: { id: string; name: string; subs: number };
  postedDays: number;
  postedHours: number;
  summary: string;
  features: string[];
  seller: string;
  description: string;
  bargain: boolean;
};

export const TG_CHANNELS = [
  { id: "tbilisi_auto", name: "Tbilisi Auto", subs: 24800 },
  { id: "gruzia_cars", name: "Грузия Авто", subs: 18200 },
  { id: "batumi_motors", name: "Batumi Motors", subs: 9100 },
  { id: "avto_ge", name: "avto.ge feed", subs: 41500 },
  { id: "kutaisi_cars", name: "Kutaisi Cars", subs: 5400 },
];

export const CITIES = ["Tbilisi", "Batumi", "Kutaisi", "Rustavi", "Gori", "Zugdidi", "Poti", "Telavi"];

export const MAKES: Record<string, string[]> = {
  Toyota: ["Camry", "Corolla", "Prius", "Land Cruiser", "RAV4", "Highlander"],
  BMW: ["320i", "520d", "X5", "X3", "M3", "730Li"],
  Mercedes: ["E-Class", "C-Class", "S-Class", "GLE", "GLC", "Sprinter"],
  Honda: ["Civic", "Accord", "CR-V", "Fit", "Pilot"],
  Hyundai: ["Sonata", "Elantra", "Tucson", "Santa Fe", "Ioniq 5"],
  Kia: ["Optima", "Sportage", "Sorento", "Rio", "EV6"],
  Nissan: ["Altima", "X-Trail", "Patrol", "Leaf", "Qashqai"],
  Ford: ["Focus", "Fusion", "Escape", "Explorer", "F-150"],
  Volkswagen: ["Passat", "Golf", "Tiguan", "Touareg", "ID.4"],
  Tesla: ["Model 3", "Model Y", "Model S"],
  Lexus: ["RX 350", "ES 350", "NX 300", "LX 570"],
  Subaru: ["Outback", "Forester", "Impreza"],
};

export const BODIES = ["Sedan", "SUV", "Hatchback", "Wagon", "Coupe", "Pickup", "Minivan"];
export const FUELS = ["Petrol", "Diesel", "Hybrid", "Electric", "LPG"];
export const TRANSMISSIONS = ["Automatic", "Manual", "Robot", "CVT"];
export const DRIVES = ["FWD", "RWD", "AWD", "4WD"];
export const COLORS = ["Black", "White", "Silver", "Grey", "Blue", "Red", "Green", "Beige"];

export const FX = { USD: 1, RUB: 92, GEL: 2.7 };

function imgPlaceholder(seed: number, label: string) {
  const palettes = [
    ["#1a1a1a", "#2a2a2a", "#d4ff3a"],
    ["#0f1922", "#1c2c3a", "#7fb9ff"],
    ["#221610", "#3a2418", "#ff8c42"],
    ["#0a1f14", "#13301f", "#5fdc8a"],
    ["#1f0f1a", "#311a2a", "#ff6ba6"],
  ];
  const p = palettes[seed % palettes.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 560'>
    <defs><pattern id='p${seed}' width='14' height='14' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'>
      <rect width='14' height='14' fill='${p[0]}'/><line x1='0' y1='0' x2='0' y2='14' stroke='${p[1]}' stroke-width='6'/>
    </pattern></defs>
    <rect width='800' height='560' fill='url(#p${seed})'/>
    <rect x='40' y='40' width='720' height='480' fill='none' stroke='${p[2]}' stroke-opacity='0.25' stroke-width='2'/>
    <text x='400' y='290' font-family='ui-monospace, monospace' font-size='22' fill='${p[2]}' fill-opacity='0.6' text-anchor='middle' letter-spacing='2'>${label}</text>
    <text x='400' y='320' font-family='ui-monospace, monospace' font-size='12' fill='${p[2]}' fill-opacity='0.4' text-anchor='middle' letter-spacing='3'>PHOTO PLACEHOLDER · ${seed.toString().padStart(3, "0")}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function generateListing(i: number): Listing {
  const r = rng(i * 7919 + 13);
  const make = pick(r, Object.keys(MAKES));
  const model = pick(r, MAKES[make]);
  const year = 2005 + Math.floor(r() * 20);
  const fuel = pick(r, FUELS);
  const isEV = fuel === "Electric";
  const engine = isEV ? 0 : Math.round((1.0 + r() * 4.0) * 10) / 10;
  const power = isEV ? 150 + Math.floor(r() * 350) : 90 + Math.floor(r() * 350);
  const mileage = Math.floor(5000 + r() * 295000);
  const transmission = pick(r, TRANSMISSIONS);
  const drive = pick(r, DRIVES);
  const body = pick(r, BODIES);
  const color = pick(r, COLORS);
  const city = pick(r, CITIES);
  const channel = pick(r, TG_CHANNELS);
  const vinChecked = r() > 0.4;
  const customsCleared = r() > 0.3;
  const hasPhotos = r() > 0.05;

  const basePrice = 2500 + (year - 2005) * 1100 + power * 18 + (isEV ? 4000 : 0);
  const noise = (r() - 0.5) * 4000;
  const price = Math.max(2200, Math.round((basePrice + noise) / 100) * 100);
  const fairPrice = basePrice;
  const delta = (price - fairPrice) / fairPrice;
  let priceRating: Listing["priceRating"];
  if (delta < -0.12) priceRating = "great";
  else if (delta < -0.04) priceRating = "good";
  else if (delta < 0.06) priceRating = "fair";
  else if (delta < 0.15) priceRating = "high";
  else priceRating = "overpriced";

  const photos = Array.from({ length: 4 + Math.floor(r() * 4) }, (_, k) =>
    imgPlaceholder(i * 10 + k, `${make.toUpperCase()} ${model.toUpperCase()}`)
  );

  const postedDays = Math.floor(r() * 30);
  const postedHours = Math.floor(r() * 24);

  const condNotes: string[] = [];
  if (mileage < 80000) condNotes.push("малый пробег");
  if (mileage > 220000) condNotes.push("большой пробег");
  if (year >= 2020) condNotes.push("свежий год");
  if (vinChecked) condNotes.push("VIN проверен");
  if (!customsCleared) condNotes.push("требуется растаможка");
  if (priceRating === "great" || priceRating === "good") condNotes.push("цена ниже рынка");
  if (priceRating === "overpriced") condNotes.push("цена выше рынка");
  const summary = `${year} ${make} ${model}, ${body.toLowerCase()}, ${transmission.toLowerCase()}, ${drive}. ${condNotes.slice(0, 3).join(", ") || "базовая комплектация"}. Продавец из ${city}.`;

  const features: string[] = [];
  if (r() > 0.4) features.push("Кожаный салон");
  if (r() > 0.5) features.push("Панорамная крыша");
  if (r() > 0.3) features.push("Климат-контроль");
  if (r() > 0.5) features.push("Подогрев сидений");
  if (r() > 0.6) features.push("Камера 360°");
  if (r() > 0.7) features.push("Адаптивный круиз");
  if (r() > 0.6) features.push("Парктроники");
  if (r() > 0.4) features.push("Bluetooth");

  return {
    id: `GC-${(i + 10001).toString()}`,
    make,
    model,
    year,
    fuel,
    engine,
    power,
    mileage,
    transmission,
    drive,
    body,
    color,
    city,
    price,
    currency: "USD",
    priceRating,
    fairPrice,
    vinChecked,
    customsCleared,
    hasPhotos,
    photos,
    channel,
    postedDays,
    postedHours,
    summary,
    features,
    seller: pick(r, ["Частное лицо", "Автосалон Tbilisi Motors", "Дилер", "Частное лицо", "Перекуп (по данным ИИ)"]),
    description: `${year} ${make} ${model}. ${body}. Двигатель ${isEV ? "электрический" : `${engine}L`}, ${power} л.с. Пробег ${mileage.toLocaleString()} км. ${transmission}, ${drive}. Цвет: ${color}. Город: ${city}. ${customsCleared ? "Растаможено в Грузии." : "Не растаможено."} ${vinChecked ? "VIN проверен." : ""}`,
    bargain: r() > 0.6,
  };
}

export const LISTINGS: Listing[] = Array.from({ length: 48 }, (_, i) => generateListing(i));

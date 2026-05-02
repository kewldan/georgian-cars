// Lazy-fetch + memoize woff buffers for ImageResponse / Satori. Satori can't
// read woff2, so we go through @fontsource via the jsDelivr CDN (which ships
// uncompressed .woff for every Google Font + weight, latin subset).

type FontDescriptor = { slug: string; weight: number };

const cache = new Map<string, Promise<ArrayBuffer>>();

async function loadFont({ slug, weight }: FontDescriptor): Promise<ArrayBuffer> {
  const key = `${slug}@${weight}`;
  const existing = cache.get(key);
  if (existing) return existing;

  const promise = (async () => {
    const url = `https://cdn.jsdelivr.net/npm/@fontsource/${slug}/files/${slug}-latin-${weight}-normal.woff`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${slug}@${weight} (${res.status})`);
    return res.arrayBuffer();
  })();

  cache.set(key, promise);
  return promise;
}

export type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 500 | 600 | 700 | 800;
  style: "normal";
};

export async function loadOgFonts(): Promise<OgFont[]> {
  const [manrope500, manrope700, manrope800, mono700] = await Promise.all([
    loadFont({ slug: "manrope", weight: 500 }),
    loadFont({ slug: "manrope", weight: 700 }),
    loadFont({ slug: "manrope", weight: 800 }),
    loadFont({ slug: "jetbrains-mono", weight: 700 }),
  ]);
  return [
    { name: "Manrope", data: manrope500, weight: 500, style: "normal" },
    { name: "Manrope", data: manrope700, weight: 700, style: "normal" },
    { name: "Manrope", data: manrope800, weight: 800, style: "normal" },
    { name: "JetBrainsMono", data: mono700, weight: 700, style: "normal" },
  ];
}

import "server-only";

// Server-side fetch (RSC, generateMetadata, opengraph-image). Needs an absolute
// URL since Node fetch doesn't accept relative paths. Resolves in this order:
//   1. `API_URL`             — explicit server override (recommended in prod)
//   2. `NEXT_PUBLIC_API_BASE` — only if it's already absolute
//   3. fallback to `http://localhost:8080` (dev default)
function resolveBase(): string {
  const explicit = process.env.API_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const pub = process.env.NEXT_PUBLIC_API_BASE;
  if (pub && /^https?:\/\//.test(pub)) return pub.replace(/\/+$/, "");
  return "http://localhost:8080";
}

export async function apiServer<T>(path: string, init?: RequestInit): Promise<T | null> {
  const url = `${resolveBase()}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    next: { revalidate: 30, ...((init as { next?: object } | undefined)?.next ?? {}) },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${res.status} ${await res.text()} (${url})`);
  return res.status === 204 ? null : ((await res.json()) as T);
}

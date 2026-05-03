// Browser-side fetch. Defaults to same-origin `/api` (prod). For local dev set
// `NEXT_PUBLIC_API_BASE=http://localhost:8080` in `.env.local`.
const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "/api";

let deviceId: string | null = null;
function getDeviceId() {
  if (deviceId) return deviceId;
  if (typeof window === "undefined") return "";
  let d = window.localStorage.getItem("gc_device_id");
  if (!d) {
    d = crypto.randomUUID();
    window.localStorage.setItem("gc_device_id", d);
  }
  deviceId = d;
  return d;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Device-Id": getDeviceId(),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.status === 204 ? (undefined as T) : res.json();
}

export const fetcher = <T>(path: string) => api<T>(path);

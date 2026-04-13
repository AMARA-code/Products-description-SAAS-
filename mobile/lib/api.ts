import { apiUrl } from "./config";

async function authHeader(getToken: () => Promise<string | null>) {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchUsage(getToken: () => Promise<string | null>) {
  const headers = await authHeader(getToken);
  const res = await fetch(`${apiUrl}/api/usage`, { headers });
  if (!res.ok) throw new Error("Failed to load usage");
  return res.json();
}

export async function fetchHistory(
  getToken: () => Promise<string | null>,
  params?: { limit?: number; offset?: number },
) {
  const headers = await authHeader(getToken);
  const q = new URLSearchParams();
  if (params?.limit) q.set("limit", String(params.limit));
  if (params?.offset) q.set("offset", String(params.offset));
  const res = await fetch(`${apiUrl}/api/history?${q.toString()}`, { headers });
  if (!res.ok) throw new Error("Failed to load history");
  return res.json() as Promise<{ items: unknown[] }>;
}

export async function postGenerate(
  getToken: () => Promise<string | null>,
  body: Record<string, unknown>,
) {
  const headers = {
    "Content-Type": "application/json",
    ...(await authHeader(getToken)),
  };
  const res = await fetch(`${apiUrl}/api/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { res, data };
}

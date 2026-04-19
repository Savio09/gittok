import "server-only";

export function getBackendBaseUrl() {
  return process.env.BACKEND_URL || "http://localhost:8000";
}

export async function backendFetch(
  path: string,
  init: RequestInit = {}
) {
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const proxySecret = process.env.BACKEND_PROXY_SECRET || "dev-proxy-secret";
  headers.set("X-GitTok-Proxy-Secret", proxySecret);

  return fetch(`${getBackendBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}


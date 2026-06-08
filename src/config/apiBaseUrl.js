/**
 * API base URL for axios/fetch.
 *
 * - Vercel production: `/api` (same-origin; vercel.json strips /api when proxying to VPS)
 * - Local dev: `http://localhost:3001`
 * - Direct VPS IP: `http://187.124.52.234` — never `/api` suffix (backend routes are /tasks not /api/tasks)
 */
function resolveApiBaseUrl() {
  const env = (process.env.REACT_APP_BASE_URL || "").trim();

  if (!env) {
    return process.env.NODE_ENV === "production" ? "/api" : "http://localhost:3001";
  }

  if (env === "/api" || env === "/api/") {
    return "/api";
  }

  // http://IP/api or http://IP:port/api → backend has no /api prefix
  if (/^https?:\/\/[^/]+\/api\/?$/.test(env)) {
    return env.replace(/\/api\/?$/, "");
  }

  // Full URL on a different host (e.g. laywer-ai.vercel.app/api) → same-origin /api
  if (/^https?:\/\//.test(env) && /\/api\/?$/.test(env)) {
    if (typeof window !== "undefined") {
      try {
        const origin = new URL(env).origin;
        if (origin !== window.location.origin) {
          return "/api";
        }
      } catch (_) {
        return "/api";
      }
    }
  }

  return env.replace(/\/$/, "");
}

export const API_BASE_URL = resolveApiBaseUrl();

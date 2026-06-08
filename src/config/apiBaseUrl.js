/**
 * API base URL for axios/fetch.
 * Production default `/api` uses the same Vercel deployment (avoids wrong-domain 404s).
 */
export const API_BASE_URL =
  process.env.REACT_APP_BASE_URL ||
  (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:3001");

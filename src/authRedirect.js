/** Send Supabase email-link callbacks to /set-password before React Router runs. */
export function redirectAuthHashToSetPassword() {
  if (typeof window === "undefined") return;

  const { pathname, hash } = window.location;
  if (!hash || pathname === "/set-password") return;

  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const isAuthCallback =
    params.has("access_token") ||
    params.has("error") ||
    params.get("type") === "recovery";

  if (isAuthCallback) {
    window.location.replace(`/set-password${hash}`);
  }
}

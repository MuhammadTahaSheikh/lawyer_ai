/**
 * Supabase Auth with a Firebase-compatible surface for the rest of the app.
 */
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

const supabaseUrl =
  process.env.REACT_APP_SUPABASE_URL ||
  "https://twoadfuhzukurkixjycn.supabase.co";
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "";

export const supabase = supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

let _session = null;
const authListeners = new Set();

function mapAuthErrorCode(error) {
  const msg = (error?.message || "").toLowerCase();
  if (error?.code === "email_not_confirmed") return "email_not_confirmed";
  if (
    error?.code === "over_email_send_rate_limit" ||
    msg.includes("rate limit") ||
    msg.includes("email rate limit")
  ) {
    return "auth/email-rate-limit";
  }
  if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
    return "auth/invalid-credential";
  }
  if (msg.includes("email not confirmed")) return "email_not_confirmed";
  if (msg.includes("user not found")) return "auth/user-not-found";
  return error?.code || "auth/unknown";
}

export function authErrorMessage(error) {
  if (error?.code === "auth/email-rate-limit") {
    return (
      "Supabase email rate limit reached. Wait a few minutes, use “Copy setup link” " +
      "(no email), or raise limits in Supabase Dashboard → Authentication → Rate limits."
    );
  }
  return error?.message || "Authentication error";
}

export function toAuthUser(user) {
  if (!user) return null;
  return {
    uid: user.id,
    id: user.id,
    email: user.email ?? null,
    displayName:
      user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      null,
    getIdToken: async () => {
      if (!supabase) return null;
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    },
  };
}

function notifyListeners() {
  const u = _session?.user ? toAuthUser(_session.user) : null;
  authListeners.forEach((cb) => {
    try {
      cb(u);
    } catch (e) {
      console.error(e);
    }
  });
}

if (supabase) {
  supabase.auth.onAuthStateChange((_event, session) => {
    _session = session;
    notifyListeners();
  });
  supabase.auth.getSession().then(({ data }) => {
    _session = data.session;
    notifyListeners();
  });
}

export const auth = {
  get currentUser() {
    return _session?.user ? toAuthUser(_session.user) : null;
  },
};

export function getAuth() {
  return auth;
}

export function onAuthStateChanged(_auth, callback) {
  authListeners.add(callback);
  callback(auth.currentUser);
  return () => authListeners.delete(callback);
}

export async function signInWithEmailAndPassword(_auth, email, password) {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set REACT_APP_SUPABASE_ANON_KEY in .env"
    );
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    const err = new Error(error.message);
    err.code = mapAuthErrorCode(error);
    throw err;
  }
  _session = data.session;
  notifyListeners();

  const user = toAuthUser(data.user);
  try {
    await axios.post(
      `${process.env.REACT_APP_BASE_URL || ""}/auth/link-session`,
      { uid: user.uid, email: user.email },
      { headers: { "x-api-key": process.env.REACT_APP_API_TOKEN } }
    );
  } catch (linkErr) {
    console.warn("auth/link-session:", linkErr.message);
  }
  return { user };
}

export async function signOut() {
  if (supabase) await supabase.auth.signOut();
  _session = null;
  notifyListeners();
}

/** Admin: create Supabase Auth user via backend (service role). Password optional — backend generates one if omitted. */
export async function createUserWithEmailAndPassword(_auth, email, password) {
  const base = process.env.REACT_APP_BASE_URL || "";
  const body = { email };
  if (password) body.password = password;
  const { data } = await axios.post(`${base}/auth/admin/create-user`, body, {
    headers: { "x-api-key": process.env.REACT_APP_API_TOKEN },
  });
  return { user: { uid: data.uid, email: data.email } };
}

export async function sendPasswordResetEmail(_auth, email) {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set REACT_APP_SUPABASE_ANON_KEY in .env"
    );
  }
  const redirectTo =
    process.env.REACT_APP_SUPABASE_RESET_REDIRECT ||
    `${window.location.origin}/set-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) {
    const err = new Error(error.message);
    err.code = mapAuthErrorCode(error);
    throw err;
  }
}

/** Admin: recovery link via service role (does not send email). */
export async function fetchAdminRecoveryLink(email) {
  const base = process.env.REACT_APP_BASE_URL || "";
  const { data } = await axios.post(
    `${base}/auth/admin/recovery-link`,
    { email },
    { headers: { "x-api-key": process.env.REACT_APP_API_TOKEN } }
  );
  return data.link;
}

/** No-op: Firebase reCAPTCHA / MFA not used with Supabase email auth. */
export function getRecaptchaVerifier() {
  return {
    render: () => Promise.resolve(),
    verify: () => Promise.resolve("supabase"),
  };
}

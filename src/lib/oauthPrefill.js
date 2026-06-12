const MENTOR_OAUTH_PREFILL_STORAGE_KEY = "ggu:mentor-oauth-prefill";
const PREFILL_TTL_MS = 10 * 60 * 1000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export function getFirstName(fullName) {
  return (fullName || "").trim().split(/\s+/)[0] || "";
}

export function buildOAuthPrefill(user = {}, overrides = {}) {
  const fullName = overrides.fullName || user.full_name || user.name || "";
  const dateOfBirth = overrides.dateOfBirth || user.date_of_birth || "";

  return {
    fullName,
    email: overrides.email || user.email || "",
    dateOfBirth,
    avatarUrl: overrides.avatarUrl || user.avatar_url || user.picture || user.photo_url || "",
    mentorType: overrides.mentorType || user.mentor_type || "",
    preferredName: overrides.preferredName || getFirstName(fullName),
    savedAt: Date.now(),
  };
}

export function saveMentorOAuthPrefill(prefill) {
  if (typeof window === "undefined" || !prefill) return;

  try {
    window.sessionStorage.setItem(
      MENTOR_OAUTH_PREFILL_STORAGE_KEY,
      JSON.stringify({ ...prefill, savedAt: Date.now() })
    );
  } catch {
    // OAuth prefill is an enhancement; the app can still fall back to auth.me().
  }
}

export function readMentorOAuthPrefill() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(MENTOR_OAUTH_PREFILL_STORAGE_KEY);
    if (!raw) return null;

    const prefill = JSON.parse(raw);
    if (!prefill?.savedAt || Date.now() - prefill.savedAt > PREFILL_TTL_MS) {
      window.sessionStorage.removeItem(MENTOR_OAUTH_PREFILL_STORAGE_KEY);
      return null;
    }

    return prefill;
  } catch {
    return null;
  }
}

export async function waitForOAuthUser(loadUser, { attempts = 6, delayMs = 250 } = {}) {
  let lastError = null;
  let lastUser = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const user = await loadUser();
      if (user?.email || user?.full_name) return user;
      if (user) lastUser = user;
    } catch (error) {
      lastError = error;
    }

    if (attempt < attempts - 1) await sleep(delayMs);
  }

  if (lastUser) return lastUser;
  if (lastError) throw lastError;
  return null;
}

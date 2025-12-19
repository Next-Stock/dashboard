const SESSION_KEY = "aiSession";
const SESSION_DAYS = 15;

export function saveSession({ userId, email, status }) {
  const expiresAt =
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;

  const session = {
    userId,
    email,
    status,
    expiresAt
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);

    if (Date.now() > session.expiresAt) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

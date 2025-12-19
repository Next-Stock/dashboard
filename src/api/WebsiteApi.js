// src/api/WebsiteApi.js
const API = process.env.REACT_APP_API_BASE_URL;

/* -------------------- GET -------------------- */
export async function getWebsite() {
  const res = await fetch(`${API}get-website`);
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error("Failed to load website");
  }

  return data.items;
}

/* -------------------- SAVE / UPDATE -------------------- */
export async function saveWebsiteSection({ userId, email, key, value }) {
  const res = await fetch(`${API}save-website`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email, key, value })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to save section");
  }
}

/* -------------------- DELETE -------------------- */
export async function deleteWebsiteSection({ userId, email, key }) {
  const res = await fetch(`${API}delete-website`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email, key })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error("Failed to delete section");
  }
}

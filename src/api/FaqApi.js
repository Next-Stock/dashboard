// src/api/FaqApi.js
const API = process.env.REACT_APP_API_BASE_URL;

/* -------------------- GET -------------------- */
export async function getFaq() {
  const res = await fetch(`${API}get-faq`);
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error("Failed to load FAQ");
  }

  return data.items;
}

/* -------------------- ADD -------------------- */
export async function addFaq({ userId, email, question, answer }) {
  const res = await fetch(`${API}add-faq`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email, question, answer })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to add FAQ");
  }
}

/* -------------------- ADD as JSON -------------------- */
export async function addFaqFromJson({ userId, email, rawJson }) {
  let parsed;

  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error("Invalid JSON format");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("JSON must be an array of { question, answer } objects");
  }

  parsed.forEach((item, index) => {
    if (!item.question || !item.answer) {
      throw new Error(
        `Invalid item at index ${index}. Each item must have question and answer`
      );
    }
  });

  const res = await fetch(`${API}add-faq`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      email,
      items: parsed
    })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to save FAQ");
  }
}

/* -------------------- DELETE -------------------- */
export async function deleteFaq({ userId, email, id }) {
  const res = await fetch(`${API}delete-faq`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email, id })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error("Failed to delete FAQ");
  }
}

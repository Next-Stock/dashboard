const API = process.env.REACT_APP_API_BASE_URL;

/* -------------------- GET -------------------- */
export async function getAccuracy() {
  const res = await fetch(`${API}get-accuracy`);
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error("Failed to load accuracy");
  }

  return data.items;
}

/* -------------------- ADD (single) -------------------- */
export async function addAccuracy({ userId, email, key, value }) {
  const res = await fetch(`${API}add-accuracy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email, key, value })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to add accuracy");
  }
}

/* -------------------- ADD (JSON list) -------------------- */
export async function addAccuracyFromJson({ userId, email, rawJson }) {
  let parsed;

  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error("Invalid JSON format");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("JSON must be an array of { key, value } objects");
  }

  parsed.forEach((item, index) => {
    if (!item.key || !item.value) {
      throw new Error(
        `Invalid item at index ${index}. Each item must have key and value`
      );
    }
  });

  const res = await fetch(`${API}add-accuracy`, {
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
    throw new Error(data.error || "Failed to save accuracy");
  }
}

/* -------------------- DELETE -------------------- */
export async function deleteAccuracy({ userId, email, id }) {
  const res = await fetch(`${API}delete-accuracy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email, id })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error("Failed to delete accuracy");
  }
}

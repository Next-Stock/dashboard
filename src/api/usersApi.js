const API = process.env.REACT_APP_API_BASE_URL;

/* -------------------- GET USERS -------------------- */
export async function getUsers() {
  const res = await fetch(`${API}get-users`);
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error("Failed to load users");
  }

  return data.users;
}

/* -------------------- GET CLUB TIERS -------------------- */
export async function getClubTiers() {
  const res = await fetch(`${API}get-club-tier`);
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error("Failed to load club tiers");
  }

  return data.items; // [{ label, value }]
}

/* -------------------- UPDATE USER PLAN -------------------- */
export async function updateUserPlan({
  userId,
  planType,
  clubTier,
  expire
}) {
  const res = await fetch(`${API}update-user-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      planType,
      clubTier,
      expire
    })
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to update user plan");
  }
}

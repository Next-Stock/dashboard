const API = process.env.REACT_APP_API_BASE_URL;

/* -------- Youtube -------- */
export async function getVideos() {
  const r = await fetch(`${API}get-videos`);
  const d = await r.json();
  if (!d.success) throw new Error();
  return d.items;
}

export async function addVideo(body) {
  const r = await fetch(`${API}add-video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const d = await r.json();
  if (!d.success) throw new Error();
}

export async function deleteVideo(body) {
  await fetch(`${API}delete-video`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

/* -------- Transcripts -------- */
export async function getTranscripts() {
  const r = await fetch(`${API}get-transcripts`);
  const d = await r.json();
  if (!d.success) throw new Error();
  return d.items;
}

export async function addTranscript(body) {
  const r = await fetch(`${API}add-transcript`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const d = await r.json();
  if (!d.success) throw new Error();
}

export async function deleteTranscript(body) {
  await fetch(`${API}delete-transcript`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

// src/pages/AiKnowledge/sections/Videos/Videos.jsx
import { useEffect, useState } from "react";
import Alert from "../../../../components/Alert/Alert";
import {
  getVideos,
  addVideo,
  deleteVideo,
  getTranscripts,
  addTranscript,
  deleteTranscript
} from "../../../../api/VideoApi";
import "./Videos.css";

export default function Videos({ userId, email }) {
  const [videos, setVideos] = useState([]);
  const [transcripts, setTranscripts] = useState([]);
  const [link, setLink] = useState("");
  const [transcript, setTranscript] = useState("");
  const [alert, setAlert] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);
  const [view, setView] = useState("videos"); // videos | transcripts

  const [isSavingTranscript, setIsSavingTranscript] = useState(false);

  const visibleVideos = showAllVideos
    ? videos
    : videos.slice(0, 3);

  /* -------------------- LOAD -------------------- */
  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setVideos(await getVideos());
      setTranscripts(await getTranscripts());
    } catch {
      setAlert({ type: "error", message: "Failed to load videos" });
    }
  }

  /* -------------------- PERMISSION -------------------- */
  useEffect(() => {
    if (!email) return;

    fetch(`${process.env.REACT_APP_API_BASE_URL}verify-dash-authorization`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, email })
    })
      .then(r => r.json())
      .then(d => setCanEdit(d.success && d.canEdit))
      .catch(() => setCanEdit(false));
  }, [userId, email]);

  /* -------------------- ACTIONS -------------------- */
  async function handleAddVideo() {
    try {
      await addVideo({ userId, email, link });
      setLink("");
      load();
    } catch (e) {
      setAlert({ type: "error", message: e.message });
    }
  }

  async function handleAddTranscript() {
    try {
      setIsSavingTranscript(true);
      await addTranscript({ userId, email, transcript });
      setTranscript("");
      load();
    } catch (e) {
      setAlert({ type: "error", message: e.message });
    } finally {
      setIsSavingTranscript(false);
    }
  }

  async function handleDeleteVideo(id) {
    try {
      await deleteVideo({ userId, email, id });
      setVideos(prev => prev.filter(v => v.id !== id));
    } catch {
      setAlert({ type: "error", message: "Failed to delete video" });
    }
  }

  async function handleDeleteTranscript(id) {
    try {
      await deleteTranscript({ userId, email, id });
      setTranscripts(prev => prev.filter(t => t.id !== id));
    } catch {
      setAlert({ type: "error", message: "Failed to delete transcript" });
    }
  }

  /* -------------------- RENDER -------------------- */
  return (
    <div className="ai-knowledge-section">
      <h3>Videos</h3>

      {alert && <Alert {...alert} onClose={() => setAlert(null)} />}

      {/* TOGGLE */}
      <div className="segmented-control">
        <button
          className={view === "videos" ? "active" : ""}
          onClick={() => setView("videos")}
        >
          Videos
        </button>
        <button
          className={view === "transcripts" ? "active" : ""}
          onClick={() => setView("transcripts")}
        >
          Transcripts
        </button>
      </div>

      {/* ADD VIDEO */}
      {canEdit && view === "videos" && (
        <div className="config-add">
          <input
            placeholder="YouTube embed link"
            value={link}
            onChange={e => setLink(e.target.value)}
          />
          <button
            className="apple-btn primary"
            onClick={handleAddVideo}
            disabled={!link}
          >
            Add Video
          </button>
        </div>
      )}



      {/* ADD TRANSCRIPT */}
      {canEdit && view === "transcripts" && (
        <div className="config-add">
          <textarea
            placeholder="Video transcript"
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
            rows={4}
            disabled={isSavingTranscript}
          />

          <div className="save-transcript-actions">
            <button
              className="apple-btn primary save-transcript-btn"
              onClick={handleAddTranscript}
              disabled={!transcript || isSavingTranscript}
            >
              {isSavingTranscript ? (
                <span className="btn-loading">
                  <span className="spinner small" />
                </span>
              ) : (
                "Save Transcript"
              )}
            </button>

            {isSavingTranscript && (
              <div className="save-hint">
                Please wait... It may take a few seconds.
              </div>
            )}
          </div>
        </div>
      )}



      {/* VIDEOS */}
      {view === "videos" && (
        <>
          {visibleVideos.map(v => (
            <div key={v.id} className="config-row video-row">
              <iframe
                src={v.link}
                title={v.id}
                loading="lazy"
                allowFullScreen
              />

              {canEdit && (
                <button
                  className="config-delete video-delete"
                  onClick={() => handleDeleteVideo(v.id)}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {videos.length > 3 && (
            <button
              className="apple-btn secondary show-more-btn"
              onClick={() => setShowAllVideos(v => !v)}
            >
              {showAllVideos ? "Show less videos" : "Show more videos"}
            </button>
          )}
        </>
      )}

      {/* TRANSCRIPTS */}
      {view === "transcripts" && (
        <>
          {transcripts.map(t => (
            <div key={t.id} className="config-row">
              <pre className="video-transcript">{t.transcript}</pre>

              {canEdit && (
                <button
                  className="config-delete"
                  onClick={() => handleDeleteTranscript(t.id)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

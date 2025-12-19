// src/pages/AiKnowledge/sections/Website/Website.jsx
import { useEffect, useState } from "react";
import Alert from "../../../../components/Alert/Alert";
import {
  getWebsite,
  saveWebsiteSection,
  deleteWebsiteSection
} from "../../../../api/WebsiteApi";
import "./Website.css";

export default function Website({ userId, email }) {
  const [items, setItems] = useState({});
  const [keyInput, setKeyInput] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [alert, setAlert] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  const [editingKey, setEditingKey] = useState(null);

  /* -------------------- LOAD -------------------- */
  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getWebsite();
      setItems(data);
    } catch {
      setAlert({ type: "error", message: "Failed to load website data" });
    }
  }

  /* -------------------- PERMISSION -------------------- */
  useEffect(() => {
    if (!email) return;

    async function checkAccess() {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}verify-dash-authorization`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userId || null, email })
          }
        );

        const data = await res.json();
        setCanEdit(res.ok && data.success && data.canEdit);
      } catch {
        setCanEdit(false);
      }
    }

    checkAccess();
  }, [userId, email]);

  /* -------------------- SAVE -------------------- */
  async function handleSave() {
    try {
      await saveWebsiteSection({
        userId,
        email,
        key: keyInput,
        value: valueInput
      });

      setKeyInput("");
      setValueInput("");
      load();
    } catch (err) {
      setAlert({ type: "error", message: err.message });
    }
  }

  async function handleDelete(key) {
    try {
      await deleteWebsiteSection({ userId, email, key });
      load();
    } catch {
      setAlert({ type: "error", message: "Delete failed" });
    }
  }

  function handleEdit(key, value) {
    setKeyInput(key);
    setValueInput(value);
    setEditingKey(key);
  }

  return (
    <div className="ai-knowledge-section">
      <h3>Website Content</h3>

      {alert && <Alert {...alert} onClose={() => setAlert(null)} />}

      {canEdit && (
        <div className="config-add">
          <input
            placeholder="Section key (e.g. Definition)"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
          />
          <textarea
            placeholder="Section content"
            value={valueInput}
            onChange={(e) => setValueInput(e.target.value)}
            rows={4}
          />
          <button
            className="apple-btn primary"
            onClick={handleSave}
            disabled={!keyInput || !valueInput}
          >
            {editingKey ? "Update" : "Save"}
          </button>
        </div>
      )}

      <div className="config-vars">
        {Object.entries(items).map(([key, value]) => (
          <div key={key} className="config-row">
            <div className="config-key">{key}</div>
            <div className="config-value">{value}</div>

            {canEdit && (
              <>
                <button
                  className="config-edit"
                  onClick={() => handleEdit(key, value)}
                >
                  ✎
                </button>

                <button
                  className="config-delete"
                  onClick={() => handleDelete(key)}
                >
                  ×
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// src/pages/AiKnowledge/sections/Faq/Faq.jsx
import { useEffect, useState } from "react";
import Alert from "../../../../components/Alert/Alert";
import {
  getFaq,
  addFaq,
  deleteFaq,
  addFaqFromJson
} from "../../../../api/FaqApi";
import "./Faq.css";

const DEFAULT_JSON = `[
  {
    "question": "What is NextStock.ca?",
    "answer": "NextStock.ca is a DIY platform for investors..."
  },
  {
    "question": "Can I trade stocks on NextStock.ca?",
    "answer": "No. NextStock does not provide trading services."
  }
]`;

export default function Faq({ userId, email, jsonData }) {
  const [items, setItems] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [rawJson, setRawJson] = useState("");
  const [alert, setAlert] = useState(null);
  const [canEdit, setCanEdit] = useState(false);

  /* -------------------- LOAD -------------------- */
  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await getFaq();
      setItems(data);
    } catch {
      setAlert({ type: "error", message: "Failed to load FAQ" });
    }
  }

  /* -------------------- CHECK PERMISSION -------------------- */
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

  /* -------------------- ADD (FORM) -------------------- */
  async function handleAdd() {
    try {
      await addFaq({ userId, email, question, answer });
      setQuestion("");
      setAnswer("");
      load();
    } catch (err) {
      setAlert({ type: "error", message: err.message });
    }
  }

  /* -------------------- ADD (JSON) -------------------- */
  async function handleAddJson() {
    try {
      await addFaqFromJson({
        userId,
        email,
        rawJson
      });

      setRawJson("");
      load();

      setAlert({
        type: "success",
        message: "FAQ saved successfully",
        duration: 2
      });
    } catch (err) {
      setAlert({ type: "error", message: err.message });
    }
  }

  async function handleDelete(id) {
    try {
      await deleteFaq({ userId, email, id });
      setItems(items.filter(i => i.id !== id));
    } catch {
      setAlert({ type: "error", message: "Delete failed" });
    }
  }

  return (
    <div className="ai-knowledge-section">
      <h3>FAQ</h3>

      {alert && (
        <Alert {...alert} onClose={() => setAlert(null)} />
      )}

      {/* JSON MODE */}
      {jsonData && canEdit && (
        <>
          <textarea
            value={rawJson}
            onChange={(e) => setRawJson(e.target.value)}
            rows={12}
            placeholder={DEFAULT_JSON}
          />
          <button
            className="apple-btn primary"
            onClick={handleAddJson}
          >
            Save JSON
          </button>
        </>
      )}

      {/* FORM MODE */}
      {!jsonData && canEdit && (
        <div className="config-add">
          <input
            placeholder="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <textarea
            placeholder="Answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={4}
          />
          <button
            className="apple-btn primary"
            onClick={handleAdd}
            disabled={!question || !answer}
          >
            Add
          </button>
        </div>
      )}

      {items.length === 0 && (
        <p className="config-empty">No FAQ added yet.</p>
      )}

      <div className="config-vars">
        {items.map(item => (
          <div key={item.id} className="config-row">
            <div className="config-key">{item.question}</div>
            <div className="config-value">{item.answer}</div>

            {canEdit && (
              <button
                className="config-delete"
                onClick={() => handleDelete(item.id)}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

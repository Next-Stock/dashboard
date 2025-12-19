// src/pages/AiKnowledge/AiKnowledge.jsx
import { useState } from "react";
import "./AiKnowledge.css";

import Header from "../../static/Header";

import Accuracy from "./sections/Accuracy/Accuracy";
import Faq from "./sections/Faq/Faq";
import Website from "./sections/Website/Website";
import Videos from "./sections/Videos/Videos";
import Users from "./sections/Users/Users";

const SECTIONS = [
    { key: "accuracy", label: "Accuracy" },
    { key: "faq", label: "FAQ" },
    { key: "users", label: "Users" },
    { key: "videos", label: "Videos" },
    { key: "website", label: "Website" }
];

export default function AiKnowledge({ userId, email, onLogout, onBack }) {
    const [active, setActive] = useState("accuracy");
    const [jsonData, setJsonData] = useState(false);

    function renderSection() {
        const commonProps = { userId, email, jsonData };

        switch (active) {
            case "accuracy":
                return <Accuracy {...commonProps} />;
            case "faq":
                return <Faq {...commonProps} />;
            case "users":
                return <Users {...commonProps} />;
            case "website":
                return <Website {...commonProps} />;
            case "videos":
                return <Videos {...commonProps} />;
            default:
                return null;
        }
    }

    return (
        <div className="ai-knowledge-root">
            <Header onLogout={onLogout} onBack={onBack} hideAiKnowledge />

            <div className="ai-knowledge-page">
                {/* Sidebar */}
                <aside className="ai-knowledge-sidebar">
                    <h1>Next Stock App Knowledge</h1>
                    {SECTIONS.map((s) => (
                        <button
                            key={s.key}
                            className={`ai-knowledge-tab ${active === s.key ? "active" : ""}`}
                            onClick={() => setActive(s.key)}
                        >
                            {s.label}
                        </button>
                    ))}
                </aside>

                {/* Main */}
                <div className="ai-knowledge-main">
                    <div className="ai-knowledge-container">
                        {/* Toolbar */}
                        <div className="ai-knowledge-toolbar">
                            <div className="segmented-control">
                                <button
                                    className={!jsonData ? "active" : ""}
                                    onClick={() => setJsonData(false)}
                                >
                                    Advanced
                                </button>
                                <button
                                    className={jsonData ? "active" : ""}
                                    onClick={() => setJsonData(true)}
                                >
                                    Raw JSON
                                </button>
                            </div>
                        </div>

                        {renderSection()}
                    </div>
                </div>
            </div>
        </div>
    );
}

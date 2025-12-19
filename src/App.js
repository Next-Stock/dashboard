import { useState } from "react";
import { clearSession } from "./utils/authSession";
import Login from "./pages/Login/Login";
import AiKnowledge from "./pages/AiKnowledge/AiKnowledge";
import "./i18n";

export const PAGES = {
  LOGIN: "login",
  AI_KNOWLEDGE: "ai_knowledge"
};

export default function App() {
  const [page, setPage] = useState(PAGES.LOGIN);
  const [user, setUser] = useState(null);

  function handleLogin(userData) {
    setUser(userData);
    setPage(PAGES.AI_KNOWLEDGE);
  }

  function handleLogout() {
    clearSession(); 
    setUser(null);
    setPage(PAGES.LOGIN);
  }

  function renderPage() {
    switch (page) {

      case PAGES.AI_KNOWLEDGE:
        return (
          <AiKnowledge
            userId={user?.userId}
            email={user?.email}
            onBack={() => setPage(PAGES.LOGIN)}
            onLogout={handleLogout}
          />
        );

      case PAGES.LOGIN:
      default:
        return <Login onLogin={handleLogin} />;
    }
  }

  return <div className="app-container">{renderPage()}</div>;
}

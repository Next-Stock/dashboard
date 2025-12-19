import { useEffect, useState } from "react";
import Alert from "../../../../components/Alert/Alert";
import {
    getUsers,
    getClubTiers,
    updateUserPlan
} from "../../../../api/usersApi";
import "./Users.css";

const TABS = [
    { key: "club", label: "Club Members" },
    { key: "premium", label: "Premium" },
    { key: "trial", label: "Trial" },
    { key: "free", label: "Free" }
];

export default function Users() {
    const [users, setUsers] = useState([]);
    const [clubTiers, setClubTiers] = useState([]);
    const [activeTab, setActiveTab] = useState("club");
    const [search, setSearch] = useState("");
    const [alert, setAlert] = useState(null);

    const [editingUserId, setEditingUserId] = useState(null);

    // 🔥 expire modal state
    const [showExpireModal, setShowExpireModal] = useState(false);
    const [expireDate, setExpireDate] = useState("");
    const [pendingUser, setPendingUser] = useState(null);

    /* -------------------- LOAD -------------------- */
    useEffect(() => {
        load();
    }, []);

    async function load() {
        try {
            const [usersData, tiersData] = await Promise.all([
                getUsers(),
                getClubTiers()
            ]);

            setUsers(
                usersData.map(u => ({
                    ...u,
                    _planType: u.plan?.type || "free",
                    _clubTier: u.plan?.clubTier || "none"
                }))
            );

            setClubTiers(tiersData);
        } catch {
            setAlert({ type: "error", message: "Failed to load users" });
        }
    }

    /* -------------------- HELPERS -------------------- */
    function getDefaultExpire(user) {
        if (user?.plan?.expire) return user.plan.expire;

        const today = new Date().toISOString().split("T")[0];
        return `${today}T22:00:01`;
    }

    /* -------------------- FILTER -------------------- */
    function filterUsers() {
        return users.filter(u => {
            const plan = u.plan || {};
            const text = `${u.name || ""} ${u.email || ""}`.toLowerCase();

            if (search && !text.includes(search.toLowerCase())) return false;

            switch (activeTab) {
                case "club":
                    return plan.clubTier && plan.clubTier !== "none" && plan.type === "premium";
                case "premium":
                    return plan.type === "premium" && (!plan.clubTier || plan.clubTier === "none");
                case "trial":
                    return plan.trial === true;
                case "free":
                    return plan.type === "free";
                default:
                    return false;
            }
        });
    }

    /* -------------------- CONFIRM SAVE -------------------- */
    async function confirmSave() {
        try {
            await updateUserPlan({
                userId: pendingUser.id,
                planType: pendingUser._planType,
                clubTier: pendingUser._clubTier,
                expire: expireDate
            });

            setShowExpireModal(false);
            setEditingUserId(null);
            setPendingUser(null);

            load();

            setAlert({
                type: "success",
                message: "User updated successfully",
                duration: 2
            });
        } catch (err) {
            setAlert({ type: "error", message: err.message });
        }
    }

    function isExpired(expire) {
        if (!expire) return false;
        return new Date(expire).getTime() < Date.now();
    }

    const visibleUsers = filterUsers();

    return (
        <div className="ai-knowledge-section">
            <h3>Users</h3>

            {alert && <Alert {...alert} onClose={() => setAlert(null)} />}

            {/* ---------------- TOGGLE ---------------- */}
            <div className="segmented-control">
                {TABS.map(t => (
                    <button
                        key={t.key}
                        className={activeTab === t.key ? "active" : ""}
                        onClick={() => setActiveTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ---------------- SEARCH ---------------- */}
            <input
                className="users-search"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            {/* ---------------- LIST ---------------- */}
            <div className="users-list">
                {visibleUsers.map(u => {
                    const isEditing = editingUserId === u.id;

                    return (
                        <div key={u.id} className="user-card">
                            {/* HEADER */}
                            <div className="user-header">
                                <div className="user-title">
                                    <strong>{u.name || "No name"}</strong>
                                    <span style={{ marginLeft: "10px", fontWeight: "300" }}> {u.email}</span>

                                    {isExpired(u.plan?.expire) && (
                                        <span className="expire-tag">Expired</span>
                                    )}
                                </div>

                                <button
                                    className="edit-btn"
                                    onClick={() =>
                                        setEditingUserId(isEditing ? null : u.id)
                                    }
                                >
                                    ✏️
                                </button>
                            </div>

                            {/* META */}
                            <div className="user-meta">
                                <span>Status: {u.status}</span>
                                <span>Plan: {u.plan?.type || "n/a"}</span>
                                {u.plan?.clubTier && u.plan.clubTier !== "none" && (
                                    <span>Club: {u.plan.clubTier}</span>
                                )}
                            </div>

                            {/* EDIT PANEL */}
                            {isEditing && (
                                <div className="user-edit-panel">
                                    <select
                                        value={u._planType}
                                        onChange={e =>
                                            setUsers(prev =>
                                                prev.map(x =>
                                                    x.id === u.id
                                                        ? { ...x, _planType: e.target.value }
                                                        : x
                                                )
                                            )
                                        }
                                    >
                                        <option value="free">Free</option>
                                        <option value="premium">Premium</option>
                                    </select>

                                    <select
                                        value={u._clubTier}
                                        onChange={e =>
                                            setUsers(prev =>
                                                prev.map(x =>
                                                    x.id === u.id
                                                        ? { ...x, _clubTier: e.target.value }
                                                        : x
                                                )
                                            )
                                        }
                                    >
                                        <option value="none">NONE</option>
                                        {clubTiers.map(t => (
                                            <option key={t.value} value={t.value}>
                                                {t.label}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="edit-actions">
                                        <button
                                            className="apple-btn primary"
                                            onClick={() => {
                                                setPendingUser(u);
                                                setExpireDate(getDefaultExpire(u));
                                                setShowExpireModal(true);
                                            }}
                                        >
                                            Save
                                        </button>

                                        <button
                                            className="apple-btn secondary"
                                            onClick={() => setEditingUserId(null)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ---------------- EXPIRE MODAL ---------------- */}
            {showExpireModal && (
                <div className="modal-backdrop">
                    <div className="modal">
                        <h4>Confirm expiration date</h4>

                        <input
                            type="datetime-local"
                            value={expireDate}
                            onChange={e => setExpireDate(e.target.value)}
                        />

                        <div className="modal-actions">
                            <button
                                className="apple-btn primary"
                                onClick={confirmSave}
                            >
                                Confirm
                            </button>

                            <button
                                className="apple-btn secondary"
                                onClick={() => {
                                    setShowExpireModal(false);
                                    setPendingUser(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

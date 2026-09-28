import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "react-feather";
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
    const [trialEndedOpen, setTrialEndedOpen] = useState(true);
    const [premiumExpiredOpen, setPremiumExpiredOpen] = useState(true);
    const [activeTrialSort, setActiveTrialSort] = useState("name");
    const [activePremiumSort, setActivePremiumSort] = useState("name");
    const [endedTrialSort, setEndedTrialSort] = useState("name");
    const [expiredPremiumSort, setExpiredPremiumSort] = useState("name");
    const [clubExpiredOpen, setClubExpiredOpen] = useState(true);
    const [activeClubSort, setActiveClubSort] = useState("name");
    const [expiredClubSort, setExpiredClubSort] = useState("name");

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

    const trialUsers = activeTab === "trial" ? visibleUsers : [];
    const activeTrialUsers = trialUsers.filter(u => !isExpired(u.plan?.expire));
    const endedTrialUsers = trialUsers.filter(u => isExpired(u.plan?.expire));

    const sortedActiveTrialUsers = [...activeTrialUsers].sort((a, b) => {
        if (activeTrialSort === "name") {
            return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
        }

        if (activeTrialSort === "email") {
            return (a.email || "").localeCompare(b.email || "", undefined, { sensitivity: "base" });
        }

        const aTime = a.plan?.expire ? new Date(a.plan.expire).getTime() : Number.POSITIVE_INFINITY;
        const bTime = b.plan?.expire ? new Date(b.plan.expire).getTime() : Number.POSITIVE_INFINITY;
        return aTime - bTime;
    });

    const premiumUsers = activeTab === "premium" ? visibleUsers : [];
    const activePremiumUsers = premiumUsers.filter(u => !isExpired(u.plan?.expire));
    const expiredPremiumUsers = premiumUsers.filter(u => isExpired(u.plan?.expire));

    const sortedActivePremiumUsers = [...activePremiumUsers].sort((a, b) => {
        if (activePremiumSort === "name") {
            return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
        }

        if (activePremiumSort === "email") {
            return (a.email || "").localeCompare(b.email || "", undefined, { sensitivity: "base" });
        }

        const aTime = a.plan?.expire ? new Date(a.plan.expire).getTime() : Number.POSITIVE_INFINITY;
        const bTime = b.plan?.expire ? new Date(b.plan.expire).getTime() : Number.POSITIVE_INFINITY;
        return aTime - bTime;
    });

    function sortUsers(list, sortBy) {
        return [...list].sort((a, b) => {
            if (sortBy === "name") {
                return (a.name || "").localeCompare(b.name || "", undefined, { sensitivity: "base" });
            }
            if (sortBy === "email") {
                return (a.email || "").localeCompare(b.email || "", undefined, { sensitivity: "base" });
            }
            const aTime = a.plan?.expire ? new Date(a.plan.expire).getTime() : Number.POSITIVE_INFINITY;
            const bTime = b.plan?.expire ? new Date(b.plan.expire).getTime() : Number.POSITIVE_INFINITY;
            return aTime - bTime;
        });
    }

    const sortedEndedTrialUsers = sortUsers(endedTrialUsers, endedTrialSort);
    const sortedExpiredPremiumUsers = sortUsers(expiredPremiumUsers, expiredPremiumSort);

    const clubUsers = activeTab === "club" ? visibleUsers : [];
    const activeClubUsers = clubUsers.filter(u => !isExpired(u.plan?.expire));
    const expiredClubUsers = clubUsers.filter(u => isExpired(u.plan?.expire));
    const sortedActiveClubUsers = sortUsers(activeClubUsers, activeClubSort);
    const sortedExpiredClubUsers = sortUsers(expiredClubUsers, expiredClubSort);

    function formatDate(value) {
        if (!value) return "No end date";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    function renderUserCard(u) {
        const isEditing = editingUserId === u.id;

        return (
            <div key={u.id} className="user-card">
                <div className="user-header">
                    <div className="user-title">
                        <strong>{u.name || "No name"}</strong>
                        <span className="user-email">{u.email}</span>

                        {isExpired(u.plan?.expire) && (
                            <span className="expire-tag">Expired</span>
                        )}
                    </div>

                    <button
                        className="edit-btn"
                        onClick={() => setEditingUserId(isEditing ? null : u.id)}
                        aria-label={`Edit ${u.name || u.email || "user"}`}
                    >
                        ✏️
                    </button>
                </div>

                <div className="user-meta">
                    <span>Status: {u.status}</span>
                    <span>Plan: {u.plan?.type || "n/a"}</span>
                    {activeTab === "trial" && (
                        <span className={`trial-date-chip ${isExpired(u.plan?.expire) ? "date-expired" : "date-active"}`}>
                            Trial end: {formatDate(u.plan?.expire)}
                        </span>
                    )}
                    {(activeTab === "premium" || activeTab === "club") && u.plan?.expire && (
                        <span className={`trial-date-chip ${isExpired(u.plan?.expire) ? "date-expired" : "date-active"}`}>
                            {isExpired(u.plan?.expire) ? "Expired" : "Expires"}: {formatDate(u.plan?.expire)}
                        </span>
                    )}
                    {u.plan?.clubTier && u.plan.clubTier !== "none" && (
                        <span>Club: {u.plan.clubTier}</span>
                    )}
                </div>

                {isEditing && (
                    <div className="user-edit-panel">
                        <div className="user-id-readonly">
                            <span className="user-id-label">User ID</span>
                            <code className="user-id-value">{u.id || "Unavailable"}</code>
                        </div>

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
    }

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
            {activeTab === "trial" ? (
                <div className="trial-dashboard">
                    <div className="trial-summary-grid">
                        <div className="trial-summary-card active">
                            <span className="trial-summary-label">Active Trials</span>
                            <strong>{activeTrialUsers.length}</strong>
                            <small>Users currently within their trial period.</small>
                        </div>
                        <div className="trial-summary-card ended">
                            <span className="trial-summary-label">Ended Trials</span>
                            <strong>{endedTrialUsers.length}</strong>
                            <small>Users whose trial period has been completed.</small>
                        </div>
                    </div>
                    <div className={`split-users-layout ${trialEndedOpen ? "secondary-open" : ""}`}>
                    <section className="split-users-panel primary-panel">
                        <div className="split-panel-header sticky-list-header active-header">
                            <div>
                                <h4>Active Trials</h4>
                                <p>Users currently within their trial period.</p>
                            </div>
                            <div className="active-trial-header-actions">
                                <label className="trial-sort-control">
                                    <span>Sort by</span>
                                    <select
                                        value={activeTrialSort}
                                        onChange={e => setActiveTrialSort(e.target.value)}
                                        aria-label="Sort active trials"
                                    >
                                        <option value="expire">Expiration date</option>
                                        <option value="name">User name</option>
                                        <option value="email">Email</option>
                                    </select>
                                </label>
                                <span className="trial-count active">{activeTrialUsers.length}</span>
                            </div>
                        </div>
                        <div className="users-list split-users-list">
                            {sortedActiveTrialUsers.length > 0 ? sortedActiveTrialUsers.map(renderUserCard) : (
                                <div className="trial-empty">No active trials found.</div>
                            )}
                        </div>
                    </section>

                    <section className="split-users-panel secondary-panel ended-panel">
                        {trialEndedOpen ? (
                            <div className="secondary-expanded-header sticky-list-header">
                                <button type="button" className="secondary-expanded-title" onClick={() => setTrialEndedOpen(false)} title="Collapse ended trials">
                                    <span className="toggle-icon"><ChevronRight size={18} /></span>
                                    <span className="toggle-copy"><strong>Ended Trials</strong><small>{endedTrialUsers.length} completed trials</small></span>
                                </button>
                                <label className="trial-sort-control secondary-inline-sort">
                                    <span>Sort by</span>
                                    <select value={endedTrialSort} onChange={e => setEndedTrialSort(e.target.value)} aria-label="Sort ended trials">
                                        <option value="expire">Expiration date</option>
                                        <option value="name">User name</option>
                                        <option value="email">Email</option>
                                    </select>
                                </label>
                                <span className="trial-count ended">{endedTrialUsers.length}</span>
                            </div>
                        ) : (
                            <button type="button" className="secondary-panel-toggle ended-toggle sticky-list-header" onClick={() => setTrialEndedOpen(true)} aria-expanded={false} title="Open ended trials">
                                <span className="toggle-icon"><ChevronLeft size={18} /></span>
                                <span className="toggle-copy"><strong>Ended Trials</strong><small>{endedTrialUsers.length} completed trials</small></span>
                                <span className="trial-count ended">{endedTrialUsers.length}</span>
                            </button>
                        )}

                        <div className="secondary-panel-content">
                            <div className="users-list split-users-list">
                                {sortedEndedTrialUsers.length > 0 ? sortedEndedTrialUsers.map(renderUserCard) : (
                                    <div className="trial-empty">No ended trials found.</div>
                                )}
                            </div>
                        </div>
                    </section>
                    </div>
                </div>
            ) : activeTab === "premium" ? (
                <div className="trial-dashboard">
                    <div className="trial-summary-grid">
                        <div className="trial-summary-card active">
                            <span className="trial-summary-label">Active Premium</span>
                            <strong>{activePremiumUsers.length}</strong>
                            <small>Users with an active Premium subscription.</small>
                        </div>
                        <div className="trial-summary-card ended">
                            <span className="trial-summary-label">Expired Premium</span>
                            <strong>{expiredPremiumUsers.length}</strong>
                            <small>Premium subscriptions that expired without a subsequent renewal.</small>
                        </div>
                    </div>
                    <div className={`split-users-layout ${premiumExpiredOpen ? "secondary-open" : ""}`}>
                    <section className="split-users-panel primary-panel">
                        <div className="split-panel-header sticky-list-header active-header">
                            <div>
                                <h4>Active Premium</h4>
                                <p>Users with an active Premium subscription.</p>
                            </div>
                            <div className="active-trial-header-actions">
                                <label className="trial-sort-control">
                                    <span>Sort by</span>
                                    <select
                                        value={activePremiumSort}
                                        onChange={e => setActivePremiumSort(e.target.value)}
                                        aria-label="Sort active Premium users"
                                    >
                                        <option value="expire">Expiration date</option>
                                        <option value="name">User name</option>
                                        <option value="email">Email</option>
                                    </select>
                                </label>
                                <span className="trial-count active">{activePremiumUsers.length}</span>
                            </div>
                        </div>
                        <div className="users-list split-users-list">
                            {sortedActivePremiumUsers.length > 0 ? sortedActivePremiumUsers.map(renderUserCard) : (
                                <div className="trial-empty">No active Premium users found.</div>
                            )}
                        </div>
                    </section>

                    <section className="split-users-panel secondary-panel ended-panel">
                        {premiumExpiredOpen ? (
                            <div className="secondary-expanded-header sticky-list-header">
                                <button type="button" className="secondary-expanded-title" onClick={() => setPremiumExpiredOpen(false)} title="Collapse expired Premium users">
                                    <span className="toggle-icon"><ChevronRight size={18} /></span>
                                    <span className="toggle-copy"><strong>Expired Premium</strong><small>{expiredPremiumUsers.length} expired subscriptions</small></span>
                                </button>
                                <label className="trial-sort-control secondary-inline-sort">
                                    <span>Sort by</span>
                                    <select value={expiredPremiumSort} onChange={e => setExpiredPremiumSort(e.target.value)} aria-label="Sort expired Premium users">
                                        <option value="expire">Expiration date</option>
                                        <option value="name">User name</option>
                                        <option value="email">Email</option>
                                    </select>
                                </label>
                                <span className="trial-count ended">{expiredPremiumUsers.length}</span>
                            </div>
                        ) : (
                            <button type="button" className="secondary-panel-toggle ended-toggle sticky-list-header" onClick={() => setPremiumExpiredOpen(true)} aria-expanded={false} title="Open expired Premium users">
                                <span className="toggle-icon"><ChevronLeft size={18} /></span>
                                <span className="toggle-copy"><strong>Expired Premium</strong><small>{expiredPremiumUsers.length} expired subscriptions</small></span>
                                <span className="trial-count ended">{expiredPremiumUsers.length}</span>
                            </button>
                        )}

                        <div className="secondary-panel-content">
                            <div className="users-list split-users-list">
                                {sortedExpiredPremiumUsers.length > 0 ? sortedExpiredPremiumUsers.map(renderUserCard) : (
                                    <div className="trial-empty">No expired Premium users found.</div>
                                )}
                            </div>
                        </div>
                    </section>
                    </div>
                </div>
            ) : activeTab === "club" ? (
                <div className="trial-dashboard">
                    <div className="trial-summary-grid">
                        <div className="trial-summary-card active">
                            <span className="trial-summary-label">Active Club Members</span>
                            <strong>{activeClubUsers.length}</strong>
                            <small>Club members with an active subscription.</small>
                        </div>
                        <div className="trial-summary-card ended">
                            <span className="trial-summary-label">Expired Club Members</span>
                            <strong>{expiredClubUsers.length}</strong>
                            <small>Club memberships whose subscription has expired.</small>
                        </div>
                    </div>

                    <div className={`split-users-layout ${clubExpiredOpen ? "secondary-open" : ""}`}>
                        <section className="split-users-panel primary-panel">
                            <div className="split-panel-header sticky-list-header active-header">
                                <div>
                                    <h4>Active Club Members</h4>
                                    <p>Club members with an active subscription.</p>
                                </div>
                                <div className="active-trial-header-actions">
                                    <label className="trial-sort-control">
                                        <span>Sort by</span>
                                        <select value={activeClubSort} onChange={e => setActiveClubSort(e.target.value)} aria-label="Sort active Club members">
                                            <option value="expire">Expiration date</option>
                                            <option value="name">User name</option>
                                            <option value="email">Email</option>
                                        </select>
                                    </label>
                                    <span className="trial-count active">{activeClubUsers.length}</span>
                                </div>
                            </div>
                            <div className="users-list split-users-list">
                                {sortedActiveClubUsers.length > 0 ? sortedActiveClubUsers.map(renderUserCard) : (
                                    <div className="trial-empty">No active Club members found.</div>
                                )}
                            </div>
                        </section>

                        <section className="split-users-panel secondary-panel ended-panel">
                        {clubExpiredOpen ? (
                            <div className="secondary-expanded-header sticky-list-header">
                                <button type="button" className="secondary-expanded-title" onClick={() => setClubExpiredOpen(false)} title="Collapse expired Club members">
                                    <span className="toggle-icon"><ChevronRight size={18} /></span>
                                    <span className="toggle-copy"><strong>Expired Club</strong><small>{expiredClubUsers.length} expired memberships</small></span>
                                </button>
                                <label className="trial-sort-control secondary-inline-sort">
                                    <span>Sort by</span>
                                    <select value={expiredClubSort} onChange={e => setExpiredClubSort(e.target.value)} aria-label="Sort expired Club members">
                                        <option value="expire">Expiration date</option>
                                        <option value="name">User name</option>
                                        <option value="email">Email</option>
                                    </select>
                                </label>
                                <span className="trial-count ended">{expiredClubUsers.length}</span>
                            </div>
                        ) : (
                            <button type="button" className="secondary-panel-toggle ended-toggle sticky-list-header" onClick={() => setClubExpiredOpen(true)} aria-expanded={false} title="Open expired Club members">
                                <span className="toggle-icon"><ChevronLeft size={18} /></span>
                                <span className="toggle-copy"><strong>Expired Club</strong><small>{expiredClubUsers.length} expired memberships</small></span>
                                <span className="trial-count ended">{expiredClubUsers.length}</span>
                            </button>
                        )}
                            <div className="secondary-panel-content">
                                <div className="users-list split-users-list">
                                    {sortedExpiredClubUsers.length > 0 ? sortedExpiredClubUsers.map(renderUserCard) : (
                                        <div className="trial-empty">No expired Club members found.</div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            ) : (
                <div className="users-list">
                    {visibleUsers.map(renderUserCard)}
                    {visibleUsers.length === 0 && (
                        <div className="config-empty">No users found.</div>
                    )}
                </div>
            )}

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

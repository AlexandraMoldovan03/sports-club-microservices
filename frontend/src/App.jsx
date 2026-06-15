import { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";

const AUTH_URL = "https://auth-service-pixw.onrender.com/api/auth";
const CLUB_URL = "https://club-servicee.onrender.com/api/clubs";
const BOOKING_URL = "https://booking-service-wnh0.onrender.com/api/bookings";
const NOTIFICATION_URL = "https://notification-service-8zy2.onrender.com/api/notifications";

function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.message}</span>
          <button className="toast-close" onClick={() => removeToast(t.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

const Logo = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="20" fill="#0f766e" />
    <circle
      cx="20"
      cy="20"
      r="8"
      fill="none"
      stroke="white"
      strokeWidth="2"
    />
    <path d="M20 12v16M12 20h16" stroke="white" strokeWidth="2" />
  </svg>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState("login");
  const [activeTab, setActiveTab] = useState("clubs");

  const [clubs, setClubs] = useState([]);
  const [expandedClubId, setExpandedClubId] = useState(null);
  const [courts, setCourts] = useState({});
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [selectedCourt, setSelectedCourt] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  const [loading, setLoading] = useState({});
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => removeToast(id), 4500);
  };

  const removeToast = (id) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  const setLoad = (key, val) =>
    setLoading((l) => ({ ...l, [key]: val }));

  // ── Auth ───────────────────────────────────────────────────────────────

  const login = async (e) => {
    e.preventDefault();
    setLoad("login", true);
    try {
      const res = await axios.post(`${AUTH_URL}/login`, loginData);
      setUser(res.data.user);
      addToast(`Bun venit, ${res.data.user.name}!`);
    } catch (err) {
      addToast(
        err.response?.data?.message || "Email sau parolă incorectă.",
        "error"
      );
    } finally {
      setLoad("login", false);
    }
  };

  const register = async (e) => {
    e.preventDefault();
    setLoad("register", true);
    try {
      await axios.post(`${AUTH_URL}/register`, registerData);
      addToast("Cont creat cu succes! Te poți autentifica acum.");
      setAuthView("login");
      setLoginData({ email: registerData.email, password: "" });
    } catch (err) {
      addToast(
        err.response?.data?.message || "Înregistrare eșuată.",
        "error"
      );
    } finally {
      setLoad("register", false);
    }
  };

  const logout = () => {
    setUser(null);
    setAuthView("login");
    setBookings([]);
    setNotifications([]);
    setSelectedCourt(null);
    setExpandedClubId(null);
  };

  // ── Data loading ───────────────────────────────────────────────────────

  const loadClubs = async () => {
    setLoad("clubs", true);
    try {
      const res = await axios.get(CLUB_URL);
      setClubs(res.data);
    } catch {
      addToast("Nu s-au putut încărca cluburile.", "error");
    } finally {
      setLoad("clubs", false);
    }
  };

  const toggleClubCourts = async (clubId) => {
    if (expandedClubId === clubId) {
      setExpandedClubId(null);
      return;
    }
    setExpandedClubId(clubId);
    if (!courts[clubId]) {
      setLoad(`courts-${clubId}`, true);
      try {
        const res = await axios.get(`${CLUB_URL}/${clubId}/courts`);
        setCourts((c) => ({ ...c, [clubId]: res.data }));
      } catch {
        addToast("Nu s-au putut încărca terenurile.", "error");
      } finally {
        setLoad(`courts-${clubId}`, false);
      }
    }
  };

  const selectCourtForBooking = (court, clubId) => {
    setSelectedCourt({ ...court, clubId });
    setBookingData({ date: "", startTime: "", endTime: "" });
    setActiveTab("book");
  };

  const createBooking = async (e) => {
    e.preventDefault();
    if (!selectedCourt) return;
    setLoad("booking", true);
    try {
      await axios.post(BOOKING_URL, {
        userId: user.id,
        clubId: Number(selectedCourt.clubId),
        courtId: Number(selectedCourt.id),
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
      });
      addToast("Rezervare creată cu succes!");
      setSelectedCourt(null);
      setBookingData({ date: "", startTime: "", endTime: "" });
      setActiveTab("bookings");
      loadBookings();
      loadNotifications();
    } catch (err) {
      addToast(
        err.response?.data?.message || "Eroare la crearea rezervării.",
        "error"
      );
    } finally {
      setLoad("booking", false);
    }
  };

  const loadBookings = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${BOOKING_URL}/user/${user.id}`);
      setBookings(res.data);
    } catch {
      addToast("Nu s-au putut încărca rezervările.", "error");
    }
  };

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${NOTIFICATION_URL}/user/${user.id}`);
      setNotifications(res.data);
    } catch {}
  };

  useEffect(() => {
    loadClubs();
  }, []);

  useEffect(() => {
    if (user) {
      loadBookings();
      loadNotifications();
    }
  }, [user]);

  // ── Helpers ────────────────────────────────────────────────────────────

  const getClubName = (clubId) =>
    clubs.find((c) => c.id === clubId)?.name || `Club #${clubId}`;

  const getCourtName = (clubId, courtId) =>
    courts[clubId]?.find((c) => c.id === courtId)?.name ||
    `Teren #${courtId}`;

  const today = new Date().toISOString().split("T")[0];

  const formatDate = (dateStr) => {
    if (!dateStr) return { day: "--", month: "---" };
    const d = new Date(dateStr + "T00:00:00");
    return {
      day: d.getDate(),
      month: d.toLocaleString("ro", { month: "short" }),
    };
  };

  // ── Auth screen ────────────────────────────────────────────────────────

  if (!user) {
    return (
      <>
        <Toast toasts={toasts} removeToast={removeToast} />
        <div className="auth-bg">
          <div className="auth-card">
            <div className="auth-logo">
              <Logo />
              <h1>SportClub</h1>
            </div>

            <div className="auth-tabs">
              <button
                className={`auth-tab${authView === "login" ? " active" : ""}`}
                onClick={() => setAuthView("login")}
              >
                Autentificare
              </button>
              <button
                className={`auth-tab${authView === "register" ? " active" : ""}`}
                onClick={() => setAuthView("register")}
              >
                Înregistrare
              </button>
            </div>

            {authView === "login" ? (
              <form onSubmit={login} className="auth-form">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    placeholder="email@exemplu.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Parolă</label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary btn-full"
                  disabled={loading.login}
                >
                  {loading.login ? "Se autentifică..." : "Autentificare"}
                </button>
                <p className="auth-switch">
                  Nu ai cont?{" "}
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => setAuthView("register")}
                  >
                    Înregistrează-te
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={register} className="auth-form">
                <div className="form-group">
                  <label>Nume complet</label>
                  <input
                    type="text"
                    value={registerData.name}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        name: e.target.value,
                      })
                    }
                    placeholder="Numele tău"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      })
                    }
                    placeholder="email@exemplu.com"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Parolă</label>
                  <input
                    type="password"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                    placeholder="Minim 6 caractere"
                    required
                    minLength={6}
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary btn-full"
                  disabled={loading.register}
                >
                  {loading.register ? "Se creează contul..." : "Creează cont"}
                </button>
                <p className="auth-switch">
                  Ai deja cont?{" "}
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => setAuthView("login")}
                  >
                    Autentifică-te
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────────

  const tabs = [
    { key: "clubs", label: "Cluburi" },
    {
      key: "book",
      label: selectedCourt
        ? `Rezervare · ${selectedCourt.name}`
        : "Rezervare nouă",
    },
    {
      key: "bookings",
      label: `Rezervările mele${bookings.length ? ` (${bookings.length})` : ""}`,
    },
    {
      key: "notifications",
      label: `Notificări${notifications.length ? ` (${notifications.length})` : ""}`,
    },
  ];

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="header-inner">
            <div className="header-brand">
              <div className="brand-icon">
                <Logo />
              </div>
              <span className="brand-name">SportClub</span>
            </div>
            <div className="header-user">
              <div className="user-avatar">
                {user.name[0].toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role}</span>
              </div>
              <button className="btn-logout" onClick={logout}>
                Ieșire
              </button>
            </div>
          </div>
        </header>

        {/* Nav */}
        <nav className="main-nav">
          <div className="nav-inner">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                className={`nav-tab${activeTab === tab.key ? " active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <main className="main">
          {/* ── Cluburi ── */}
          {activeTab === "clubs" && (
            <div>
              <h2 className="section-title">Cluburi disponibile</h2>
              {loading.clubs ? (
                <p className="loading-text">Se încarcă cluburile...</p>
              ) : clubs.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏟</div>
                  <p>Niciun club disponibil momentan.</p>
                </div>
              ) : (
                <div className="clubs-grid">
                  {clubs.map((club) => (
                    <div key={club.id} className="club-card">
                      <div className="club-header">
                        <div>
                          <h3 className="club-name">{club.name}</h3>
                          <p className="club-location">📍 {club.location}</p>
                        </div>
                        <button
                          className={
                            expandedClubId === club.id
                              ? "btn-secondary"
                              : "btn-primary"
                          }
                          onClick={() => toggleClubCourts(club.id)}
                        >
                          {expandedClubId === club.id
                            ? "Ascunde"
                            : "Vezi terenuri"}
                        </button>
                      </div>

                      {expandedClubId === club.id && (
                        <div className="courts-list">
                          {loading[`courts-${club.id}`] ? (
                            <p className="loading-text">
                              Se încarcă terenurile...
                            </p>
                          ) : (courts[club.id] || []).length === 0 ? (
                            <p className="empty-text">
                              Niciun teren disponibil.
                            </p>
                          ) : (
                            (courts[club.id] || []).map((court) => (
                              <div key={court.id} className="court-item">
                                <div className="court-info">
                                  <span className="court-name">
                                    {court.name}
                                  </span>
                                  <span className="court-sport">
                                    {court.sport_type}
                                  </span>
                                  <span className="court-price">
                                    {court.price_per_hour} lei/oră
                                  </span>
                                </div>
                                <button
                                  className="btn-accent"
                                  onClick={() =>
                                    selectCourtForBooking(court, club.id)
                                  }
                                >
                                  Rezervă
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Rezervare nouă ── */}
          {activeTab === "book" && (
            <div className="booking-section">
              <h2 className="section-title">Rezervare nouă</h2>
              {!selectedCourt ? (
                <div className="empty-state">
                  <div className="empty-icon">🏟</div>
                  <p>
                    Selectează un teren din tabul{" "}
                    <strong>Cluburi</strong> pentru a face o rezervare.
                  </p>
                  <button
                    className="btn-primary"
                    onClick={() => setActiveTab("clubs")}
                  >
                    Mergi la Cluburi
                  </button>
                </div>
              ) : (
                <div className="booking-form-card">
                  <div className="selected-court-banner">
                    <div className="selected-badge">Teren selectat</div>
                    <h3>{selectedCourt.name}</h3>
                    <p>
                      🎾 {selectedCourt.sport_type} &nbsp;·&nbsp; 💰{" "}
                      {selectedCourt.price_per_hour} lei/oră
                    </p>
                    <button
                      className="btn-ghost-sm"
                      onClick={() => {
                        setSelectedCourt(null);
                        setActiveTab("clubs");
                      }}
                    >
                      ← Schimbă terenul
                    </button>
                  </div>

                  <form onSubmit={createBooking} className="booking-form">
                    <div className="form-group">
                      <label>Data</label>
                      <input
                        type="date"
                        value={bookingData.date}
                        min={today}
                        onChange={(e) =>
                          setBookingData({
                            ...bookingData,
                            date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Ora de început</label>
                        <input
                          type="time"
                          value={bookingData.startTime}
                          onChange={(e) =>
                            setBookingData({
                              ...bookingData,
                              startTime: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Ora de sfârșit</label>
                        <input
                          type="time"
                          value={bookingData.endTime}
                          onChange={(e) =>
                            setBookingData({
                              ...bookingData,
                              endTime: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn-primary btn-full"
                      disabled={loading.booking}
                    >
                      {loading.booking
                        ? "Se creează rezervarea..."
                        : "Confirmă rezervarea"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ── Rezervările mele ── */}
          {activeTab === "bookings" && (
            <div>
              <div className="section-header">
                <h2 className="section-title">Rezervările mele</h2>
                <button className="btn-ghost" onClick={loadBookings}>
                  ↻ Reîncarcă
                </button>
              </div>
              {bookings.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <p>Nu ai nicio rezervare încă.</p>
                  <button
                    className="btn-primary"
                    onClick={() => setActiveTab("clubs")}
                  >
                    Fă o rezervare
                  </button>
                </div>
              ) : (
                <div className="bookings-list">
                  {bookings.map((b) => {
                    const { day, month } = formatDate(b.date);
                    return (
                      <div key={b._id || b.id} className="booking-item">
                        <div className="booking-date-badge">
                          <span className="booking-day">{day}</span>
                          <span className="booking-month">{month}</span>
                        </div>
                        <div className="booking-details">
                          <p className="booking-club">
                            {getClubName(b.clubId)}
                          </p>
                          <p className="booking-court">
                            {getCourtName(b.clubId, b.courtId)}
                          </p>
                          <p className="booking-time">
                            ⏰ {b.startTime} – {b.endTime}
                          </p>
                        </div>
                        <span className="status-badge">
                          {b.status || "Confirmată"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Notificări ── */}
          {activeTab === "notifications" && (
            <div>
              <div className="section-header">
                <h2 className="section-title">Notificări</h2>
                <button className="btn-ghost" onClick={loadNotifications}>
                  ↻ Reîncarcă
                </button>
              </div>
              {notifications.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔔</div>
                  <p>Nu ai nicio notificare.</p>
                </div>
              ) : (
                <div className="notifications-list">
                  {notifications.map((n) => (
                    <div key={n.id} className="notification-item">
                      <div className="notif-icon">🔔</div>
                      <div className="notif-content">
                        <p className="notif-message">{n.message}</p>
                        <small className="notif-time">
                          {new Date(n.createdAt).toLocaleString("ro")}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}

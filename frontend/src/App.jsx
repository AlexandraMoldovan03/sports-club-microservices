import { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";

const AUTH_URL = "http://localhost:4001/api/auth";
const CLUB_URL = "http://localhost:4002/api/clubs";
const BOOKING_URL = "http://localhost:4003/api/bookings";
const NOTIFICATION_URL = "http://localhost:4004/api/notifications";

function App() {
  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [courts, setCourts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loginData, setLoginData] = useState({
    email: "alexandra@test.com",
    password: "123456"
  });

  const [selectedClubId, setSelectedClubId] = useState("");
  const [bookingData, setBookingData] = useState({
    courtId: "",
    date: "2026-06-20",
    startTime: "22:00",
    endTime: "23:00"
  });

  const login = async () => {
    try {
      const res = await axios.post(`${AUTH_URL}/login`, loginData);
      setUser(res.data.user);
      alert("Login reușit");
    } catch (err) {
      alert("Login eșuat");
    }
  };

  const loadClubs = async () => {
    const res = await axios.get(CLUB_URL);
    setClubs(res.data);
  };

  const loadCourts = async (clubId) => {
    setSelectedClubId(clubId);
    const res = await axios.get(`${CLUB_URL}/${clubId}/courts`);
    setCourts(res.data);
  };

  const createBooking = async () => {
    try {
      await axios.post(BOOKING_URL, {
        userId: user.id,
        clubId: Number(selectedClubId),
        courtId: Number(bookingData.courtId),
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime
      });

      alert("Rezervare creată cu succes");
      loadBookings();
      loadNotifications();
    } catch (err) {
      alert(err.response?.data?.message || "Eroare la rezervare");
    }
  };

  const loadBookings = async () => {
    if (!user) return;
    const res = await axios.get(`${BOOKING_URL}/user/${user.id}`);
    setBookings(res.data);
  };

  const loadNotifications = async () => {
    if (!user) return;
    const res = await axios.get(`${NOTIFICATION_URL}/user/${user.id}`);
    setNotifications(res.data);
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

  return (
    <div className="app">
      <h1>Sports Club Booking Platform</h1>

      {!user ? (
        <section className="card">
          <h2>Login</h2>

          <input
            type="email"
            value={loginData.email}
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
            placeholder="Email"
          />

          <input
            type="password"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            placeholder="Password"
          />

          <button onClick={login}>Login</button>
        </section>
      ) : (
        <>
          <section className="card">
            <h2>Utilizator autentificat</h2>
            <p>{user.name}</p>
            <p>{user.email}</p>
            <p>Rol: {user.role}</p>
          </section>

          <section className="card">
            <h2>Cluburi disponibile</h2>

            {clubs.map((club) => (
              <div key={club.id} className="item">
                <strong>{club.name}</strong>
                <p>{club.location}</p>
                <button onClick={() => loadCourts(club.id)}>
                  Vezi terenuri
                </button>
              </div>
            ))}
          </section>

          <section className="card">
            <h2>Terenuri</h2>

            {courts.map((court) => (
              <div key={court.id} className="item">
                <strong>{court.name}</strong>
                <p>Sport: {court.sport_type}</p>
                <p>Preț/oră: {court.price_per_hour} lei</p>

                <button
                  onClick={() =>
                    setBookingData({ ...bookingData, courtId: court.id })
                  }
                >
                  Selectează teren
                </button>
              </div>
            ))}
          </section>

          <section className="card">
            <h2>Creează rezervare</h2>

            <input
              value={bookingData.courtId}
              onChange={(e) =>
                setBookingData({ ...bookingData, courtId: e.target.value })
              }
              placeholder="Court ID"
            />

            <input
              type="date"
              value={bookingData.date}
              onChange={(e) =>
                setBookingData({ ...bookingData, date: e.target.value })
              }
            />

            <input
              value={bookingData.startTime}
              onChange={(e) =>
                setBookingData({ ...bookingData, startTime: e.target.value })
              }
              placeholder="Start time"
            />

            <input
              value={bookingData.endTime}
              onChange={(e) =>
                setBookingData({ ...bookingData, endTime: e.target.value })
              }
              placeholder="End time"
            />

            <button onClick={createBooking}>Rezervă</button>
          </section>

          <section className="card">
            <h2>Rezervările mele</h2>

            {bookings.map((booking) => (
              <div key={booking._id} className="item">
                <p>Club ID: {booking.clubId}</p>
                <p>Teren ID: {booking.courtId}</p>
                <p>
                  {booking.date}, {booking.startTime} - {booking.endTime}
                </p>
              </div>
            ))}
          </section>

          <section className="card">
            <h2>Notificări</h2>

            {notifications.map((notification) => (
              <div key={notification.id} className="item">
                <p>{notification.message}</p>
                <small>{notification.createdAt}</small>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

export default App;
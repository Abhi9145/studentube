import { API_URL } from "../config";
import { useEffect, useState } from "react";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [stats, setStats] = useState({
    playlists: 0,
    savedVideos: 0,
    history: 0,
  });

  useEffect(() => {
    const userData = {
      name: localStorage.getItem("name"),
      email: localStorage.getItem("email"),
    };
    setUser(userData);

    // Get initial theme
    const activeTheme = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(activeTheme);

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/users/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
    setTheme(nextTheme);
  };

  if (!user) {
    return <h2 style={{ padding: "40px", textAlign: "center", color: "var(--muted-text)" }}>Loading...</h2>;
  }

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "30px auto",
        padding: "20px",
      }}
    >
      <h1>👤 My Profile</h1>

      {/* Profile Card */}
      <div
        className="profile-card"
        style={{
          marginTop: "20px",
          padding: "24px",
          background: "var(--card-bg)",
          borderRadius: "15px",
          border: "1px solid var(--border-color)",
        }}
      >
        <h2 style={{ marginBottom: "6px" }}>{user.name}</h2>
        <p style={{ color: "var(--muted-text)" }}>{user.email}</p>
      </div>

      {/* Theme Settings Card */}
      <div
        className="profile-card"
        style={{
          marginTop: "20px",
          padding: "24px",
          background: "var(--card-bg)",
          borderRadius: "15px",
          border: "1px solid var(--border-color)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Settings</h2>
          <p style={{ color: "var(--muted-text)", fontSize: "14px", marginTop: "4px" }}>
            Customize your learning theme interface preference
          </p>
        </div>
        <button
          onClick={toggleTheme}
          style={{
            padding: "10px 20px",
            borderRadius: "20px",
            border: "1px solid var(--border-color)",
            background: "var(--secondary-bg)",
            color: "var(--text-color)",
            cursor: "pointer",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            transition: "transform 0.2s, background-color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
        >
          {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </div>

      <h2
        style={{
          marginTop: "40px",
          marginBottom: "20px",
        }}
      >
        📊 Statistics
      </h2>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: "var(--card-bg)",
            padding: "25px",
            borderRadius: "15px",
            border: "1px solid var(--border-color)",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "36px", marginBottom: "10px" }}>📁</h1>
          <h2 style={{ fontSize: "24px", fontWeight: "700" }}>{stats.playlists}</h2>
          <p style={{ color: "var(--muted-text)", marginTop: "4px" }}>Playlists</p>
        </div>

        <div
          style={{
            background: "var(--card-bg)",
            padding: "25px",
            borderRadius: "15px",
            border: "1px solid var(--border-color)",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "36px", marginBottom: "10px" }}>💾</h1>
          <h2 style={{ fontSize: "24px", fontWeight: "700" }}>{stats.savedVideos}</h2>
          <p style={{ color: "var(--muted-text)", marginTop: "4px" }}>Saved Videos</p>
        </div>

        <div
          style={{
            background: "var(--card-bg)",
            padding: "25px",
            borderRadius: "15px",
            border: "1px solid var(--border-color)",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: "36px", marginBottom: "10px" }}>📜</h1>
          <h2 style={{ fontSize: "24px", fontWeight: "700" }}>{stats.history}</h2>
          <p style={{ color: "var(--muted-text)", marginTop: "4px" }}>History</p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
import { useEffect, useState } from "react";

function ProfilePage() {
  const [user, setUser] = useState(null);

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

    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8000/api/users/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) {
    return <h2>Loading...</h2>;
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

      <div
        className="profile-card"
        style={{
          marginTop: "20px",
          padding: "20px",
          background: "#181818",
          borderRadius: "15px",
        }}
      >
        <h2>{user.name}</h2>

        <p>{user.email}</p>
      </div>

      <h2
        style={{
          marginTop: "30px",
          marginBottom: "20px",
        }}
      >
        📊 Statistics
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
        }}
      >
        <div
          style={{
            background: "#181818",
            padding: "25px",
            borderRadius: "15px",
            textAlign: "center",
          }}
        >
          <h1>📁</h1>
          <h2>{stats.playlists}</h2>
          <p>Playlists</p>
        </div>

        <div
          style={{
            background: "#181818",
            padding: "25px",
            borderRadius: "15px",
            textAlign: "center",
          }}
        >
          <h1>💾</h1>
          <h2>{stats.savedVideos}</h2>
          <p>Saved Videos</p>
        </div>

        <div
          style={{
            background: "#181818",
            padding: "25px",
            borderRadius: "15px",
            textAlign: "center",
          }}
        >
          <h1>📜</h1>
          <h2>{stats.history}</h2>
          <p>History</p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
import "./Dashboard.css";

function Dashboard() {
  const name =
    localStorage.getItem("name") || "Student";

  const watched =
    JSON.parse(localStorage.getItem("watched")) || [];

  const playlists =
    JSON.parse(localStorage.getItem("playlists")) || [];

  const progress = Math.min(
    watched.length * 10,
    100
  );

  return (
    <div className="dashboard">

      <div className="welcome-card">
        <div>
          <h1>
            👋 Welcome Back,
            <br />
            {name}
          </h1>

          <p>
            Keep learning something new today 🚀
          </p>
        </div>

        <div className="goal-circle">

          <span>{progress}%</span>

        </div>

      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <h2>🔥</h2>
          <h3>Daily Goal</h3>
          <p>{progress}%</p>
        </div>

        <div className="stat-card">
          <h2>▶</h2>
          <h3>Videos Watched</h3>
          <p>{watched.length}</p>
        </div>

        <div className="stat-card">
          <h2>📚</h2>
          <h3>Playlists</h3>
          <p>{playlists.length}</p>
        </div>

        <div className="stat-card">
          <h2>🔥</h2>
          <h3>Current Streak</h3>
          <p>6 Days</p>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;
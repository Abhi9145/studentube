import { Link } from "react-router-dom";

function Navbar({
  searchTerm,
  setSearchTerm,
  handleSearch,
}) {
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 20px",
        borderBottom: "1px solid #ddd",
      }}
    >
      <Link
        to="/"
        style={{
          textDecoration: "none",
          color: "black",
        }}
      >
        <h2>🎓 StudenTube</h2>
      </Link>

      <div
        style={{
          display: "flex",
          gap: "10px",
        }}
      >
        <input
          type="text"
          placeholder="Search videos..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          style={{
            padding: "8px",
            width: "300px",
          }}
        />

        <button onClick={handleSearch}>
          Search
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "15px",
          alignItems: "center",
        }}
      >
        <Link to="/">Home</Link>

        <Link to="/saved">
          Saved Videos
        </Link>

        <Link to="/history">
          History
        </Link>

        {!token ? (
          <>
            <Link to="/login">
              Login
            </Link>

            <Link to="/register">
              Register
            </Link>
          </>
        ) : (
          <button onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
import { Link } from "react-router-dom";

function Navbar({
  searchTerm,
  setSearchTerm,
  handleSearch,
}) {
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <nav className="navbar">

      <Link
        to="/"
        style={{
          textDecoration: "none",
          flexShrink: 0,
        }}
      >
        <div className="logo">
          ▶ Studentube
        </div>
      </Link>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search educational videos..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />

        <button onClick={handleSearch}>
          🔍
        </button>
      </div>

      <div className="nav-links">

        <Link to="/saved">Saved</Link>

        <Link to="/history">History</Link>

        <Link to="/profile">Profile</Link>

        {!token ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
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
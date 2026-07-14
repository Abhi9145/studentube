import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ searchTerm, setSearchTerm, handleSearch, onLogoClick }) {
  const token = localStorage.getItem("token");
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };
  const userName = localStorage.getItem("name") || "Student";
  const userEmail = localStorage.getItem("email") || "";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Search recommendation states
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const searchContainerRef = useRef(null);

  const educationalKeywords = [
    "python", "java", "javascript", "react", "node", "mongodb", "mern", "html", "css", "c", "c++",
    "programming", "coding", "tutorial", "course", "lecture", "education", "computer science", "mathematics",
    "physics", "chemistry", "biology", "history", "geography", "algorithm", "data structure", "dbms",
    "operating system", "os", "networking", "cybersecurity", "machine learning", "artificial intelligence",
    "ai", "data science", "web development", "android development", "backend", "frontend", "exam",
    "placement", "interview", "aptitude"
  ];

  // Filter recommendations based on user input
  const suggestions = searchTerm.trim()
    ? educationalKeywords.filter(keyword =>
        keyword.toLowerCase().startsWith(searchTerm.trim().toLowerCase()) &&
        keyword.toLowerCase() !== searchTerm.trim().toLowerCase()
      ).slice(0, 5)
    : [];

  // Close dropdown / suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    setDropdownOpen(false);
    navigate("/login");
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) =>
        Math.min(prev + 1, suggestions.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
        const selected = suggestions[activeSuggestionIndex];
        setSearchTerm(selected);
        setShowSuggestions(false);
        handleSearch(selected);
      } else {
        setShowSuggestions(false);
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" onClick={onLogoClick} style={{ textDecoration: "none", flexShrink: 0 }}>
        <div className="logo">▶ Studentube</div>
      </Link>

      {/* Search */}
      <div className="search-container" ref={searchContainerRef} style={{ position: "relative", flex: 1, maxWidth: "500px" }}>
        <div className="search-box" style={{ width: "100%", maxWidth: "none" }}>
          <input
            type="text"
            placeholder="Search educational videos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
              setActiveSuggestionIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={() => { setShowSuggestions(false); handleSearch(); }}>🔍</button>
        </div>

        {/* Search Recommendations / Autocomplete Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="search-suggestions">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                className={`suggestion-item ${index === activeSuggestionIndex ? "active" : ""}`}
                onClick={() => handleSuggestionClick(suggestion)}
                onMouseEnter={() => setActiveSuggestionIndex(index)}
              >
                🔍 <span className="suggestion-text">{suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nav links */}
      <div className="nav-links">
        <Link to="/saved" className="nav-link">💾 Saved</Link>
        <Link to="/history" className="nav-link">🕒 History</Link>

        {/* Theme Toggle */}
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {!token ? (
          <>
            <Link to="/login" className="nav-btn-ghost">Login</Link>
            <Link to="/register" className="nav-btn-primary">Sign Up</Link>
          </>
        ) : (
          <div className="nav-avatar-wrapper" ref={dropdownRef}>
            <button
              className="nav-avatar-btn"
              onClick={() => setDropdownOpen((prev) => !prev)}
              title={userName}
            >
              {initials}
            </button>

            {dropdownOpen && (
              <div className="nav-dropdown">
                {/* User info */}
                <div className="nav-dropdown-user">
                  <div className="nav-dropdown-avatar">{initials}</div>
                  <div>
                    <div className="nav-dropdown-name">{userName}</div>
                    <div className="nav-dropdown-email">{userEmail}</div>
                  </div>
                </div>

                <div className="nav-dropdown-divider" />

                <Link to="/profile" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                  👤 My Profile
                </Link>
                <Link to="/saved" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                  💾 Saved Videos
                </Link>
                <Link to="/history" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                  🕒 Watch History
                </Link>
                <Link to="/playlists" className="nav-dropdown-item" onClick={() => setDropdownOpen(false)}>
                  📁 My Playlists
                </Link>

                <div className="nav-dropdown-divider" />

                <button className="nav-dropdown-logout" onClick={logout}>
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
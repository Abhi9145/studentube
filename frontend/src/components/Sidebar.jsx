import { Link, useNavigate, useLocation } from "react-router-dom";

function Sidebar({ onCategoryClick, onHomeClick, activeCategory }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: "🏠", isHomeAction: true },
    { name: "Playlists", path: "/playlists", icon: "📁" },
    { name: "Saved Videos", path: "/saved", icon: "💾" },
    { name: "Watch History", path: "/history", icon: "🕒" },
  ];

  const categories = [
    { name: "Programming", icon: "💻" },
    { name: "DSA", icon: "⚡" },
    { name: "Web Development", icon: "🌐" },
    { name: "Python", icon: "🐍" },
    { name: "Java", icon: "☕" },
    { name: "React", icon: "⚛️" },
    { name: "Mathematics", icon: "📐" },
    { name: "Science", icon: "🔬" },
    { name: "Data Science", icon: "📊" },
    { name: "Machine Learning", icon: "🤖" },
    { name: "Artificial Intelligence", icon: "🧠" },
    { name: "C++", icon: "⚡" },
    { name: "DevOps", icon: "🛠️" },
  ];

  const handleHome = () => {
    navigate("/");
    if (onHomeClick) onHomeClick();
  };

  const handleCategory = (categoryName) => {
    navigate("/");
    if (onCategoryClick) onCategoryClick(categoryName);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-section-title">
          <span>NAVIGATION</span>
        </div>
        <div className="sidebar-nav-list">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path && (!item.isHomeAction || !activeCategory);
            if (item.isHomeAction) {
              return (
                <button
                  key={item.name}
                  className={`sidebar-link-btn ${isActive ? "active" : ""}`}
                  onClick={handleHome}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.name}</span>
                </button>
              );
            }
            return (
              <Link key={item.name} to={item.path} style={{ textDecoration: "none" }}>
                <button className={`sidebar-link-btn ${isActive ? "active" : ""}`}>
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.name}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="sidebar-section" style={{ marginTop: "24px" }}>
        <div className="sidebar-section-title">
          <span>EXPLORE TOPICS</span>
        </div>
        <div className="sidebar-nav-list">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                className={`sidebar-link-btn category-item-btn ${isActive ? "active" : ""}`}
                onClick={() => handleCategory(cat.name)}
              >
                <span className="sidebar-icon">{cat.icon}</span>
                <span className="sidebar-label">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
import { Link, useNavigate, useLocation } from "react-router-dom";

function Sidebar({ onCategoryClick, onHomeClick, activeCategory }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      name: "Home",
      path: "/",
      isHomeAction: true,
      iconSvg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
    },
    {
      name: "Playlists",
      path: "/playlists",
      iconSvg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
    },
    {
      name: "Saved Videos",
      path: "/saved",
      iconSvg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
    },
    {
      name: "Watch History",
      path: "/history",
      iconSvg: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      ),
    },
  ];

  const categories = [
    "Programming",
    "DSA",
    "Web Development",
    "Python",
    "Java",
    "React",
    "Mathematics",
    "Science",
    "Data Science",
    "Machine Learning",
    "Artificial Intelligence",
    "C++",
    "DevOps",
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
                  <span className="sidebar-icon">{item.iconSvg}</span>
                  <span className="sidebar-label">{item.name}</span>
                </button>
              );
            }
            return (
              <Link key={item.name} to={item.path} style={{ textDecoration: "none" }}>
                <button className={`sidebar-link-btn ${isActive ? "active" : ""}`}>
                  <span className="sidebar-icon">{item.iconSvg}</span>
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
          {categories.map((catName) => {
            const isActive = activeCategory === catName;
            return (
              <button
                key={catName}
                className={`sidebar-link-btn category-item-btn ${isActive ? "active" : ""}`}
                onClick={() => handleCategory(catName)}
              >
                <span className="sidebar-bullet" />
                <span className="sidebar-label">{catName}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
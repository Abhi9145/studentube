import { Link } from "react-router-dom";

function Sidebar({ onCategoryClick }) {
  const categories = [
    "Programming",
    "Mathematics",
    "Science",
    "Data Science",
    "Web Development",
    "Artificial Intelligence",
  ];

  return (
    <div className="sidebar">
      <h3>Navigation</h3>

      <Link to="/">
        <button className="category-btn">
          🏠 Home
        </button>
      </Link>


      <Link to="/playlists">
       <button className="category-btn">
         📁 Playlists
       </button>
      </Link>


      <Link to="/saved">
        <button className="category-btn">
          💾 Saved Videos
        </button>
      </Link>

      <Link to="/history">
        <button className="category-btn">
          🕒 Watch History
        </button>
      </Link>

      <h3 style={{ marginTop: "20px" }}>
        Categories
      </h3>

      {categories.map((category) => (
        <button
          key={category}
          className="category-btn"
          onClick={() => onCategoryClick(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default Sidebar;
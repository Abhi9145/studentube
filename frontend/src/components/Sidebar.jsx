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
      <h3>Categories</h3>

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
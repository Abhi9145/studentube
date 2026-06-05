function Navbar({ searchTerm, setSearchTerm, handleSearch }) {
  return (
    <div className="navbar">
      <h2>🎓 Studentube</h2>

      <input
        type="text"
        placeholder="Search educational videos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
    </div>
  );
}

export default Navbar;
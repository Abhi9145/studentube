function TopicChips({ onTopicClick }) {
const topics = [
  "Python",
  "React",
  "Java",
  "DSA",
  "DBMS",
  "AI",
];

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        overflowX: "auto",
        paddingBottom: "10px",
        marginBottom: "30px",
      }}
    >
      {topics.map((topic) => (
        <button
          key={topic}
          onClick={() => onTopicClick(topic)}
          style={{
            padding: "10px 18px",
            borderRadius: "999px",
            border: "none",
            background: "#272727",
            color: "white",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: ".3s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#ff0000";
            e.target.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#272727";
            e.target.style.transform = "scale(1)";
          }}
        >
          {topic}
        </button>
      ))}
    </div>
  );
}

export default TopicChips;
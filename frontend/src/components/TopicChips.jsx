import { useState } from "react";

function TopicChips({ onTopicClick, activeTopic }) {
  const topics = [
    { name: "All", icon: "✨" },
    { name: "Python", icon: "🐍" },
    { name: "React", icon: "⚛️" },
    { name: "Java", icon: "☕" },
    { name: "DSA", icon: "⚡" },
    { name: "DBMS", icon: "🗄️" },
    { name: "AI", icon: "🧠" },
    { name: "C++", icon: "💻" },
    { name: "JavaScript", icon: "📜" },
    { name: "Web Development", icon: "🌐" },
    { name: "Machine Learning", icon: "🤖" },
    { name: "SQL", icon: "📊" },
    { name: "DevOps", icon: "🛠️" },
    { name: "Linux", icon: "🐧" },
  ];

  const [selectedTopic, setSelectedTopic] = useState(activeTopic || "All");

  const handleClick = (topicName) => {
    setSelectedTopic(topicName);
    if (topicName === "All") {
      onTopicClick("");
    } else {
      onTopicClick(topicName);
    }
  };

  return (
    <div className="topic-chips-wrapper">
      <div className="topic-chips-scroll">
        {topics.map((t) => {
          const isActive = (selectedTopic === t.name) || (activeTopic === t.name) || (t.name === "All" && !activeTopic);
          return (
            <button
              key={t.name}
              className={`topic-chip-btn ${isActive ? "active" : ""}`}
              onClick={() => handleClick(t.name)}
            >
              <span className="chip-icon">{t.icon}</span>
              <span className="chip-label">{t.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TopicChips;
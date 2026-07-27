import { useState } from "react";

function TopicChips({ onTopicClick, activeTopic }) {
  const topics = [
    "All",
    "Python",
    "React",
    "Java",
    "DSA",
    "DBMS",
    "AI",
    "C++",
    "JavaScript",
    "Web Development",
    "Machine Learning",
    "SQL",
    "DevOps",
    "Linux",
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
        {topics.map((name) => {
          const isActive = (selectedTopic === name) || (activeTopic === name) || (name === "All" && !activeTopic);
          return (
            <button
              key={name}
              className={`topic-chip-btn ${isActive ? "active" : ""}`}
              onClick={() => handleClick(name)}
            >
              <span className="chip-label">{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TopicChips;
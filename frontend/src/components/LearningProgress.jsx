import { API_URL } from "../config";
import { useEffect, useState } from "react";

function LearningProgress() {
  const [progress, setProgress] = useState(0);
  const [watched, setWatched] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    fetch(`${API_URL}/api/videos/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const count = data.length;

        setWatched(count);

        const percentage = Math.min(count * 10, 100);

        setProgress(percentage);
      });
  }, []);

  return (
    <div
      style={{
        background: "#181818",
        padding: "20px",
        borderRadius: "15px",
        marginBottom: "30px",
      }}
    >
      <h2>📈 Learning Progress</h2>

      <p>
        You've watched{" "}
        <strong>{watched}</strong> educational videos.
      </p>

      <div
        style={{
          width: "100%",
          height: "12px",
          background: "#333",
          borderRadius: "10px",
          marginTop: "20px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background:
              "linear-gradient(90deg,#ff0000,#ff5b5b)",
            transition: "1s",
          }}
        ></div>
      </div>

      <p
        style={{
          marginTop: "10px",
        }}
      >
        {progress}% Goal Completed
      </p>
    </div>
  );
}

export default LearningProgress;
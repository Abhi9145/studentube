import "./App.css";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import TopicChips from "./components/TopicChips";
import VideoCard from "./components/VideoCard";
import ContinueWatching from "./components/ContinueWatching";

function App() {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    fetch(
      `http://localhost:8000/api/videos/search?q=${searchTerm}`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Search Data:", data);

        if (data.educationalOnly) {
          alert(data.message);
          setVideos([]);
          return;
        }

        if (Array.isArray(data)) {
          setVideos(data);
        } else if (data.items) {
          setVideos(data.items);
        } else {
          setVideos([]);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleCategoryClick = (category) => {
    setSearchTerm(category);

    fetch(
      `http://localhost:8000/api/videos/search?q=${category}`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Category Data:", data);

        if (data.educationalOnly) {
          alert(data.message);
          setVideos([]);
          return;
        }

        if (Array.isArray(data)) {
          setVideos(data);
        } else if (data.items) {
          setVideos(data.items);
        } else {
          setVideos([]);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetch(
      "http://localhost:8000/api/videos/search?q=computer science tutorial"
    )
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setVideos(data);
        } else if (data.items) {
          setVideos(data.items);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
      />

      <div className="layout">
        <Sidebar
          onCategoryClick={handleCategoryClick}
        />

        <div className="main-content">
     
<TopicChips onTopicClick={handleCategoryClick} />

<ContinueWatching />

          <h2
            style={{
              marginBottom: "20px",
            }}
          >
            🔥 Recommended Videos
          </h2>

          {videos.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "50px",
              }}
            >
              <h2>
                📚 Studentube says:
              </h2>

              <p>
                Search for educational
                content only 😎
              </p>
            </div>
          ) : (
            <div className="video-grid">
              {videos.map((video) => (
                <VideoCard
                  key={video.id?.videoId}
                  video={{
                    title:
                      video.snippet?.title,
                    channel:
                      video.snippet
                        ?.channelTitle,
                    thumbnail:
                      video.snippet
                        ?.thumbnails?.high
                        ?.url,
                    videoId:
                      video.id?.videoId,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
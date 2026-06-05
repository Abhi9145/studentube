import "./App.css";
import { useEffect, useState } from "react";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import VideoCard from "./components/VideoCard";

function App() {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("python");

  const handleSearch = () => {
    fetch(`http://localhost:8000/api/videos/search?q=${searchTerm}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Search Data:", data);

        if (Array.isArray(data)) {
          setVideos(data);
        } else if (data.items) {
          setVideos(data.items);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleCategoryClick = (category) => {
    setSearchTerm(category);

    fetch(`http://localhost:8000/api/videos/search?q=${category}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Category Data:", data);

        if (Array.isArray(data)) {
          setVideos(data);
        } else if (data.items) {
          setVideos(data.items);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    handleSearch();
  }, []);

  return (
    <>
      <Navbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
      />

      <div className="layout">
        <Sidebar onCategoryClick={handleCategoryClick} />

        <div className="video-grid">
          {Array.isArray(videos) &&
            videos.map((video) => (
              <VideoCard
                key={video.id?.videoId}
                video={{
                  title: video.snippet?.title,
                  channel: video.snippet?.channelTitle,
                  thumbnail: video.snippet?.thumbnails?.high?.url,
                  videoId: video.id?.videoId,
                }}
              />
            ))}
        </div>
      </div>
    </>
  );
}

export default App;
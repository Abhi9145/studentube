import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "./index.css";

import App from "./App.jsx";
import VideoPage from "./pages/VideoPage.jsx";
import SavedVideosPage from "./pages/SavedVideosPage.jsx";
import PlaylistDetailPage from "./pages/PlaylistDetailPage";
import HistoryPage from "./pages/HistoryPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import PlaylistsPage from "./pages/PlaylistsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#181818",
            color: "#fff",
          },
        }}
      />

      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/video/:videoId" element={<VideoPage />} />
        <Route path="/saved" element={<SavedVideosPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route
  path="/playlists/:playlistId"
  element={<PlaylistDetailPage />}
/>
        <Route path="/playlists" element={<PlaylistsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>

    </BrowserRouter>
  </StrictMode>
);
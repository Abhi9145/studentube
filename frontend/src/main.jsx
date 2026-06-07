import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SavedVideosPage from "./pages/SavedVideosPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import "./index.css";
import App from "./App.jsx";
import VideoPage from "./pages/VideoPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
     <Routes>
  <Route path="/" element={<App />} />
  <Route path="/video/:videoId" element={<VideoPage />} />
  <Route path="/saved" element={<SavedVideosPage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
</Routes>
    </BrowserRouter>
  </StrictMode>
);
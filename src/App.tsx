import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ✅ IMPORTANT: match your actual file name exactly
import Home from "./pages/home";
import Chess from "./pages/chess";
import DailyChessPuzzle from "./pages/DailyChessPuzzle";
import Leaderboard from "./pages/leaderboard";
import London from "./pages/london";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chess" element={<Chess />} />
        <Route path="/daily" element={<DailyChessPuzzle />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/london" element={<London />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
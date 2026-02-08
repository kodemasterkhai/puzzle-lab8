import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./components/NavBar";

// ✅ IMPORTANT: no more ./pages/home (clashes with home.css on Linux/Vercel)
import HomePage from "./pages/HomePage";

import Chess from "./pages/chess";
import DailyChessPuzzle from "./pages/DailyChessPuzzle";
import Leaderboard from "./pages/leaderboard";
import London from "./pages/london";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chess" element={<Chess />} />
        <Route path="/daily" element={<DailyChessPuzzle />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/london" element={<London />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
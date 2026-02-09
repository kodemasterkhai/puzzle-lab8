import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Chess from "./pages/Chess";
import DailyChessPuzzle from "./pages/DailyChessPuzzle";
import London from "./pages/London";
import Leaderboard from "./pages/Leaderboard";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chess" element={<Chess />} />
      <Route path="/daily" element={<DailyChessPuzzle />} />
      <Route path="/london" element={<London />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
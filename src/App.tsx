import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/home";
import DailyChessPuzzle from "./pages/DailyChessPuzzle";
import LondonJigsaw from "./pages/LondonJigsaw";
import Leaderboard from "./pages/Leaderboard";
import AdminSuggestions from "./pages/AdminSuggestions";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/DailyChessPuzzle" element={<DailyChessPuzzle />} />
      <Route path="/LondonJigsaw" element={<LondonJigsaw />} />
      <Route path="/Leaderboard" element={<Leaderboard />} />
      <Route path="/AdminSuggestions" element={<AdminSuggestions />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
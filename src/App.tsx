import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";

import Home from "./pages/home";
import Chess from "./pages/chess";
import DailyChessPuzzle from "./pages/DailyChessPuzzle";
import LondonPuzzle from "./pages/london";
import Lib from "./pages/lib";
import Leaderboard from "./pages/leaderboard";

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chess" element={<Chess />} />
        <Route path="/daily" element={<DailyChessPuzzle />} />
        <Route path="/london" element={<LondonPuzzle />} />
        <Route path="/lib" element={<Lib />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
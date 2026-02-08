import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";

import Home from "./pages/home";
import Chess from "./pages/chess";
import DailyChessPuzzle from "./pages/DailyChessPuzzle";
import Lib from "./pages/lib";

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chess" element={<Chess />} />
        <Route path="/DailyChessPuzzle" element={<DailyChessPuzzle />} />
        <Route path="/lib" element={<Lib />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
import { NavLink } from "react-router-dom";
import "./NavBar.css";

export default function NavBar() {
  return (
    <header className="navWrap">
      <nav className="navBar">
        <NavLink to="/" className={({ isActive }) => (isActive ? "navLink active" : "navLink")}>
          🏠 Home
        </NavLink>

        <NavLink to="/chess" className={({ isActive }) => (isActive ? "navLink active" : "navLink")}>
          ♟️ Chess vs Bot
        </NavLink>

        <NavLink to="/daily" className={({ isActive }) => (isActive ? "navLink active" : "navLink")}>
          🔥 Daily Puzzle
        </NavLink>

        <NavLink to="/london" className={({ isActive }) => (isActive ? "navLink active" : "navLink")}>
          🧩 London
        </NavLink>

        <NavLink to="/leaderboard" className={({ isActive }) => (isActive ? "navLink active" : "navLink")}>
          🏆 Leaderboard
        </NavLink>
      </nav>
    </header>
  );
}
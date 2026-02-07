import { useEffect, useState } from "react";
import Home from "./pages/Home";
import DailyChessPuzzle from "./pages/DailyChessPuzzle";
import LondonJigsaw from "./pages/LondonJigsaw";
import Leaderboard from "./pages/Leaderboard";
import AdminSuggestions from "./pages/AdminSuggestions";
import { ThemeProvider, useTheme } from "./theme";
import "./App.css";

function readRoute() {
  const hash = (window.location.hash || "#/").replace("#", "");
  return hash.startsWith("/") ? hash : `/${hash}`;
}

function Shell() {
  const [route, setRoute] = useState(readRoute());
  const { theme, setTheme, themes } = useTheme();

  useEffect(() => {
    const onHashChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const Page =
    route === "/" ? (
      <Home />
    ) : route === "/daily" ? (
      <DailyChessPuzzle />
    ) : route === "/london-jigsaw" ? (
      <LondonJigsaw />
    ) : route === "/leaderboard" ? (
      <Leaderboard />
    ) : route === "/admin-suggestions" ? (
      <AdminSuggestions />
    ) : (
      <Home />
    );

  return (
    <div className="appShell">
      <header className="topNav">
        <div className="brand">
          <div className="brandDot" />
          <div className="brandText">
            <div className="brandTitle">Puzzle Lab</div>
            <div className="brandSub">Hello 👋 This is an ongoing project — enjoy the show ✨</div>
          </div>
        </div>

        <div className="navRight">
          <select className="themeSelect" value={theme} onChange={(e) => setTheme(e.target.value as any)}>
            {themes.map((t) => (
              <option key={t} value={t}>
                Theme: {t}
              </option>
            ))}
          </select>

          <nav className="navLinks">
            <a className="navLink" href="#/">Home</a>
            <a className="navLink" href="#/daily">Daily Chess</a>
            <a className="navLink" href="#/london-jigsaw">London Jigsaw</a>
            <a className="navLink" href="#/leaderboard">Leaderboard</a>
            <a className="navLink" href="#/admin-suggestions">Admin</a>
          </nav>
        </div>
      </header>

      <main className="appMain">{Page}</main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  );
}
import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "./NavBar.css";

type ThemeKey = "amethyst" | "ocean" | "midnight" | "sunset" | "emerald";

export default function NavBar() {
  const { pathname } = useLocation();

  const links = useMemo(
    () => [
      { to: "/", label: "Home" },
      { to: "/chess", label: "Chess" },
      { to: "/daily", label: "Daily Chess" },
      { to: "/london", label: "London" },
      { to: "/lib", label: "Library" },
      { to: "/leaderboard", label: "Leaderboard" },
    ],
    []
  );

  const [theme, setTheme] = useState<ThemeKey>(() => {
    const saved = localStorage.getItem("puzzlelab_theme") as ThemeKey | null;
    return saved ?? "amethyst";
  });

  useEffect(() => {
    localStorage.setItem("puzzlelab_theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <nav className="navBar">
      <div className="navInner">
        <div className="brand">Puzzle Lab</div>

        <div className="navLinks">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`navBtn ${pathname === l.to ? "active" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="themeWrap">
          <span className="themeLabel">Theme</span>
          <select
            className="themeSelect"
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeKey)}
            aria-label="Theme"
          >
            <option value="amethyst">Amethyst</option>
            <option value="ocean">Ocean</option>
            <option value="midnight">Midnight</option>
            <option value="sunset">Sunset</option>
            <option value="emerald">Emerald</option>
          </select>
        </div>
      </div>
    </nav>
  );
}
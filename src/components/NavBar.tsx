import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import "./NavBar.css";

type Theme = "amethyst" | "ocean" | "midnight" | "sunset" | "emerald";

export default function NavBar() {
  const { pathname } = useLocation();
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("pl_theme") as Theme) || "amethyst";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pl_theme", theme);
  }, [theme]);

  const links = [
    { to: "/", label: "Home" },
    { to: "/chess", label: "Chess" },
    { to: "/daily", label: "Daily Chess" },
    { to: "/london", label: "London" },
    { to: "/lib", label: "Library" },
    { to: "/leaderboard", label: "Leaderboard" },
  ];

  return (
    <nav className="navBar">
      <div className="navInner">
        <div className="brand">Puzzle Lab</div>

        <div className="navLinks">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className={`navBtn ${pathname === l.to ? "active" : ""}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 999,
            color: "white",
            padding: "6px 10px",
            fontWeight: 800,
          }}
        >
          <option value="amethyst">💜 Amethyst</option>
          <option value="ocean">🌊 Ocean</option>
          <option value="midnight">🌌 Midnight</option>
          <option value="sunset">🌅 Sunset</option>
          <option value="emerald">💚 Emerald</option>
        </select>
      </div>
    </nav>
  );
}
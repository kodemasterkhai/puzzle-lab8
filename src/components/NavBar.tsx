import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";

export default function NavBar() {
  const location = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/chess", label: "Chess" },
    { to: "/DailyChessPuzzle", label: "Daily Chess" },
    { to: "/lib", label: "Library" },
  ];

  return (
    <nav className="navBar">
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={`navBtn ${location.pathname === link.to ? "active" : ""}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
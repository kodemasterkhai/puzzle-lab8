import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./home.css";

type ThemeKey = "Amethyst" | "Ocean" | "Midnight";

export default function Home() {
  const [theme, setTheme] = useState<ThemeKey>("Amethyst");
  const [name, setName] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [status, setStatus] = useState<string>("");

  const themeClass = useMemo(() => {
    if (theme === "Ocean") return "themeOcean";
    if (theme === "Midnight") return "themeMidnight";
    return "themeAmethyst";
  }, [theme]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");

    if (!suggestion.trim()) {
      setStatus("Write a suggestion first 🙂");
      return;
    }

    try {
      const payload = { name: name.trim() || null, suggestion: suggestion.trim() };
      console.log("Suggestion submitted:", payload);

      setName("");
      setSuggestion("");
      setStatus("✅ Sent — thank you!");
    } catch (err) {
      console.error(err);
      setStatus("❌ Something went wrong. Try again.");
    }
  }

  return (
    <div className={`home ${themeClass}`}>
      <div className="homeCard">
        {/* ✅ Title block */}
        <header className="introBlock">
          <h1 className="homeTitle">Puzzle Lab</h1>
          <p className="homeMuted">
            Hello 👋 This is an ongoing project — enjoy the show ✨
          </p>
        </header>

        {/* ✅ Vertical bubbles (stacked) */}
        <nav className="navBubbles" aria-label="Puzzle Lab navigation">
          <Link className="bubble" to="/">Home</Link>
          <Link className="bubble" to="/DailyChessPuzzle">Daily Chess</Link>
          <Link className="bubble" to="/LondonJigsaw">London Jigsaw</Link>
          <Link className="bubble" to="/Leaderboard">Leaderboard</Link>
          <Link className="bubble" to="/AdminSuggestions">Admin</Link>
        </nav>

        {/* ✅ Theme dropdown BELOW the bubbles */}
        <div className="themeRow">
          <label className="themeLabel" htmlFor="themeSelect">Theme</label>
          <select
            id="themeSelect"
            className="themeSelect"
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeKey)}
          >
            <option value="Amethyst">Amethyst</option>
            <option value="Ocean">Ocean</option>
            <option value="Midnight">Midnight</option>
          </select>
        </div>

        {/* ✅ Suggestion box directly under everything */}
        <section className="suggestionsCard" aria-label="Suggestions">
          <div className="suggestionsHeader">
            <div className="bulb" aria-hidden="true">💡</div>
            <h2 className="suggestionsTitle">Drop it here. I actually read these 😮‍💨</h2>
          </div>

          <form className="suggestionsForm" onSubmit={handleSubmit}>
            <label className="fieldLabel" htmlFor="nameInput">Name (optional)</label>
            <input
              id="nameInput"
              className="fieldInput"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Khai / anonymous / whatever"
              autoComplete="name"
            />

            <label className="fieldLabel" htmlFor="suggestionInput">Suggestion</label>
            <textarea
              id="suggestionInput"
              className="fieldTextarea"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="Example: add streaks, better hints, harder puzzles..."
              rows={5}
            />

            <button className="submitBtn" type="submit">Send suggestion 🚀</button>

            {status ? <p className="statusText">{status}</p> : null}
          </form>
        </section>
      </div>
    </div>
  );
}
import { useState } from "react";
import "./home.css";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function submitSuggestion(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    const cleanMessage = message.trim();
    const cleanName = name.trim();

    if (cleanMessage.length < 3) {
      setStatus("error");
      setErrorMsg("Type a quick suggestion first 🙂");
      return;
    }

    setStatus("sending");

    const { error } = await supabase.from("suggestions").insert([
      {
        name: cleanName || null,
        message: cleanMessage,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
        page: typeof window !== "undefined" ? window.location.pathname : null,
      },
    ]);

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      return;
    }

    setStatus("sent");
    setMessage("");
    setName("");
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <div className="home">
      <div className="homeHero">
        <h1 className="homeTitle">Puzzle Lab 🧩</h1>
        <p className="homeSub">
          Hello 👋 This is just an ongoing project. Enjoy the show ✨
        </p>

        <div className="homeLinks">
          <a className="homePill" href="#/daily">Daily Chess ♟️</a>
          <a className="homePill" href="#/london-jigsaw">London Jigsaw 🧩</a>
          <a className="homePill" href="#/leaderboard">Leaderboard 🏆</a>
        </div>
      </div>

      <div className="homeCard">
        <div className="homeCardInner">
          <h2 className="homeH2">Got an improvement idea? 💡</h2>
          <p className="homeMuted">
            Drop it here. I actually read these 😤
          </p>

          <form className="suggestForm" onSubmit={submitSuggestion}>
            <div className="suggestRow">
              <label className="suggestLabel">Name (optional)</label>
              <input
                className="suggestInput"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Khai / anonymous / whatever"
              />
            </div>

            <div className="suggestRow">
              <label className="suggestLabel">Suggestion</label>
              <textarea
                className="suggestTextarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Example: add streaks, better hints, harder puzzles..."
                rows={4}
              />
            </div>

            <button className="suggestBtn" type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending..." : "Send suggestion 🚀"}
            </button>

            {status === "sent" && <div className="suggestOk">Sent! Appreciate you 💜</div>}
            {status === "error" && <div className="suggestErr">{errorMsg ?? "Something broke 😭"}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
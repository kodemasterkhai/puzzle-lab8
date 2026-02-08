import React from "react";
import "./home.css";

export default function HomePage() {
  return (
    <div className="home">
      <div className="homeCard">
        <div className="homeCardInner">
          <h1 className="homeTitle">Puzzle Lab</h1>

          <p className="homeSubtitle">
            Built by <strong>@8khaidao</strong> — this is a project in progress.
          </p>

          <p className="homeMuted">
            I’m improving this page every single day. If something looks scuffed,
            it’s because it’s being built in public 💜
          </p>

          <div className="homeGrid">
            <a className="homeLink" href="/chess">
              ♟️ Chess vs Bot
              <span className="homeLinkSub">Play the main chess mode</span>
            </a>

            <a className="homeLink" href="/daily">
              🧩 Daily Puzzle
              <span className="homeLinkSub">Quick puzzle challenge</span>
            </a>

            <a className="homeLink" href="/leaderboard">
              🏆 Leaderboard
              <span className="homeLinkSub">Times + moves leaderboard</span>
            </a>

            <a className="homeLink" href="/london">
              🌃 London
              <span className="homeLinkSub">Extra page / vibe</span>
            </a>
          </div>

          <div className="homeFooter">
            <span className="homeTag">#PuzzleLab</span>
            <span className="homeTag">#BuildInPublic</span>
            <span className="homeTag">#Vercel</span>
          </div>
        </div>
      </div>
    </div>
  );
}
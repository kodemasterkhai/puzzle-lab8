import { useMemo, useState } from "react";
import "../index.css";
import "./jigsaw.css";

type Tile = number;

function makeTiles(n: number): Tile[] {
  return Array.from({ length: n * n }, (_, i) => i);
}

function shuffleTiles(arr: Tile[]) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isSolved(tiles: Tile[]) {
  for (let i = 0; i < tiles.length; i++) if (tiles[i] !== i) return false;
  return true;
}

export default function LondonJigsaw() {
  const n = 3;
  const [tiles, setTiles] = useState<Tile[]>(() => shuffleTiles(makeTiles(n)));
  const [moves, setMoves] = useState(0);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const solved = useMemo(() => isSolved(tiles), [tiles]);

  function reset() {
    setTiles(shuffleTiles(makeTiles(n)));
    setMoves(0);
    setDragFrom(null);
    setDragOver(null);
  }

  function swap(i: number, j: number) {
    const next = tiles.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setTiles(next);
    setMoves((m) => m + 1);
  }

  return (
    <div className="container">
      <div className="panel">
        <div className="panelHeader">
          <div>
            <h2 className="panelTitle">London Jigsaw (Drag & Drop)</h2>
            <p className="panelSub">
              Image: <span className="pill">public/london.png</span> • Moves: <span className="pill">{moves}</span>
            </p>
          </div>
          <div className="actions">
            <button className="btn btnGhost" onClick={reset}>
              Shuffle
            </button>
          </div>
        </div>

        {solved && (
          <div className="success">
            <div className="successTitle">Completed ✅</div>
            <div className="successSmall">Next: submit name + leaderboard.</div>
          </div>
        )}

        <div className="puzzleLayout">
          <div className="jigsawShell">
            <div className="jigsawFrame">
              <div className="jigsawGrid jigsaw3">
                {tiles.map((tile, index) => {
                  const x = tile % n;
                  const y = Math.floor(tile / n);
                  const bgX = (x / (n - 1)) * 100;
                  const bgY = (y / (n - 1)) * 100;

                  const isOver = dragOver === index;

                  return (
                    <div
                      key={index}
                      className={["jTile", isOver ? "jOver" : "", solved ? "jSolved" : ""].filter(Boolean).join(" ")}
                      draggable={!solved}
                      onDragStart={() => setDragFrom(index)}
                      onDragEnd={() => {
                        setDragFrom(null);
                        setDragOver(null);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(index);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (dragFrom === null) return;
                        if (dragFrom === index) return;
                        swap(dragFrom, index);
                        setDragFrom(null);
                        setDragOver(null);
                      }}
                      style={{
                        backgroundImage: "url(/london.png)",
                        backgroundSize: "300% 300%",
                        backgroundPosition: `${bgX}% ${bgY}%`,
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="jTip">Tip: drag a tile onto another tile to swap. The faint image behind is your guide.</div>
          </div>

          <div className="sideCard">
            <p className="sideTitle">Goal</p>
            <p className="sideText">Rebuild the London photo. When you finish, we unlock “submit your name”.</p>

            <div className="spacer12" />

            <p className="sideTitle">How it works</p>
            <p className="sideText">
              Drag tile → drop on tile = swap. Use <b>Shuffle</b> for a new layout.
            </p>
          </div>
        </div>

        <div className="notice">
          <div className="noticeTitle">If image looks wrong</div>
          <div className="noticeSmall">
            Make sure the file is exactly: <b>public/london.png</b> then refresh.
          </div>
        </div>
      </div>
    </div>
  );
}
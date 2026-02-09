import NavBar from "../components/NavBar";
import { useEffect, useMemo, useRef, useState } from "react";

type Tile = number;
type Pos = { x: number; y: number };

function isSolved(tiles: Tile[]) {
  for (let i = 0; i < tiles.length; i++) if (tiles[i] !== i) return false;
  return true;
}

function shuffleSolvable(n: number) {
  const size = n * n;
  const base = Array.from({ length: size }, (_, i) => i);

  function inversions(arr: number[]) {
    let inv = 0;
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i] !== size - 1 && arr[j] !== size - 1 && arr[i] > arr[j]) inv++;
      }
    }
    return inv;
  }

  function solvable(arr: number[]) {
    const inv = inversions(arr);
    const blankIndex = arr.indexOf(size - 1);
    const blankRowFromTop = Math.floor(blankIndex / n);
    const blankRowFromBottom = n - blankRowFromTop;

    if (n % 2 === 1) return inv % 2 === 0;
    if (blankRowFromBottom % 2 === 0) return inv % 2 === 1;
    return inv % 2 === 0;
  }

  let arr = base.slice();
  do {
    arr = base.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  } while (!solvable(arr) || isSolved(arr));

  return arr;
}

export default function London() {
  const [n, setN] = useState(4);
  const [tiles, setTiles] = useState<Tile[]>(() => shuffleSolvable(4));
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const boardPx = 420;
  const tilePx = Math.floor(boardPx / n);
  const empty = n * n - 1;

  const boardRef = useRef<HTMLDivElement | null>(null);

  const [dragTile, setDragTile] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<Pos>({ x: 0, y: 0 });
  const [dragPos, setDragPos] = useState<Pos>({ x: 0, y: 0 });

  useEffect(() => {
    setTiles(shuffleSolvable(n));
    setMoves(0);
    setWon(false);
    setDragTile(null);
  }, [n]);

  useEffect(() => {
    if (isSolved(tiles)) setWon(true);
  }, [tiles]);

  const emptyIndex = tiles.indexOf(empty);

  function idxToRC(idx: number) {
    return { r: Math.floor(idx / n), c: idx % n };
  }

  function canSwap(idx: number) {
    const { r, c } = idxToRC(idx);
    const { r: er, c: ec } = idxToRC(emptyIndex);
    return Math.abs(r - er) + Math.abs(c - ec) === 1;
  }

  function swapWithEmpty(idx: number) {
    if (won) return;
    if (!canSwap(idx)) return;
    const next = tiles.slice();
    [next[idx], next[emptyIndex]] = [next[emptyIndex], next[idx]];
    setTiles(next);
    setMoves((m) => m + 1);
  }

  const tileToIndex = useMemo(() => {
    const map = new Map<number, number>();
    tiles.forEach((t, idx) => map.set(t, idx));
    return map;
  }, [tiles]);

  function tileTargetPos(tile: number) {
    const idx = tileToIndex.get(tile)!;
    const { r, c } = idxToRC(idx);
    return { left: c * tilePx, top: r * tilePx };
  }

  function pointerDown(tile: number, e: React.PointerEvent) {
    if (won) return;
    const idx = tileToIndex.get(tile)!;
    if (!canSwap(idx)) return;

    const board = boardRef.current;
    if (!board) return;

    const rect = board.getBoundingClientRect();
    const { left, top } = tileTargetPos(tile);

    const grabX = e.clientX - rect.left - left;
    const grabY = e.clientY - rect.top - top;

    setDragTile(tile);
    setDragOffset({ x: grabX, y: grabY });
    setDragPos({ x: left, y: top });

    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function pointerMove(e: React.PointerEvent) {
    if (dragTile === null) return;
    const board = boardRef.current;
    if (!board) return;

    const rect = board.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    const max = boardPx - tilePx;
    setDragPos({
      x: Math.max(-tilePx * 0.2, Math.min(max + tilePx * 0.2, x)),
      y: Math.max(-tilePx * 0.2, Math.min(max + tilePx * 0.2, y)),
    });
  }

  function pointerUp() {
    if (dragTile === null) return;

    const { r: er, c: ec } = idxToRC(emptyIndex);
    const emptyLeft = ec * tilePx;
    const emptyTop = er * tilePx;

    const dx = dragPos.x - emptyLeft;
    const dy = dragPos.y - emptyTop;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const tile = dragTile;
    setDragTile(null);

    if (dist < tilePx * 0.55) {
      const idx = tileToIndex.get(tile)!;
      swapWithEmpty(idx);
    }
  }

  const tilesToRender = useMemo(() => {
    return Array.from({ length: n * n }, (_, t) => t).filter((t) => t !== empty);
  }, [n, empty]);

  return (
    <>
      <NavBar />
      <div style={{ minHeight: "100vh", padding: 24, color: "white" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>🧩 London Puzzle</h1>
          <p style={{ opacity: 0.8, marginTop: 0 }}>
            🫳 Drag a tile into the empty space (or tap). Smooth animations ✅
          </p>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
            <label style={{ opacity: 0.9 }}>
              🔢 Size:&nbsp;
              <select
                value={n}
                onChange={(e) => setN(parseInt(e.target.value, 10))}
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.18)",
                  background: "rgba(255,255,255,0.08)",
                  color: "white",
                }}
              >
                {[4, 5, 6, 7, 8].map((v) => (
                  <option key={v} value={v} style={{ color: "black" }}>
                    {v} x {v}
                  </option>
                ))}
              </select>
            </label>

            <div
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <strong>👣 Moves:</strong> {moves}
            </div>

            <button
              onClick={() => {
                setTiles(shuffleSolvable(n));
                setMoves(0);
                setWon(false);
                setDragTile(null);
              }}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.08)",
                color: "white",
                cursor: "pointer",
              }}
            >
              🔀 Shuffle
            </button>

            {won && (
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "rgba(0,255,180,0.18)",
                  border: "1px solid rgba(0,255,180,0.35)",
                  fontWeight: 900,
                }}
              >
                🏆 Solved!
              </div>
            )}
          </div>

          <div
            ref={boardRef}
            style={{
              width: boardPx,
              height: boardPx,
              maxWidth: "100%",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.2)",
              position: "relative",
              touchAction: "none",
              userSelect: "none",
            }}
          >
            {(() => {
              const { r: er, c: ec } = idxToRC(emptyIndex);
              return (
                <div
                  style={{
                    position: "absolute",
                    left: ec * tilePx,
                    top: er * tilePx,
                    width: tilePx,
                    height: tilePx,
                    background: "rgba(255,255,255,0.06)",
                  }}
                />
              );
            })()}

            {tilesToRender.map((tile) => {
              const idx = tileToIndex.get(tile)!;
              const isAdjacent = canSwap(idx);
              const { left, top } = tileTargetPos(tile);
              const tr = Math.floor(tile / n);
              const tc = tile % n;

              const isDragging = dragTile === tile;
              const drawLeft = isDragging ? dragPos.x : left;
              const drawTop = isDragging ? dragPos.y : top;

              return (
                <button
                  key={tile}
                  onClick={() => swapWithEmpty(idx)}
                  onPointerDown={(e) => pointerDown(tile, e)}
                  onPointerMove={pointerMove}
                  onPointerUp={pointerUp}
                  style={{
                    position: "absolute",
                    left: drawLeft,
                    top: drawTop,
                    width: tilePx,
                    height: tilePx,
                    border: "none",
                    padding: 0,
                    cursor: won ? "default" : isAdjacent ? "grab" : "default",
                    background: "transparent",
                    transform: isDragging ? "scale(1.02)" : "scale(1)",
                    transition: isDragging ? "none" : "left 180ms ease, top 180ms ease, transform 180ms ease",
                    boxShadow: isDragging ? "0 18px 40px rgba(0,0,0,0.35)" : "none",
                    zIndex: isDragging ? 10 : 1,
                  }}
                  aria-label={`tile-${tile}`}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundImage: `url(/london.png)`,
                      backgroundSize: `${n * 100}% ${n * 100}%`,
                      backgroundPosition: `${(tc / (n - 1)) * 100}% ${(tr / (n - 1)) * 100}%`,
                      filter: "saturate(1.05)",
                    }}
                  />
                  {isAdjacent && !won && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        outline: "2px solid rgba(0,255,180,0.18)",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <p style={{ marginTop: 14, opacity: 0.75, fontSize: 13 }}>
            ✅ Image file must be: <code>/public/london.png</code>
          </p>
        </div>
      </div>
    </>
  );
}
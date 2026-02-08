import { useMemo, useState } from "react";

type Piece =
  | "P" | "R" | "N" | "B" | "Q" | "K"
  | "p" | "r" | "n" | "b" | "q" | "k"
  | null;

type Square = { r: number; c: number };

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

function same(a: Square | null, b: Square) {
  return !!a && a.r === b.r && a.c === b.c;
}

function inBounds(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function squareName(r: number, c: number) {
  // r=0 top => rank 8
  return `${FILES[c]}${8 - r}`;
}

function pieceToSvg(piece: Exclude<Piece, null>) {
  // Your public/pieces files are: wp.svg, wn.svg, wb.svg, wr.svg, wq.svg, wk.svg + black versions.
  const isWhite = piece === piece.toUpperCase();
  const p = piece.toLowerCase();
  const color = isWhite ? "w" : "b";
  return `/pieces/${color}${p}.svg`;
}

function startPosition(): Piece[][] {
  const emptyRow = Array(8).fill(null) as Piece[];
  return [
    ["r","n","b","q","k","b","n","r"],
    Array(8).fill("p") as Piece[],
    [...emptyRow],
    [...emptyRow],
    [...emptyRow],
    [...emptyRow],
    Array(8).fill("P") as Piece[],
    ["R","N","B","Q","K","B","N","R"],
  ];
}

export default function Chess() {
  const [board, setBoard] = useState<Piece[][]>(() => startPosition());
  const [selected, setSelected] = useState<Square | null>(null);
  const [turn, setTurn] = useState<"w" | "b">("w");
  const [status, setStatus] = useState<string>("Click a piece to move. (Freeplay for now)");

  const selectedPiece = useMemo(() => {
    if (!selected) return null;
    return board[selected.r]?.[selected.c] ?? null;
  }, [selected, board]);

  function reset() {
    setBoard(startPosition());
    setSelected(null);
    setTurn("w");
    setStatus("Reset ✅");
  }

  function clearSelection() {
    setSelected(null);
    setStatus("Selection cleared.");
  }

  function handleSquareClick(r: number, c: number) {
    const piece = board[r][c];

    // If nothing selected yet:
    if (!selected) {
      if (!piece) {
        setStatus("No piece there.");
        return;
      }
      const isWhite = piece === piece.toUpperCase();
      if ((turn === "w" && !isWhite) || (turn === "b" && isWhite)) {
        setStatus(`It's ${turn === "w" ? "White" : "Black"} to move.`);
        return;
      }
      setSelected({ r, c });
      setStatus(`Selected ${piece} at ${squareName(r, c)}.`);
      return;
    }

    // If clicked same square -> deselect
    if (same(selected, { r, c })) {
      clearSelection();
      return;
    }

    // Move selected -> clicked (freeplay, basic capture rules only)
    const from = selected;
    const moving = board[from.r][from.c];

    if (!moving) {
      setSelected(null);
      setStatus("Selection invalid (piece missing).");
      return;
    }

    // Prevent capturing your own color
    if (piece) {
      const movingWhite = moving === moving.toUpperCase();
      const targetWhite = piece === piece.toUpperCase();
      if (movingWhite === targetWhite) {
        // Switch selection to that piece instead (nice UX)
        setSelected({ r, c });
        setStatus(`Switched selection to ${piece} at ${squareName(r, c)}.`);
        return;
      }
    }

    // Execute move
    setBoard((prev) => {
      const next = prev.map((row) => [...row]) as Piece[][];
      next[from.r][from.c] = null;
      next[r][c] = moving;
      return next;
    });

    setSelected(null);
    setTurn((t) => (t === "w" ? "b" : "w"));
    setStatus(
      `${moving} moved ${squareName(from.r, from.c)} → ${squareName(r, c)}`
    );
  }

  return (
    <div className="page">
      <div className="shell">
        <div className="glassCard">
          <h1 className="h1">Chess</h1>
          <p className="muted">
            Freeplay board for now (click-to-move). Next upgrade: legal moves + dots + highlights.
          </p>

          <div className="row">
            <div className="glassCard" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 900, opacity: 0.9 }}>
                  Turn: {turn === "w" ? "White" : "Black"}
                </div>
                <div style={{ opacity: 0.85 }}>{status}</div>
              </div>

              <div
                style={{
                  width: "min(92vw, 520px)",
                  margin: "14px auto 0",
                  borderRadius: 18,
                  overflow: "hidden",
                  border: "1px solid rgba(255,255,255,0.10)",
                  boxShadow: "0 18px 45px rgba(0,0,0,0.35)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(8, 1fr)",
                  }}
                >
                  {board.map((row, r) =>
                    row.map((piece, c) => {
                      const dark = (r + c) % 2 === 1;
                      const isSel = same(selected, { r, c });
                      return (
                        <button
                          key={`${r}-${c}`}
                          onClick={() => handleSquareClick(r, c)}
                          style={{
                            aspectRatio: "1 / 1",
                            border: "none",
                            padding: 0,
                            display: "grid",
                            placeItems: "center",
                            cursor: "pointer",
                            background: dark
                              ? "rgba(255,255,255,0.08)"
                              : "rgba(255,255,255,0.03)",
                            outline: isSel ? "3px solid rgba(255,255,255,0.55)" : "none",
                            outlineOffset: "-3px",
                          }}
                          aria-label={`Square ${squareName(r, c)}`}
                        >
                          {piece ? (
                            <img
                              src={pieceToSvg(piece)}
                              alt={piece}
                              style={{
                                width: "72%",
                                height: "72%",
                                filter: "drop-shadow(0 10px 16px rgba(0,0,0,0.35))",
                                opacity: selectedPiece && isSel ? 0.95 : 1,
                              }}
                              draggable={false}
                            />
                          ) : null}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 14, flexWrap: "wrap" }}>
                <button
                  onClick={reset}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.06)",
                    color: "white",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Reset ♻️
                </button>

                <button
                  onClick={clearSelection}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "rgba(255,255,255,0.06)",
                    color: "white",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Deselect ✋
                </button>
              </div>

              <p className="muted" style={{ marginTop: 12 }}>
                Next: I’ll add **legal move generation** + **dots for possible moves** + **highlight the piece to move** for daily puzzles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import NavBar from "../components/NavBar";
import { useMemo, useRef, useState } from "react";

type Piece = "wK" | "wQ" | "bK" | "bQ";
type Board = (Piece | null)[][];
type Turn = "w" | "b";
type Sq = { r: number; c: number };

const START: Board = [
  [null, null, null, null, "bK", null, null, "bQ"],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ["wQ", null, null, null, "wK", null, null, null],
];

const PIECE_IMG: Record<Piece, string> = {
  wK: "/pieces/wk.svg",
  wQ: "/pieces/wq.svg",
  bK: "/pieces/bk.svg",
  bQ: "/pieces/bq.svg",
};

function inBounds(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}
function colorOf(p: Piece) {
  return p[0] as Turn;
}
function typeOf(p: Piece) {
  return p[1];
}
function cloneBoard(b: Board): Board {
  return b.map((row) => row.slice());
}
function sameSq(a: Sq | null, b: Sq | null) {
  return !!a && !!b && a.r === b.r && a.c === b.c;
}

function generateMoves(board: Board, from: Sq): Sq[] {
  const p = board[from.r][from.c];
  if (!p) return [];
  const col = colorOf(p);
  const t = typeOf(p);

  const moves: Sq[] = [];

  if (t === "K") {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = from.r + dr;
        const c = from.c + dc;
        if (!inBounds(r, c)) continue;
        const target = board[r][c];
        if (!target || colorOf(target) !== col) moves.push({ r, c });
      }
    }
    return moves;
  }

  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];
  for (const [dr, dc] of dirs) {
    let r = from.r + dr;
    let c = from.c + dc;
    while (inBounds(r, c)) {
      const target = board[r][c];
      if (!target) moves.push({ r, c });
      else {
        if (colorOf(target) !== col) moves.push({ r, c });
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return moves;
}

function applyMove(board: Board, from: Sq, to: Sq): Board {
  const b = cloneBoard(board);
  const p = b[from.r][from.c];
  b[from.r][from.c] = null;
  b[to.r][to.c] = p;
  return b;
}

function findPieces(board: Board, turn: Turn): Sq[] {
  const out: Sq[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && colorOf(p) === turn) out.push({ r, c });
    }
  }
  return out;
}

function score(board: Board) {
  let s = 0; // bot is black
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const val = typeOf(p) === "Q" ? 9 : 0;
      s += colorOf(p) === "b" ? val : -val;
    }
  }
  return s;
}

function pickBotMove(board: Board) {
  const pieces = findPieces(board, "b");
  let best: { from: Sq; to: Sq; s: number } | null = null;

  for (const from of pieces) {
    const moves = generateMoves(board, from);
    for (const to of moves) {
      const next = applyMove(board, from, to);
      const sc = score(next);
      if (!best || sc > best.s) best = { from, to, s: sc };
    }
  }
  return best;
}

function hasPiece(board: Board, piece: Piece) {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (board[r][c] === piece) return true;
  return false;
}

export default function Chess() {
  const [board, setBoard] = useState<Board>(() => cloneBoard(START));
  const [turn, setTurn] = useState<Turn>("w");
  const [status, setStatus] = useState("🫳 Drag a WHITE piece to move.");
  const [locked, setLocked] = useState(false);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const [dragFrom, setDragFrom] = useState<Sq | null>(null);
  const [dragPiece, setDragPiece] = useState<Piece | null>(null);
  const [dragXY, setDragXY] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [grabOffset, setGrabOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const tileSize = 54;
  const boardPx = tileSize * 8;

  const legalMoves = useMemo(() => {
    if (!dragFrom) return [];
    const p = board[dragFrom.r][dragFrom.c];
    if (!p) return [];
    if (colorOf(p) !== "w") return [];
    if (turn !== "w") return [];
    return generateMoves(board, dragFrom);
  }, [board, dragFrom, turn]);

  function reset() {
    setBoard(cloneBoard(START));
    setTurn("w");
    setLocked(false);
    setStatus("🫳 Drag a WHITE piece to move.");
    setDragFrom(null);
    setDragPiece(null);
  }

  function endIfGameOver(b: Board) {
    if (!hasPiece(b, "wK")) {
      setLocked(true);
      setStatus("💀 You lost (White King captured).");
      return true;
    }
    if (!hasPiece(b, "bK")) {
      setLocked(true);
      setStatus("🏆 You won (Black King captured)!");
      return true;
    }
    return false;
  }

  function pointToSquare(clientX: number, clientY: number): Sq | null {
    const el = boardRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return null;
    const c = Math.floor((x / rect.width) * 8);
    const r = Math.floor((y / rect.height) * 8);
    if (!inBounds(r, c)) return null;
    return { r, c };
  }

  function onPiecePointerDown(from: Sq, p: Piece, e: React.PointerEvent) {
    if (locked) return;
    if (turn !== "w") return;
    if (colorOf(p) !== "w") return;

    const el = boardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    const squareLeft = (from.c / 8) * rect.width;
    const squareTop = (from.r / 8) * rect.height;
    const offX = e.clientX - rect.left - squareLeft;
    const offY = e.clientY - rect.top - squareTop;

    setDragFrom(from);
    setDragPiece(p);
    setGrabOffset({ x: offX, y: offY });
    setDragXY({ x: squareLeft, y: squareTop });
    setStatus("✅ Drop on a green-dot square.");
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onBoardPointerMove(e: React.PointerEvent) {
    if (!dragFrom || !dragPiece) return;
    const el = boardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - grabOffset.x;
    const y = e.clientY - rect.top - grabOffset.y;

    const pad = rect.width * 0.08;
    const maxX = rect.width - rect.width / 8 + pad;
    const maxY = rect.height - rect.height / 8 + pad;

    setDragXY({
      x: Math.max(-pad, Math.min(maxX, x)),
      y: Math.max(-pad, Math.min(maxY, y)),
    });
  }

  function finishDrag(clientX: number, clientY: number) {
    if (!dragFrom || !dragPiece) return;

    const dropSq = pointToSquare(clientX, clientY);
    const isLegal = !!dropSq && legalMoves.some((m) => m.r === dropSq.r && m.c === dropSq.c);

    const from = dragFrom;
    setDragFrom(null);
    setDragPiece(null);

    if (!isLegal || !dropSq) {
      setStatus("❌ Illegal drop — snapped back. Try again.");
      return;
    }

    const afterYou = applyMove(board, from, dropSq);
    setBoard(afterYou);
    if (endIfGameOver(afterYou)) return;

    setTurn("b");
    setStatus("🤖 Bot thinking...");

    window.setTimeout(() => {
      const bm = pickBotMove(afterYou);
      if (!bm) {
        setTurn("w");
        setStatus("🤖 Bot has no moves. Your turn!");
        return;
      }
      const afterBot = applyMove(afterYou, bm.from, bm.to);
      setBoard(afterBot);
      if (endIfGameOver(afterBot)) return;

      setTurn("w");
      setStatus("🫳 Your turn — drag a WHITE piece.");
    }, 220);
  }

  function onBoardPointerUp(e: React.PointerEvent) {
    if (!dragFrom || !dragPiece) return;
    finishDrag(e.clientX, e.clientY);
  }

  function onBoardPointerCancel() {
    if (!dragFrom || !dragPiece) return;
    setDragFrom(null);
    setDragPiece(null);
    setStatus("⚠️ Drag cancelled — try again.");
  }

  return (
    <>
      <NavBar />
      <div style={{ minHeight: "100vh", padding: 24, color: "white" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>♟️ Chess vs Bot</h1>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <strong>📣 Status:</strong> {status}
            </div>

            <button
              onClick={reset}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.08)",
                color: "white",
                cursor: "pointer",
              }}
            >
              🔄 Reset
            </button>
          </div>

          <div
            ref={boardRef}
            onPointerMove={onBoardPointerMove}
            onPointerUp={onBoardPointerUp}
            onPointerCancel={onBoardPointerCancel}
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
            {board.map((row, r) =>
              row.map((p, c) => {
                const dark = (r + c) % 2 === 1;
                const showDot = legalMoves.some((m) => m.r === r && m.c === c);
                const isDraggedOrigin = sameSq(dragFrom, { r, c });

                return (
                  <div
                    key={`${r}-${c}`}
                    style={{
                      position: "absolute",
                      left: c * tileSize,
                      top: r * tileSize,
                      width: tileSize,
                      height: tileSize,
                      background: dark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.14)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {showDot && (
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 999,
                          background: "rgba(0,255,180,0.75)",
                        }}
                      />
                    )}

                    {p && !isDraggedOrigin && (
                      <div
                        onPointerDown={(e) => onPiecePointerDown({ r, c }, p, e)}
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: locked || turn !== "w" || colorOf(p) !== "w" ? "default" : "grab",
                        }}
                      >
                        <img
                          src={PIECE_IMG[p]}
                          alt={p}
                          draggable={false}
                          style={{
                            width: "72%",
                            height: "72%",
                            objectFit: "contain",
                            pointerEvents: "none",
                            userSelect: "none",
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {dragFrom && dragPiece && (
              <div
                style={{
                  position: "absolute",
                  left: dragXY.x,
                  top: dragXY.y,
                  width: tileSize,
                  height: tileSize,
                  zIndex: 50,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  transform: "scale(1.06)",
                  filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.35))",
                }}
              >
                <img src={PIECE_IMG[dragPiece]} alt={dragPiece} draggable={false} style={{ width: "78%", height: "78%" }} />
              </div>
            )}
          </div>

          <p style={{ marginTop: 14, opacity: 0.8, fontSize: 13 }}>
            ✅ Pieces must exist at: <code>/public/pieces/wk.svg</code>, <code>wq.svg</code>, <code>bk.svg</code>, <code>bq.svg</code>
          </p>
        </div>
      </div>
    </>
  );
}
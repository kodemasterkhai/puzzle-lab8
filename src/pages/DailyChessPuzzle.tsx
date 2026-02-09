import NavBar from "../components/NavBar";
import { useMemo, useState } from "react";

type Piece = "wK" | "wQ" | "bK" | "bQ";
type Board = (Piece | null)[][];
type Sq = { r: number; c: number };

const PIECE_IMG: Record<Piece, string> = {
  wK: "/pieces/wk.svg",
  wQ: "/pieces/wq.svg",
  bK: "/pieces/bk.svg",
  bQ: "/pieces/bq.svg",
};

function inBounds(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}
function cloneBoard(b: Board): Board {
  return b.map((row) => row.slice());
}
function colorOf(p: Piece) {
  return p[0];
}
function typeOf(p: Piece) {
  return p[1];
}
function sameSq(a: Sq | null, b: Sq) {
  return !!a && a.r === b.r && a.c === b.c;
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

function todayIndex() {
  const d = new Date();
  const utc = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.floor(utc / 86400000);
}

type Puzzle = {
  name: string;
  goal: string;
  start: Board;
  mustMoveFrom: Sq;
  solution: { from: Sq; to: Sq }[];
  hint1: string;
  hint2: string;
};

const PUZZLES: Puzzle[] = [
  {
    name: "🔥 Mate in 1",
    goal: "White to move: capture the black king in 1 move.",
    start: [
      [null, null, null, null, "bK", null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, "wK", null, null, "wQ"],
    ],
    mustMoveFrom: { r: 7, c: 7 },
    solution: [{ from: { r: 7, c: 7 }, to: { r: 0, c: 4 } }],
    hint1: "👑 Use the queen (straight/diagonal).",
    hint2: "🎯 Aim at BK on e8.",
  },
];

export default function DailyChessPuzzle() {
  const puzzle = useMemo(() => PUZZLES[todayIndex() % PUZZLES.length], []);
  const [board, setBoard] = useState<Board>(() => cloneBoard(puzzle.start));
  const [selected, setSelected] = useState<Sq | null>(null);
  const [step, setStep] = useState(0);
  const [msg, setMsg] = useState("🧩 White to move.");
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(0);
  const [solved, setSolved] = useState(false);

  const legal = useMemo(() => {
    if (!selected) return [];
    const p = board[selected.r][selected.c];
    if (!p) return [];
    if (colorOf(p) !== "w") return [];
    return generateMoves(board, selected);
  }, [board, selected]);

  function reset() {
    setBoard(cloneBoard(puzzle.start));
    setSelected(null);
    setStep(0);
    setHintLevel(0);
    setSolved(false);
    setMsg("🧩 White to move.");
  }

  function handleClick(r: number, c: number) {
    if (solved) return;
    const clicked = board[r][c];

    if (step === 0 && !selected) {
      if (!(r === puzzle.mustMoveFrom.r && c === puzzle.mustMoveFrom.c)) {
        setMsg("👉 Start with the highlighted piece.");
        return;
      }
    }

    if (!selected) {
      if (clicked && colorOf(clicked) === "w") setSelected({ r, c });
      return;
    }

    if (clicked && colorOf(clicked) === "w") {
      setSelected({ r, c });
      return;
    }

    const isLegal = legal.some((m) => m.r === r && m.c === c);
    if (!isLegal) {
      setSelected(null);
      return;
    }

    const expected = puzzle.solution[step];
    const matches =
      expected &&
      expected.from.r === selected.r &&
      expected.from.c === selected.c &&
      expected.to.r === r &&
      expected.to.c === c;

    if (!matches) {
      setMsg("❌ Wrong move — try again (or hit Hint).");
      setSelected(null);
      return;
    }

    const nextBoard = applyMove(board, selected, { r, c });
    setBoard(nextBoard);
    setSelected(null);

    const nextStep = step + 1;
    setStep(nextStep);

    const blackKingStillThere = nextBoard.some((row) => row.includes("bK"));
    if (!blackKingStillThere || nextStep >= puzzle.solution.length) {
      setSolved(true);
      setMsg("🏆 Solved! Come back tomorrow.");
      return;
    }

    setMsg(`✅ Correct! Step ${nextStep}/${puzzle.solution.length}`);
  }

  const highlightStart = step === 0 && !selected;

  return (
    <>
      <NavBar />
      <div style={{ minHeight: "100vh", padding: 24, color: "white" }}>
        <div style={{ maxWidth: 980, margin: "0 auto" }}>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>🔥 Daily Chess Puzzle</h1>

          <div
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              marginBottom: 14,
            }}
          >
            <div style={{ fontWeight: 900 }}>{puzzle.name}</div>
            <div style={{ opacity: 0.85 }}>{puzzle.goal}</div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <strong>📣 Status:</strong> {msg}
            </div>

            <button
              onClick={() => setHintLevel((h) => (h < 2 ? ((h + 1) as 1 | 2) : h))}
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.08)",
                color: "white",
                cursor: "pointer",
              }}
            >
              💡 Hint
            </button>

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

          {hintLevel >= 1 && (
            <div style={{ opacity: 0.9, marginBottom: 6 }}>
              <b>Hint 1:</b> {puzzle.hint1}
            </div>
          )}
          {hintLevel >= 2 && (
            <div style={{ opacity: 0.9, marginBottom: 14 }}>
              <b>Hint 2:</b> {puzzle.hint2}
            </div>
          )}

          <div
            style={{
              width: 440,
              maxWidth: "100%",
              borderRadius: 16,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.2)",
            }}
          >
            {board.map((row, rr) => (
              <div key={rr} style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)" }}>
                {row.map((p, cc) => {
                  const dark = (rr + cc) % 2 === 1;
                  const isSel = sameSq(selected, { r: rr, c: cc });
                  const isMove = legal.some((m) => m.r === rr && m.c === cc);
                  const isStart = highlightStart && rr === puzzle.mustMoveFrom.r && cc === puzzle.mustMoveFrom.c;

                  return (
                    <button
                      key={cc}
                      onClick={() => handleClick(rr, cc)}
                      style={{
                        height: 54,
                        border: "none",
                        padding: 0,
                        cursor: solved ? "default" : "pointer",
                        background: isStart
                          ? "rgba(255, 215, 0, 0.22)"
                          : isSel
                          ? "rgba(255,255,255,0.30)"
                          : isMove
                          ? "rgba(0,255,180,0.22)"
                          : dark
                          ? "rgba(255,255,255,0.08)"
                          : "rgba(255,255,255,0.14)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {p ? (
                        <img
                          src={PIECE_IMG[p]}
                          alt={p}
                          draggable={false}
                          style={{
                            width: "70%",
                            height: "70%",
                            objectFit: "contain",
                            display: "block",
                            pointerEvents: "none",
                            userSelect: "none",
                          }}
                        />
                      ) : isMove ? (
                        <span style={{ fontSize: 18, fontWeight: 900, opacity: 0.9 }}>•</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
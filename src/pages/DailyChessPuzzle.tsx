import { useMemo, useState } from "react";

/**
 * ✅ Daily puzzle config
 * - fen: starting position
 * - solution: the one correct move
 *
 * You can later replace this with your rotating daily system.
 */
const PUZZLE = {
  fen: "8/8/8/4k3/8/8/4K3/7R w - - 0 1",
  solution: { from: "h1", to: "h5" },
};

type Piece =
  | "P" | "R" | "N" | "B" | "Q" | "K"
  | "p" | "r" | "n" | "b" | "q" | "k"
  | null;

type Square = { r: number; c: number };

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

function sqName(s: Square) {
  return `${FILES[s.c]}${8 - s.r}`;
}

function fromAlgebraic(a: string): Square | null {
  const file = a[0];
  const rank = a[1];
  const c = FILES.indexOf(file);
  const r = 8 - Number(rank);
  if (c < 0 || r < 0 || r > 7) return null;
  return { r, c };
}

function same(a: Square | null, b: Square) {
  return !!a && a.r === b.r && a.c === b.c;
}

function inBounds(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function pieceToSvg(piece: Exclude<Piece, null>) {
  const isWhite = piece === piece.toUpperCase();
  return `/pieces/${isWhite ? "w" : "b"}${piece.toLowerCase()}.svg`;
}

function parseFEN(fen: string): { board: Piece[][]; turn: "w" | "b" } {
  const parts = fen.trim().split(/\s+/);
  const boardPart = parts[0];
  const turn = (parts[1] === "b" ? "b" : "w") as "w" | "b";

  const rows = boardPart.split("/");
  const board = rows.map((row) => {
    const out: Piece[] = [];
    for (const ch of row) {
      const n = Number(ch);
      if (!Number.isNaN(n)) {
        for (let i = 0; i < n; i++) out.push(null);
      } else {
        out.push(ch as Piece);
      }
    }
    return out;
  });

  return { board, turn };
}

/**
 * Pseudo-legal moves (good enough for puzzle UI):
 * - No check/checkmate validation
 * - No castling / en-passant / promotion
 * - Captures allowed
 */
function getMoves(board: Piece[][], from: Square, turn: "w" | "b"): Square[] {
  const piece = board[from.r][from.c];
  if (!piece) return [];

  const isWhite = piece === piece.toUpperCase();
  if ((turn === "w" && !isWhite) || (turn === "b" && isWhite)) return [];

  const moves: Square[] = [];
  const add = (r: number, c: number) => {
    if (!inBounds(r, c)) return false;
    const target = board[r][c];
    if (!target) {
      moves.push({ r, c });
      return true;
    }
    // capture only if opposite color
    const targetWhite = target === target.toUpperCase();
    if (targetWhite !== isWhite) moves.push({ r, c });
    return false; // stop sliding after hit
  };

  const p = piece.toLowerCase();

  // Pawn
  if (p === "p") {
    const dir = isWhite ? -1 : 1;
    const startRow = isWhite ? 6 : 1;

    // forward 1
    const r1 = from.r + dir;
    if (inBounds(r1, from.c) && !board[r1][from.c]) {
      moves.push({ r: r1, c: from.c });

      // forward 2 from start
      const r2 = from.r + dir * 2;
      if (from.r === startRow && inBounds(r2, from.c) && !board[r2][from.c]) {
        moves.push({ r: r2, c: from.c });
      }
    }

    // captures
    for (const dc of [-1, 1]) {
      const rc = from.c + dc;
      if (!inBounds(r1, rc)) continue;
      const target = board[r1][rc];
      if (target) {
        const targetWhite = target === target.toUpperCase();
        if (targetWhite !== isWhite) moves.push({ r: r1, c: rc });
      }
    }

    return moves;
  }

  // Knight
  if (p === "n") {
    const jumps = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];
    for (const [dr, dc] of jumps) {
      const r = from.r + dr;
      const c = from.c + dc;
      if (!inBounds(r, c)) continue;
      const target = board[r][c];
      if (!target) moves.push({ r, c });
      else {
        const targetWhite = target === target.toUpperCase();
        if (targetWhite !== isWhite) moves.push({ r, c });
      }
    }
    return moves;
  }

  // King
  if (p === "k") {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = from.r + dr;
        const c = from.c + dc;
        if (!inBounds(r, c)) continue;
        const target = board[r][c];
        if (!target) moves.push({ r, c });
        else {
          const targetWhite = target === target.toUpperCase();
          if (targetWhite !== isWhite) moves.push({ r, c });
        }
      }
    }
    return moves;
  }

  // Sliding pieces helper
  const slide = (dirs: Array<[number, number]>) => {
    for (const [dr, dc] of dirs) {
      let r = from.r + dr;
      let c = from.c + dc;
      while (inBounds(r, c)) {
        const cont = add(r, c);
        if (!cont) break;
        r += dr;
        c += dc;
      }
    }
  };

  // Bishop
  if (p === "b") {
    slide([[-1, -1], [-1, 1], [1, -1], [1, 1]]);
    return moves;
  }

  // Rook
  if (p === "r") {
    slide([[-1, 0], [1, 0], [0, -1], [0, 1]]);
    return moves;
  }

  // Queen
  if (p === "q") {
    slide([[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]);
    return moves;
  }

  return moves;
}

/* ---------- Popup UI ---------- */

type PopupState =
  | { open: false }
  | { open: true; title: string; body: string; variant: "good" | "bad"; actionLabel: string };

function Popup({
  state,
  onAction,
}: {
  state: PopupState;
  onAction: () => void;
}) {
  if (!state.open) return null;

  const border =
    state.variant === "good"
      ? "rgba(16,185,129,0.55)"
      : "rgba(244,63,94,0.55)";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "grid",
        placeItems: "center",
        zIndex: 9999,
        padding: 14,
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          width: "min(520px, 94vw)",
          borderRadius: 18,
          border: `1px solid ${border}`,
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
          padding: 16,
        }}
      >
        <div style={{ fontWeight: 950, fontSize: 18, marginBottom: 6 }}>
          {state.title}
        </div>
        <div style={{ opacity: 0.88, lineHeight: 1.45 }}>{state.body}</div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <button
            onClick={onAction}
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              fontWeight: 950,
              cursor: "pointer",
            }}
          >
            {state.actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function DailyChessPuzzle() {
  const initial = useMemo(() => parseFEN(PUZZLE.fen), []);
  const mustFrom = useMemo(() => fromAlgebraic(PUZZLE.solution.from), []);
  const mustTo = useMemo(() => fromAlgebraic(PUZZLE.solution.to), []);

  const [board, setBoard] = useState<Piece[][]>(initial.board);
  const [turn] = useState<"w" | "b">(initial.turn);
  const [selected, setSelected] = useState<Square | null>(null);
  const [solved, setSolved] = useState(false);

  const [popup, setPopup] = useState<PopupState>({ open: false });

  const mustMoves = useMemo(() => {
    if (!mustFrom) return [];
    return getMoves(board, mustFrom, turn);
  }, [board, mustFrom, turn]);

  const selectedMoves = useMemo(() => {
    if (!selected) return [];
    return getMoves(board, selected, turn);
  }, [board, selected, turn, turn]);

  function resetBoard() {
    setBoard(parseFEN(PUZZLE.fen).board);
    setSelected(null);
  }

  function openWrong() {
    setPopup({
      open: true,
      title: "❌ Incorrect",
      body: "Try again — you’ve got it. (I reset the position for you.)",
      variant: "bad",
      actionLabel: "Try again",
    });
  }

  function openCorrect() {
    setPopup({
      open: true,
      title: "✅ Correct!",
      body: "Cold 🥶 You found the right move.",
      variant: "good",
      actionLabel: "Nice",
    });
  }

  function handleSquareClick(r: number, c: number) {
    if (solved) return;

    if (!mustFrom || !mustTo) return;

    // Must select the required piece first
    if (!selected) {
      if (r === mustFrom.r && c === mustFrom.c) {
        setSelected({ r, c });
      } else {
        setPopup({
          open: true,
          title: "👀 Start here",
          body: `Tap the highlighted piece at ${PUZZLE.solution.from} first.`,
          variant: "bad",
          actionLabel: "Got it",
        });
      }
      return;
    }

    // Only allow moves that are legal-ish for the selected piece
    const allowed = selectedMoves.some((m) => m.r === r && m.c === c);
    if (!allowed) return;

    const fromSq = selected;
    const toSq: Square = { r, c };

    // Make the move (always moves visually)
    setBoard((prev) => {
      const next = prev.map((row) => [...row]) as Piece[][];
      next[toSq.r][toSq.c] = next[fromSq.r][fromSq.c];
      next[fromSq.r][fromSq.c] = null;
      return next;
    });

    setSelected(null);

    // Check correctness
    const isCorrect =
      sqName(fromSq) === PUZZLE.solution.from && sqName(toSq) === PUZZLE.solution.to;

    if (isCorrect) {
      setSolved(true);
      openCorrect();
    } else {
      // show the wrong move briefly then popup, then reset on action
      setTimeout(() => openWrong(), 250);
    }
  }

  function onPopupAction() {
    if (!popup.open) return;

    if (popup.variant === "bad") {
      setPopup({ open: false });
      resetBoard();
      setSolved(false);
      return;
    }

    // Correct
    setPopup({ open: false });
  }

  return (
    <>
      <Popup state={popup} onAction={onPopupAction} />

      <div className="page">
        <div className="shell">
          <div className="glassCard">
            <h1 className="h1">Daily Chess Puzzle</h1>
            <p className="muted">
              Move the highlighted piece. You’ll see all its options (dots). Correct/incorrect pops up.
            </p>

            <div className="row">
              <div className="glassCard" style={{ padding: 16 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 950, opacity: 0.92 }}>
                    Objective: <span style={{ opacity: 0.9 }}>{PUZZLE.solution.from} → {PUZZLE.solution.to}</span>
                  </div>

                  {!solved ? (
                    <button
                      onClick={resetBoard}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 999,
                        border: "1px solid rgba(255,255,255,0.14)",
                        background: "rgba(255,255,255,0.06)",
                        color: "white",
                        fontWeight: 950,
                        cursor: "pointer",
                      }}
                    >
                      Reset ♻️
                    </button>
                  ) : (
                    <div style={{ fontWeight: 950, opacity: 0.9 }}>✅ Solved</div>
                  )}
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
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)" }}>
                    {board.map((row, rr) =>
                      row.map((piece, cc) => {
                        const dark = (rr + cc) % 2 === 1;

                        const isMust = mustFrom && rr === mustFrom.r && cc === mustFrom.c;
                        const isSel = same(selected, { r: rr, c: cc });

                        const showDotsFrom = selected ? selectedMoves : mustFrom ? mustMoves : [];
                        const isOption = showDotsFrom.some((m) => m.r === rr && m.c === cc);

                        const isTarget = mustTo && rr === mustTo.r && cc === mustTo.c;

                        return (
                          <button
                            key={`${rr}-${cc}`}
                            onClick={() => handleSquareClick(rr, cc)}
                            style={{
                              aspectRatio: "1 / 1",
                              border: "none",
                              padding: 0,
                              display: "grid",
                              placeItems: "center",
                              cursor: solved ? "default" : "pointer",
                              position: "relative",
                              background: dark
                                ? "rgba(255,255,255,0.08)"
                                : "rgba(255,255,255,0.03)",

                              // Outlines
                              outline: isSel
                                ? "3px solid rgba(255,255,255,0.65)"
                                : isMust
                                  ? "3px solid rgba(124,58,237,0.75)"
                                  : isTarget
                                    ? "3px dashed rgba(255,255,255,0.35)"
                                    : "none",
                              outlineOffset: "-3px",
                            }}
                            aria-label={sqName({ r: rr, c: cc })}
                          >
                            {/* Option dot */}
                            {isOption && !isSel ? (
                              <div
                                style={{
                                  position: "absolute",
                                  width: "26%",
                                  height: "26%",
                                  borderRadius: 999,
                                  background: "rgba(255,255,255,0.20)",
                                  border: "1px solid rgba(255,255,255,0.24)",
                                  boxShadow: "0 10px 26px rgba(0,0,0,0.35)",
                                }}
                              />
                            ) : null}

                            {piece ? (
                              <img
                                src={pieceToSvg(piece)}
                                alt={piece}
                                style={{
                                  width: "72%",
                                  height: "72%",
                                  filter: isMust
                                    ? "drop-shadow(0 0 16px rgba(124,58,237,0.55)) drop-shadow(0 10px 16px rgba(0,0,0,0.35))"
                                    : "drop-shadow(0 10px 16px rgba(0,0,0,0.35))",
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

                <p className="muted" style={{ marginTop: 12 }}>
                  Tip: The highlighted piece shows its options immediately. Tap it to “lock in” selection and then choose.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
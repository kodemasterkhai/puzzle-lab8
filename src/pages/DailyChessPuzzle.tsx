import { useEffect, useMemo, useState } from "react";
import { Chess, type Square } from "chess.js";
import { PUZZLES } from "../chess/puzzles";
import { getDayNumber, getPuzzleForDay, getTodayPuzzle } from "../chess/Daily";
import "./chess.css";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const SQ = 64;

function isDark(r: number, c: number) {
  return (r + c) % 2 === 1;
}

function pieceToSvg(piece: string): string | null {
  const map: Record<string, string> = {
    p: "/pieces/bp.svg",
    r: "/pieces/br.svg",
    n: "/pieces/bn.svg",
    b: "/pieces/bb.svg",
    q: "/pieces/bq.svg",
    k: "/pieces/bk.svg",
    P: "/pieces/wp.svg",
    R: "/pieces/wr.svg",
    N: "/pieces/wn.svg",
    B: "/pieces/wb.svg",
    Q: "/pieces/wq.svg",
    K: "/pieces/wk.svg",
  };
  return map[piece] ?? null;
}

function fenToBoard(fen: string): (string | null)[][] {
  const board: (string | null)[][] = Array.from({ length: 8 }, () => Array(8).fill(null));
  const piecePlacement = fen.split(" ")[0];
  const ranks = piecePlacement.split("/");

  for (let r = 0; r < 8; r++) {
    let c = 0;
    for (const ch of ranks[r]) {
      if (/\d/.test(ch)) c += Number(ch);
      else {
        board[r][c] = ch;
        c += 1;
      }
    }
  }
  return board;
}

function squareCenter(square: string) {
  const file = square[0] as (typeof FILES)[number];
  const rank = Number(square[1]);
  const c = FILES.indexOf(file);
  const r = 8 - rank;
  return { x: c * SQ + SQ / 2, y: r * SQ + SQ / 2 };
}

function asSquare(s: string): Square {
  return s as Square;
}

/** Compare UCI (from+to required; promo only if expected includes it) */
function isCorrectUci(
  attempted: { from: string; to: string; promotion?: string },
  expectedUci: string
) {
  const exp = expectedUci.trim().toLowerCase();
  const expFrom = exp.slice(0, 2);
  const expTo = exp.slice(2, 4);
  const expPromo = exp.length >= 5 ? exp[4] : null;

  const attFrom = attempted.from.toLowerCase();
  const attTo = attempted.to.toLowerCase();
  const attPromo = attempted.promotion ? attempted.promotion.toLowerCase() : null;

  if (attFrom !== expFrom || attTo !== expTo) return false;
  if (expPromo) return attPromo === expPromo;
  return true;
}

export default function DailyChessPuzzle() {
  const todayDay = useMemo(() => getDayNumber(new Date()), []);

  // ✅ this is the “Day X” you’re viewing (defaults to today)
  const [viewDay, setViewDay] = useState(todayDay);

  // Load puzzle for that day
  const { puzzle, dayNumber } = useMemo(() => getPuzzleForDay(viewDay), [viewDay]);

  const [game, setGame] = useState(() => new Chess(puzzle.fen));
  const [fen, setFen] = useState<string>(puzzle.fen);

  const [moveIndex, setMoveIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [legalTo, setLegalTo] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");

  // 0 = off, 1 = glow, 2 = arrow
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(1);

  // Reset everything whenever the viewed day changes
  useEffect(() => {
    const g = new Chess(puzzle.fen);
    setGame(g);
    setFen(puzzle.fen);
    setMoveIndex(0);
    setSelected(null);
    setLegalTo([]);
    setStatus("Click the glowing piece to start ✨");
    setHintLevel(1);
  }, [puzzle.fen]);

  const requiredMove = useMemo(() => puzzle.moves?.[moveIndex] ?? null, [puzzle.moves, moveIndex]);
  const requiredFrom = requiredMove ? requiredMove.slice(0, 2) : null;
  const requiredTo = requiredMove ? requiredMove.slice(2, 4) : null;

  const board = useMemo(() => fenToBoard(fen), [fen]);

  function resetPuzzle() {
    const g = new Chess(puzzle.fen);
    setGame(g);
    setFen(puzzle.fen);
    setMoveIndex(0);
    setSelected(null);
    setLegalTo([]);
    setStatus("Reset ✅ Click the glowing piece ✨");
    setHintLevel(1);
  }

  function goToday() {
    const { dayNumber: d } = getTodayPuzzle();
    setViewDay(d);
  }

  function prevDay() {
    setViewDay((d) => Math.max(1, d - 1));
  }

  function nextDay() {
    setViewDay((d) => d + 1);
  }

  function toggleHint() {
    setHintLevel((h) => (h === 0 ? 1 : h === 1 ? 2 : 0));
  }

  function onSquareClick(square: string) {
    const g = game;
    const sq = asSquare(square);
    const piece = g.get(sq);

    // Select a piece
    if (!selected) {
      if (!piece) return;
      if (piece.color !== g.turn()) return;

      if (requiredFrom && square !== requiredFrom) {
        setStatus(`Not that piece 👀 Move ${requiredFrom.toUpperCase()} first ✨`);
        return;
      }

      const moves = g.moves({ square: sq, verbose: true }) as any[];
      setSelected(square);
      setLegalTo(moves.map((m) => m.to));
      setStatus("Choose a destination ✨");
      return;
    }

    // Unselect
    if (square === selected) {
      setSelected(null);
      setLegalTo([]);
      setStatus("Selection cleared.");
      return;
    }

    // Switch selection
    if (piece && piece.color === g.turn()) {
      if (requiredFrom && square !== requiredFrom) {
        setStatus(`Still not the right piece 👀 Move ${requiredFrom.toUpperCase()} ✨`);
        return;
      }
      const moves = g.moves({ square: sq, verbose: true }) as any[];
      setSelected(square);
      setLegalTo(moves.map((m) => m.to));
      setStatus("Choose a destination ✨");
      return;
    }

    // Attempt move
    if (!legalTo.includes(square)) {
      setStatus("That square isn’t a legal move ❌");
      return;
    }

    const selSq = asSquare(selected);
    const selPiece = g.get(selSq);

    let promotion: "q" | undefined = undefined;
    if (selPiece?.type === "p") {
      const rank = square[1];
      if ((selPiece.color === "w" && rank === "8") || (selPiece.color === "b" && rank === "1")) {
        promotion = "q";
      }
    }

    const move = g.move({ from: selSq, to: sq, promotion });
    if (!move) {
      setStatus("Illegal move ❌");
      return;
    }

    const expected = puzzle.moves?.[moveIndex] ?? "";
    const playedUci = `${move.from}${move.to}${move.promotion ?? ""}`.toLowerCase();

    const ok = isCorrectUci({ from: move.from, to: move.to, promotion: move.promotion }, expected);

    if (!ok) {
      g.undo();
      setSelected(null);
      setLegalTo([]);
      setFen(g.fen());
      setGame(new Chess(g.fen()));
      setStatus(`Wrong move 😭 You played ${playedUci.toUpperCase()} but expected ${expected.toUpperCase()} ✨`);
      return;
    }

    // Correct ✅
    setFen(g.fen());
    setSelected(null);
    setLegalTo([]);
    const nextStep = moveIndex + 1;
    setMoveIndex(nextStep);
    setGame(new Chess(g.fen()));

    if (nextStep >= puzzle.moves.length) {
      setStatus("✅ Solved! Loading next day… 🔥");
      window.setTimeout(() => {
        // chess.com vibe: after solving, go to the next day
        setViewDay((d) => d + 1);
      }, 900);
    } else {
      setStatus("✅ Nice! Next move: follow the glow ✨");
      setHintLevel(1);
    }
  }

  const arrow = useMemo(() => {
    if (hintLevel < 2) return null;
    if (!requiredFrom || !requiredTo) return null;
    if (selected) return null;

    const a = squareCenter(requiredFrom);
    const b = squareCenter(requiredTo);
    return { a, b };
  }, [hintLevel, requiredFrom, requiredTo, selected]);

  const dayLabel =
    viewDay === todayDay ? `Day ${dayNumber} (Today)` : `Day ${dayNumber}`;

  return (
    <div style={{ padding: 20 }}>
      <div className="puzzleWrap">
        <div className="puzzleHeaderCard">
          <h1 className="puzzleTitle">Daily Puzzle ♟️</h1>
          <p className="puzzleSub">
            {dayLabel} • Hint 1 = glow ✨ • Hint 2 = arrow ➡️
          </p>

          <div className="puzzleStatus">{status}</div>

          <div className="controlsRow" style={{ marginTop: 12 }}>
            <button className="ctrlBtn ctrlBtnPrimary" onClick={resetPuzzle}>Reset ♻️</button>
            <button className="ctrlBtn" onClick={prevDay}>◀ Previous</button>
            <button className="ctrlBtn" onClick={goToday}>Today 📅</button>
            <button className="ctrlBtn" onClick={nextDay}>Next ▶</button>
            <button className="ctrlBtn" onClick={toggleHint}>
              Hint: {hintLevel === 0 ? "Off" : hintLevel === 1 ? "Glow" : "Arrow"} 💡
            </button>
          </div>

          <div className="smallNote" style={{ marginTop: 10 }}>
            Puzzle: <b>{puzzle.title ?? puzzle.id}</b> • Rating: <b>{puzzle.rating}</b> •
            Archive loops through <b>{PUZZLES.length}</b> puzzles (add more anytime).
          </div>
        </div>

        <div className="boardWrap">
          {arrow && (
            <svg className="arrowOverlay" width={SQ * 8} height={SQ * 8} viewBox={`0 0 ${SQ * 8} ${SQ * 8}`}>
              <defs>
                <marker id="arrowHead" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
                  <path d="M0,0 L10,5 L0,10 Z" fill="rgba(139,92,246,0.85)" />
                </marker>
              </defs>
              <line
                x1={arrow.a.x}
                y1={arrow.a.y}
                x2={arrow.b.x}
                y2={arrow.b.y}
                stroke="rgba(139,92,246,0.25)"
                strokeWidth="16"
                strokeLinecap="round"
              />
              <line
                x1={arrow.a.x}
                y1={arrow.a.y}
                x2={arrow.b.x}
                y2={arrow.b.y}
                stroke="rgba(139,92,246,0.85)"
                strokeWidth="6"
                strokeLinecap="round"
                markerEnd="url(#arrowHead)"
              />
            </svg>
          )}

          <div className="board">
            {Array.from({ length: 64 }).map((_, i) => {
              const r = Math.floor(i / 8);
              const c = i % 8;
              const square = `${FILES[c]}${8 - r}`;

              const pieceChar = board[r][c];
              const svg = pieceChar ? pieceToSvg(pieceChar) : null;

              const isSelected = selected === square;
              const isHintGlow = hintLevel >= 1 && !selected && requiredFrom === square;

              const showDot = selected && legalTo.includes(square) && !pieceChar;
              const showCaptureRing = selected && legalTo.includes(square) && !!pieceChar;

              return (
                <div
                  key={square}
                  className={[
                    "sq",
                    isDark(r, c) ? "sqDark" : "sqLight",
                    isSelected ? "sqSelected" : "",
                    isHintGlow ? "sqHintGlow" : "",
                  ].join(" ")}
                  onClick={() => onSquareClick(square)}
                >
                  {showDot && <div className="moveDot" />}
                  {showCaptureRing && <div className="captureRing" />}

                  {svg ? <img className="pieceImg" src={svg} alt={pieceChar ?? ""} draggable={false} /> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
import { PUZZLES, type Puzzle } from "./puzzles";

// ✅ Day 1 starts today (set this once and never change it)
const START_DATE_UTC = "2026-02-07"; // YYYY-MM-DD (UTC)

/** Returns a stable day number starting at 1 */
export function getDayNumber(date = new Date()): number {
  // Use UTC to avoid timezone edge cases
  const [y, m, d] = START_DATE_UTC.split("-").map(Number);
  const start = Date.UTC(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
  const now = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0);

  const diffDays = Math.floor((now - start) / (24 * 60 * 60 * 1000));
  return Math.max(1, diffDays + 1);
}

/** Returns the puzzle index for a given day (0-based) */
export function getPuzzleIndexForDay(dayNumber: number): number {
  const safeDay = Math.max(1, Math.floor(dayNumber));
  return (safeDay - 1) % PUZZLES.length;
}

/** Today's daily puzzle */
export function getTodayPuzzle(): { puzzle: Puzzle; dayNumber: number; puzzleIndex: number } {
  const dayNumber = getDayNumber(new Date());
  const puzzleIndex = getPuzzleIndexForDay(dayNumber);
  return { puzzle: PUZZLES[puzzleIndex], dayNumber, puzzleIndex };
}

/** Puzzle for any day */
export function getPuzzleForDay(dayNumber: number): { puzzle: Puzzle; dayNumber: number; puzzleIndex: number } {
  const puzzleIndex = getPuzzleIndexForDay(dayNumber);
  return { puzzle: PUZZLES[puzzleIndex], dayNumber, puzzleIndex };
}
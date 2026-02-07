export type Puzzle = {
  id: string;
  fen: string;
  moves: string[];   // UCI
  title?: string;
  rating: number;
};

export const PUZZLES: Puzzle[] = [
  {
    id: "puzzle-1",
    title: "Mate in 1",
    rating: 1200,
    // White: Kg6 Qf6 | Black: Kg8 + extra pawns far away
    // Move: Qg7#
    fen: "6k1/8/5QK1/8/8/8/pppppppp/8 w - - 0 1",
    moves: ["f6g7"],
  },
  {
    id: "puzzle-2",
    title: "Mate in 1",
    rating: 1200,
    // White: Kg6 Qf7 | Black: Kh8 + extra pawns far away
    // Move: Qh7#
    fen: "7k/5Q2/6K1/8/8/8/pppppppp/8 w - - 0 1",
    moves: ["f7h7"],
  },
  {
    id: "puzzle-3",
    title: "Mate in 1",
    rating: 1200,
    // White: Kg6 Qe7 | Black: Kf8 + extra pawns far away
    // Move: Qf7#
    fen: "5k2/4Q3/6K1/8/8/8/pppppppp/8 w - - 0 1",
    moves: ["e7f7"],
  },
];
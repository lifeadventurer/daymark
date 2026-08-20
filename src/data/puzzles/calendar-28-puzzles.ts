import type { BoardCell } from "../../engine/types";

export type Calendar28BoardKey =
  "28-0" | "28-1" | "28-2" | "28-3" | "28-4" | "28-5" | "28-6";

interface Calendar28Difficulty {
  label: string;
  description: string;
  pieceIds?: string[];
  piecePools?: string[][];
}

export interface Calendar28Board {
  daysInMonth: 28;
  startsOnWeekday: number;
  requiredPieceCount: 6;
  cells: BoardCell[];
  dateRules?: Record<
    string,
    {
      requiredPieceCount: number;
      pieceReplacements: Record<string, string[]>;
    }
  >;
  difficulties: {
    easy: Calendar28Difficulty;
    medium: Calendar28Difficulty;
    hard: Calendar28Difficulty;
  };
}

const easyPieceIds = [
  "p",
  "l",
  "y",
  "n",
  "u",
  "v",
  "z",
  "f",
  "i",
  "t",
  "w",
  "x",
  "o4",
  "i4",
  "t4",
  "l4",
  "s4",
];

const mediumPieceIds = [
  "p",
  "l",
  "y",
  "n",
  "u",
  "v",
  "z",
  "f",
  "o4",
  "i4",
  "t4",
  "l4",
  "s4",
];

const hardPiecePools = [
  ["p", "l", "y", "n", "o4", "i4", "t4"],
  ["p", "l", "y", "n", "i4", "t4", "l4"],
  ["p", "l", "y", "n", "t4", "l4", "s4"],
  ["p", "l", "y", "z", "t4", "l4", "o4"],
  ["p", "l", "n", "f", "i4", "t4", "s4"],
];

const splitDateRule = {
  requiredPieceCount: 7,
  pieceReplacements: { p: ["p4", "p1"] },
};

function createCalendarCells(startsOnWeekday: number): BoardCell[] {
  const rows = Math.ceil((startsOnWeekday + 28) / 7);
  const cells: BoardCell[] = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < 7; x += 1) {
      const date = y * 7 + x - startsOnWeekday + 1;
      if (date >= 1 && date <= 28) {
        cells.push({ x, y, date });
      } else if (startsOnWeekday !== 0 || date <= 28) {
        cells.push({ x, y, playable: false });
      }
    }
  }

  return cells;
}

function createCalendar28Board(startsOnWeekday: number): Calendar28Board {
  return {
    daysInMonth: 28,
    startsOnWeekday,
    requiredPieceCount: 6,
    cells: createCalendarCells(startsOnWeekday),
    dateRules:
      startsOnWeekday === 1
        ? { "21": { ...splitDateRule } }
        : startsOnWeekday === 6
          ? { "8": { ...splitDateRule } }
          : undefined,
    difficulties: {
      easy: {
        label: "Easy",
        description: "All pieces are available.",
        pieceIds: [...easyPieceIds],
      },
      medium: {
        label: "Medium",
        description: "A wider selection of pieces is available.",
        pieceIds: [...mediumPieceIds],
      },
      hard: {
        label: "Hard",
        description: "Fewer pieces are available for a tighter challenge.",
        piecePools: hardPiecePools.map((pool) => [...pool]),
      },
    },
  };
}

export const calendar28BoardVariants: Record<
  Calendar28BoardKey,
  Calendar28Board
> = {
  "28-0": createCalendar28Board(0),
  "28-1": createCalendar28Board(1),
  "28-2": createCalendar28Board(2),
  "28-3": createCalendar28Board(3),
  "28-4": createCalendar28Board(4),
  "28-5": createCalendar28Board(5),
  "28-6": createCalendar28Board(6),
};

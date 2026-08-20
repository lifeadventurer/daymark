import type { BoardCell } from "../../engine/types";

export type Calendar30BoardKey =
  "30-0" | "30-1" | "30-2" | "30-3" | "30-4" | "30-5" | "30-6";

interface Calendar30Difficulty {
  label: string;
  description: string;
  pieceIds?: string[];
  piecePools?: string[][];
}

export interface Calendar30Board {
  daysInMonth: 30;
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
    easy: Calendar30Difficulty;
    medium: Calendar30Difficulty;
    hard: Calendar30Difficulty;
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
];

const hardPiecePools = [
  ["p", "l", "y", "n", "u", "v", "o4"],
  ["p", "l", "y", "n", "u", "v", "i4"],
  ["p", "l", "y", "n", "u", "z", "t4"],
  ["p", "l", "y", "n", "u", "z", "l4"],
  ["p", "l", "y", "n", "u", "f", "o4"],
];

const saturdaySplitDateRules = {
  "8": {
    requiredPieceCount: 7,
    pieceReplacements: { p: ["p4", "p1"] },
  },
  "23": {
    requiredPieceCount: 7,
    pieceReplacements: { p: ["p4", "p1"] },
  },
};

function createCalendarCells(startsOnWeekday: number): BoardCell[] {
  const rows = Math.ceil((startsOnWeekday + 30) / 7);
  const cells: BoardCell[] = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < 7; x += 1) {
      const date = y * 7 + x - startsOnWeekday + 1;
      if (date >= 1 && date <= 30) {
        cells.push({ x, y, date });
      } else if (startsOnWeekday !== 0 || date <= 30) {
        cells.push({ x, y, playable: false });
      }
    }
  }

  return cells;
}

function createCalendar30Board(startsOnWeekday: number): Calendar30Board {
  return {
    daysInMonth: 30,
    startsOnWeekday,
    requiredPieceCount: 6,
    cells: createCalendarCells(startsOnWeekday),
    dateRules:
      startsOnWeekday === 6 ? { ...saturdaySplitDateRules } : undefined,
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

export const calendar30BoardVariants: Record<
  Calendar30BoardKey,
  Calendar30Board
> = {
  "30-0": createCalendar30Board(0),
  "30-1": createCalendar30Board(1),
  "30-2": createCalendar30Board(2),
  "30-3": createCalendar30Board(3),
  "30-4": createCalendar30Board(4),
  "30-5": createCalendar30Board(5),
  "30-6": createCalendar30Board(6),
};

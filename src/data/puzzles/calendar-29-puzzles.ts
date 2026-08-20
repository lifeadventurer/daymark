import type { BoardCell } from "../../engine/types";

export type Calendar29BoardKey =
  "29-0" | "29-1" | "29-2" | "29-3" | "29-4" | "29-5" | "29-6";

interface Calendar29Difficulty {
  label: string;
  description: string;
  pieceIds?: string[];
  piecePools?: string[][];
}

export interface Calendar29Board {
  daysInMonth: 29;
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
    easy: Calendar29Difficulty;
    medium: Calendar29Difficulty;
    hard: Calendar29Difficulty;
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
  ["p", "l", "y", "n", "u", "o4", "i4"],
  ["p", "l", "y", "n", "u", "i4", "t4"],
  ["p", "l", "y", "n", "z", "t4", "l4"],
  ["p", "l", "y", "n", "z", "l4", "o4"],
  ["p", "l", "y", "n", "f", "i4", "t4"],
];

const splitDateRule = {
  requiredPieceCount: 7,
  pieceReplacements: { p: ["p4", "p1"] },
};

function createCalendarCells(startsOnWeekday: number): BoardCell[] {
  const rows = Math.ceil((startsOnWeekday + 29) / 7);
  const cells: BoardCell[] = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < 7; x += 1) {
      const date = y * 7 + x - startsOnWeekday + 1;
      if (date >= 1 && date <= 29) {
        cells.push({ x, y, date });
      } else if (startsOnWeekday !== 0 || date <= 29) {
        cells.push({ x, y, playable: false });
      }
    }
  }

  return cells;
}

function createCalendar29Board(startsOnWeekday: number): Calendar29Board {
  return {
    daysInMonth: 29,
    startsOnWeekday,
    requiredPieceCount: 6,
    cells: createCalendarCells(startsOnWeekday),
    dateRules:
      startsOnWeekday === 0
        ? { "22": { ...splitDateRule } }
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

export const calendar29BoardVariants: Record<
  Calendar29BoardKey,
  Calendar29Board
> = {
  "29-0": createCalendar29Board(0),
  "29-1": createCalendar29Board(1),
  "29-2": createCalendar29Board(2),
  "29-3": createCalendar29Board(3),
  "29-4": createCalendar29Board(4),
  "29-5": createCalendar29Board(5),
  "29-6": createCalendar29Board(6),
};

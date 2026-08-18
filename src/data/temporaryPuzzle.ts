import { createBoardDefinition } from "../engine/board";
import type { BoardDefinition, PieceDefinition } from "../engine/types";

/**
 * Initial photo-derived fixture.
 * The physical board is represented as a calendar: seven columns and five
 * rows, with the final row containing only dates 29–31.
 */
const temporaryCalendarCells = Array.from({ length: 31 }, (_, index) => ({
  x: index % 7,
  y: Math.floor(index / 7),
  date: index + 1,
  playable: true,
}));

export const temporaryBoard: BoardDefinition = createBoardDefinition(
  "temporary-calendar-tile",
  temporaryCalendarCells,
);

/**
 * Initial photo-derived piece set.
 * These are the photo-derived pentomino silhouettes, with seven available
 * pieces so the player can choose six: red P, blue L, green T, orange N,
 * purple U, black V, and white Z.
 */
export const temporaryPieces: PieceDefinition[] = [
  {
    id: "red",
    cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 2 }],
    allowRotation: true,
    allowReflection: true,
  },
  {
    id: "blue",
    cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 1, y: 3 }],
    allowRotation: true,
    allowReflection: true,
  },
  {
    id: "green",
    cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 }, { x: 1, y: 1 }],
    allowRotation: true,
    allowReflection: true,
  },
  {
    id: "orange",
    cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }],
    allowRotation: true,
    allowReflection: true,
  },
  {
    id: "purple",
    cells: [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    allowRotation: true,
    allowReflection: true,
  },
  {
    id: "black",
    // V pentomino: X.. / X.. / XXX
    cells: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
    allowRotation: true,
    allowReflection: true,
  },
  {
    id: "white",
    // Z pentomino: XX. / .X. / .XX
    cells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
    allowRotation: true,
    allowReflection: true,
  },
];

export const pieceLabels: Record<string, string> = {
  red: "Red",
  blue: "Blue",
  green: "Green",
  orange: "Orange",
  purple: "Purple",
  black: "Black",
  white: "White",
};

export const pieceColors: Record<string, string> = {
  red: "#d95e58",
  blue: "#4e78b3",
  green: "#63a673",
  orange: "#e3a03e",
  purple: "#8e6098",
  black: "#3f3c3a",
  white: "#f1eee5",
};

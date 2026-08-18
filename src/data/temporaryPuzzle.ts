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
 * The tray shows all twelve pentomino silhouettes in a 3x4 grid. The first
 * seven are enabled so the player can choose six; the remaining five are
 * reserved for later boards.
 */
export const temporaryPieces: PieceDefinition[] = [
  {
    id: "red",
    cells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 0, y: 2 },
    ],
    allowRotation: true,
    allowReflection: true,
  },
  {
    id: "blue",
    cells: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 1, y: 3 },
    ],
    allowRotation: true,
    allowReflection: true,
  },
  {
    id: "green",
    cells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 1, y: 1 },
    ],
    allowRotation: true,
    allowReflection: true,
  },
  {
    id: "orange",
    cells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
    ],
    allowRotation: true,
    allowReflection: true,
  },
  {
    id: "purple",
    cells: [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
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
  {
    id: "cyan",
    // F pentomino: .XX / XX. / .X.
    cells: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
    allowRotation: true,
    allowReflection: true,
    enabled: false,
  },
  {
    id: "teal",
    // I pentomino: XXXXX
    cells: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
      { x: 0, y: 4 },
    ],
    allowRotation: true,
    allowReflection: true,
    enabled: false,
  },
  {
    id: "yellow",
    // T pentomino: XXX / .X. / .X.
    cells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
    ],
    allowRotation: true,
    allowReflection: true,
    enabled: false,
  },
  {
    id: "pink",
    // W pentomino: X.. / XX. / .XX
    cells: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ],
    allowRotation: true,
    allowReflection: true,
    enabled: false,
  },
  {
    id: "navy",
    // X pentomino: .X. / XXX / .X.
    cells: [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
    ],
    allowRotation: true,
    allowReflection: true,
    enabled: false,
  },
];

export const pieceLabels: Record<string, string> = {
  red: "Red",
  blue: "Blue",
  green: "Green",
  orange: "Orange",
  purple: "Purple",
  black: "Black",
  white: "Sand",
  cyan: "Cyan",
  teal: "Teal",
  yellow: "Yellow",
  pink: "Pink",
  navy: "Navy",
};

export const pieceColors: Record<string, string> = {
  red: "#d36458",
  blue: "#5a79aa",
  green: "#6aa276",
  orange: "#d99d3d",
  purple: "#8e6a96",
  black: "#4b4845",
  white: "#ad9a80",
  cyan: "#64a09a",
  teal: "#528b87",
  yellow: "#c4a45a",
  pink: "#b97b87",
  navy: "#607797",
};

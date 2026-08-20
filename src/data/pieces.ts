import type { PieceDefinition } from "../engine/types";

/** Canonical puzzle pieces. Visual colors are kept separate from IDs. */
export const pieceDefinitions: PieceDefinition[] = [
  {
    id: "p",
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
    id: "p4",
    // The P piece without its tail, used by isolated-corner date rules.
    cells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    allowRotation: false,
    allowReflection: false,
  },
  {
    id: "p1",
    // The removed P tail becomes an independently placeable single block.
    cells: [{ x: 0, y: 0 }],
    allowRotation: false,
    allowReflection: false,
  },
  {
    id: "o4",
    // O tetromino: XX / XX
    cells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    allowRotation: false,
    allowReflection: false,
  },
  {
    id: "i4",
    // I tetromino: XXXX
    cells: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 0, y: 3 },
    ],
    allowRotation: true,
    allowReflection: true,
  },
  {
    id: "t4",
    // T tetromino: XXX / .X.
    cells: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 1, y: 1 },
    ],
    allowRotation: true,
    allowReflection: true,
  },
  {
    id: "l4",
    // L tetromino: X. / X. / XX
    cells: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
    allowRotation: true,
    allowReflection: true,
  },
  {
    id: "s4",
    // S tetromino: .XX / XX.
    cells: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ],
    allowRotation: true,
    allowReflection: true,
  },
  {
    id: "l",
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
    id: "y",
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
    id: "n",
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
    id: "u",
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
    id: "v",
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
    id: "z",
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
    id: "f",
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
  },
  {
    id: "i",
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
  },
  {
    id: "t",
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
  },
  {
    id: "w",
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
  },
  {
    id: "x",
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
  },
];

export const pieceLabels: Record<string, string> = {
  p: "P pentomino",
  p4: "Short P tetromino",
  p1: "Single block",
  o4: "O tetromino",
  i4: "I tetromino",
  t4: "T tetromino",
  l4: "L tetromino",
  s4: "S tetromino",
  l: "L pentomino",
  y: "Y pentomino",
  n: "N pentomino",
  u: "U pentomino",
  v: "V pentomino",
  z: "Z pentomino",
  f: "F pentomino",
  i: "I pentomino",
  t: "T pentomino",
  w: "W pentomino",
  x: "X pentomino",
};

export const pieceColors: Record<string, string> = {
  // Pentomino palette.
  p: "#d7625a",
  l: "#4f7ebb",
  y: "#6ba879",
  n: "#d87932",
  u: "#916ca8",
  v: "#4e4c49",
  z: "#a99378",
  f: "#55aaa1",
  i: "#2f7888",
  t: "#b3a041",
  w: "#be7f90",
  x: "#635ca7",
  // Tetromino palette. These colors intentionally differ from the
  // pentomino colors, including for the visually identical p4 and o4 shapes.
  p4: "#c04f85",
  o4: "#7a61c9",
  i4: "#2f9ca7",
  t4: "#d49435",
  l4: "#3f9b67",
  s4: "#de6d9b",
  // Single-cell split piece.
  p1: "#efb43f",
};

export const legacyPieceIdAliases: Record<string, string> = {
  red: "p",
  blue: "l",
  green: "y",
  orange: "n",
  purple: "u",
  black: "v",
  white: "z",
  cyan: "f",
  teal: "i",
  yellow: "t",
  pink: "w",
  navy: "x",
};

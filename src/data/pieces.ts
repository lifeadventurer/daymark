import type { PieceDefinition } from "../engine/types";

/** Canonical pentomino definitions. Visual colors are kept separate from IDs. */
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
  p: "#d36458",
  l: "#5a79aa",
  y: "#6aa276",
  n: "#d99d3d",
  u: "#8e6a96",
  v: "#4b4845",
  z: "#ad9a80",
  f: "#64a09a",
  i: "#528b87",
  t: "#c4a45a",
  w: "#b97b87",
  x: "#607797",
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

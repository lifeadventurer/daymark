import type { GridPoint } from "../engine/types";

export type PentominoTilingPieceId =
  "f" | "l" | "i" | "p" | "n" | "t" | "u" | "v" | "w" | "x" | "y" | "z";

export interface PentominoTilingPlacement {
  pieceId: PentominoTilingPieceId;
  cells: GridPoint[];
}

export interface PentominoTiling {
  width: number;
  height: number;
  placements: PentominoTilingPlacement[];
}

// Generated from the twelve canonical piece definitions. Keeping the solutions
// static makes opening the easter egg immediate instead of solving exact cover
// layouts on the interaction path.
export const pentominoTilings: PentominoTiling[] = [
  {
    width: 10,
    height: 6,
    placements: [
      {
        pieceId: "f",
        cells: [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 1, y: 2 },
        ],
      },
      {
        pieceId: "l",
        cells: [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
          { x: 4, y: 0 },
          { x: 4, y: 1 },
        ],
      },
      {
        pieceId: "t",
        cells: [
          { x: 0, y: 2 },
          { x: 0, y: 3 },
          { x: 1, y: 3 },
          { x: 2, y: 3 },
          { x: 0, y: 4 },
        ],
      },
      {
        pieceId: "n",
        cells: [
          { x: 1, y: 4 },
          { x: 2, y: 4 },
          { x: 3, y: 4 },
          { x: 0, y: 5 },
          { x: 1, y: 5 },
        ],
      },
      {
        pieceId: "i",
        cells: [
          { x: 2, y: 5 },
          { x: 3, y: 5 },
          { x: 4, y: 5 },
          { x: 5, y: 5 },
          { x: 6, y: 5 },
        ],
      },
      {
        pieceId: "x",
        cells: [
          { x: 3, y: 1 },
          { x: 2, y: 2 },
          { x: 3, y: 2 },
          { x: 4, y: 2 },
          { x: 3, y: 3 },
        ],
      },
      {
        pieceId: "y",
        cells: [
          { x: 6, y: 3 },
          { x: 4, y: 4 },
          { x: 5, y: 4 },
          { x: 6, y: 4 },
          { x: 7, y: 4 },
        ],
      },
      {
        pieceId: "w",
        cells: [
          { x: 6, y: 1 },
          { x: 5, y: 2 },
          { x: 6, y: 2 },
          { x: 4, y: 3 },
          { x: 5, y: 3 },
        ],
      },
      {
        pieceId: "u",
        cells: [
          { x: 5, y: 0 },
          { x: 6, y: 0 },
          { x: 7, y: 0 },
          { x: 5, y: 1 },
          { x: 7, y: 1 },
        ],
      },
      {
        pieceId: "p",
        cells: [
          { x: 8, y: 4 },
          { x: 9, y: 4 },
          { x: 7, y: 5 },
          { x: 8, y: 5 },
          { x: 9, y: 5 },
        ],
      },
      {
        pieceId: "z",
        cells: [
          { x: 8, y: 0 },
          { x: 9, y: 0 },
          { x: 8, y: 1 },
          { x: 7, y: 2 },
          { x: 8, y: 2 },
        ],
      },
      {
        pieceId: "v",
        cells: [
          { x: 9, y: 1 },
          { x: 9, y: 2 },
          { x: 7, y: 3 },
          { x: 8, y: 3 },
          { x: 9, y: 3 },
        ],
      },
    ],
  },
  {
    width: 12,
    height: 5,
    placements: [
      {
        pieceId: "f",
        cells: [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 1, y: 2 },
        ],
      },
      {
        pieceId: "l",
        cells: [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
          { x: 4, y: 0 },
          { x: 4, y: 1 },
        ],
      },
      {
        pieceId: "p",
        cells: [
          { x: 0, y: 2 },
          { x: 0, y: 3 },
          { x: 1, y: 3 },
          { x: 0, y: 4 },
          { x: 1, y: 4 },
        ],
      },
      {
        pieceId: "n",
        cells: [
          { x: 3, y: 1 },
          { x: 2, y: 2 },
          { x: 3, y: 2 },
          { x: 2, y: 3 },
          { x: 2, y: 4 },
        ],
      },
      {
        pieceId: "w",
        cells: [
          { x: 4, y: 2 },
          { x: 5, y: 2 },
          { x: 3, y: 3 },
          { x: 4, y: 3 },
          { x: 3, y: 4 },
        ],
      },
      {
        pieceId: "i",
        cells: [
          { x: 4, y: 4 },
          { x: 5, y: 4 },
          { x: 6, y: 4 },
          { x: 7, y: 4 },
          { x: 8, y: 4 },
        ],
      },
      {
        pieceId: "t",
        cells: [
          { x: 6, y: 1 },
          { x: 6, y: 2 },
          { x: 5, y: 3 },
          { x: 6, y: 3 },
          { x: 7, y: 3 },
        ],
      },
      {
        pieceId: "u",
        cells: [
          { x: 5, y: 0 },
          { x: 6, y: 0 },
          { x: 7, y: 0 },
          { x: 5, y: 1 },
          { x: 7, y: 1 },
        ],
      },
      {
        pieceId: "v",
        cells: [
          { x: 11, y: 2 },
          { x: 11, y: 3 },
          { x: 9, y: 4 },
          { x: 10, y: 4 },
          { x: 11, y: 4 },
        ],
      },
      {
        pieceId: "y",
        cells: [
          { x: 8, y: 0 },
          { x: 9, y: 0 },
          { x: 10, y: 0 },
          { x: 11, y: 0 },
          { x: 9, y: 1 },
        ],
      },
      {
        pieceId: "z",
        cells: [
          { x: 10, y: 1 },
          { x: 11, y: 1 },
          { x: 10, y: 2 },
          { x: 9, y: 3 },
          { x: 10, y: 3 },
        ],
      },
      {
        pieceId: "x",
        cells: [
          { x: 8, y: 1 },
          { x: 7, y: 2 },
          { x: 8, y: 2 },
          { x: 9, y: 2 },
          { x: 8, y: 3 },
        ],
      },
    ],
  },
  {
    width: 15,
    height: 4,
    placements: [
      {
        pieceId: "f",
        cells: [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 1, y: 2 },
        ],
      },
      {
        pieceId: "l",
        cells: [
          { x: 0, y: 2 },
          { x: 0, y: 3 },
          { x: 1, y: 3 },
          { x: 2, y: 3 },
          { x: 3, y: 3 },
        ],
      },
      {
        pieceId: "y",
        cells: [
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
          { x: 4, y: 0 },
          { x: 3, y: 1 },
        ],
      },
      {
        pieceId: "n",
        cells: [
          { x: 2, y: 2 },
          { x: 3, y: 2 },
          { x: 4, y: 2 },
          { x: 4, y: 3 },
          { x: 5, y: 3 },
        ],
      },
      {
        pieceId: "x",
        cells: [
          { x: 5, y: 0 },
          { x: 4, y: 1 },
          { x: 5, y: 1 },
          { x: 6, y: 1 },
          { x: 5, y: 2 },
        ],
      },
      {
        pieceId: "i",
        cells: [
          { x: 6, y: 0 },
          { x: 7, y: 0 },
          { x: 8, y: 0 },
          { x: 9, y: 0 },
          { x: 10, y: 0 },
        ],
      },
      {
        pieceId: "p",
        cells: [
          { x: 6, y: 2 },
          { x: 7, y: 2 },
          { x: 6, y: 3 },
          { x: 7, y: 3 },
          { x: 8, y: 3 },
        ],
      },
      {
        pieceId: "w",
        cells: [
          { x: 7, y: 1 },
          { x: 8, y: 1 },
          { x: 8, y: 2 },
          { x: 9, y: 2 },
          { x: 9, y: 3 },
        ],
      },
      {
        pieceId: "t",
        cells: [
          { x: 11, y: 0 },
          { x: 9, y: 1 },
          { x: 10, y: 1 },
          { x: 11, y: 1 },
          { x: 11, y: 2 },
        ],
      },
      {
        pieceId: "u",
        cells: [
          { x: 10, y: 2 },
          { x: 12, y: 2 },
          { x: 10, y: 3 },
          { x: 11, y: 3 },
          { x: 12, y: 3 },
        ],
      },
      {
        pieceId: "v",
        cells: [
          { x: 12, y: 0 },
          { x: 13, y: 0 },
          { x: 14, y: 0 },
          { x: 14, y: 1 },
          { x: 14, y: 2 },
        ],
      },
      {
        pieceId: "z",
        cells: [
          { x: 12, y: 1 },
          { x: 13, y: 1 },
          { x: 13, y: 2 },
          { x: 13, y: 3 },
          { x: 14, y: 3 },
        ],
      },
    ],
  },
  {
    width: 20,
    height: 3,
    placements: [
      {
        pieceId: "u",
        cells: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 0, y: 1 },
          { x: 0, y: 2 },
          { x: 1, y: 2 },
        ],
      },
      {
        pieceId: "x",
        cells: [
          { x: 2, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 1 },
          { x: 3, y: 1 },
          { x: 2, y: 2 },
        ],
      },
      {
        pieceId: "i",
        cells: [
          { x: 3, y: 0 },
          { x: 4, y: 0 },
          { x: 5, y: 0 },
          { x: 6, y: 0 },
          { x: 7, y: 0 },
        ],
      },
      {
        pieceId: "p",
        cells: [
          { x: 4, y: 1 },
          { x: 5, y: 1 },
          { x: 3, y: 2 },
          { x: 4, y: 2 },
          { x: 5, y: 2 },
        ],
      },
      {
        pieceId: "l",
        cells: [
          { x: 6, y: 1 },
          { x: 6, y: 2 },
          { x: 7, y: 2 },
          { x: 8, y: 2 },
          { x: 9, y: 2 },
        ],
      },
      {
        pieceId: "n",
        cells: [
          { x: 8, y: 0 },
          { x: 9, y: 0 },
          { x: 10, y: 0 },
          { x: 7, y: 1 },
          { x: 8, y: 1 },
        ],
      },
      {
        pieceId: "f",
        cells: [
          { x: 11, y: 0 },
          { x: 9, y: 1 },
          { x: 10, y: 1 },
          { x: 11, y: 1 },
          { x: 10, y: 2 },
        ],
      },
      {
        pieceId: "t",
        cells: [
          { x: 12, y: 0 },
          { x: 12, y: 1 },
          { x: 11, y: 2 },
          { x: 12, y: 2 },
          { x: 13, y: 2 },
        ],
      },
      {
        pieceId: "w",
        cells: [
          { x: 13, y: 0 },
          { x: 13, y: 1 },
          { x: 14, y: 1 },
          { x: 14, y: 2 },
          { x: 15, y: 2 },
        ],
      },
      {
        pieceId: "y",
        cells: [
          { x: 14, y: 0 },
          { x: 15, y: 0 },
          { x: 16, y: 0 },
          { x: 17, y: 0 },
          { x: 15, y: 1 },
        ],
      },
      {
        pieceId: "z",
        cells: [
          { x: 18, y: 0 },
          { x: 16, y: 1 },
          { x: 17, y: 1 },
          { x: 18, y: 1 },
          { x: 16, y: 2 },
        ],
      },
      {
        pieceId: "v",
        cells: [
          { x: 19, y: 0 },
          { x: 19, y: 1 },
          { x: 17, y: 2 },
          { x: 18, y: 2 },
          { x: 19, y: 2 },
        ],
      },
    ],
  },
];

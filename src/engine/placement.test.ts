import { describe, expect, it } from "vitest";
import { createBoardDefinition } from "./board";
import {
  isBoardStateLegal,
  isPlacementWithinBoard,
  placementCoversTarget,
  placementsOverlap,
} from "./placement";
import type { PieceDefinition, PiecePlacement } from "./types";

const board = createBoardDefinition("test-board", [
  { x: 0, y: 0, date: 1 },
  { x: 1, y: 0, date: 2 },
  { x: 2, y: 0, date: 3 },
  { x: 0, y: 1, date: 4 },
  { x: 1, y: 1, date: 5 },
  { x: 2, y: 1, date: 6 },
  { x: 0, y: 2, date: 7 },
]);
const domino: PieceDefinition = {
  id: "domino",
  cells: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
  ],
  allowRotation: true,
  allowReflection: false,
};
const vertical: PieceDefinition = {
  id: "vertical",
  cells: [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
  ],
  allowRotation: true,
  allowReflection: false,
};

const placement = (
  pieceId: string,
  origin: { x: number; y: number },
  orientation = 0,
): PiecePlacement => ({ pieceId, origin, orientation });

describe("placement validation", () => {
  it("accepts a placement entirely inside the board", () => {
    expect(
      isPlacementWithinBoard(
        board,
        domino,
        placement("domino", { x: 0, y: 0 }),
      ),
    ).toBe(true);
  });

  it("rejects an out-of-bounds placement", () => {
    expect(
      isPlacementWithinBoard(
        board,
        domino,
        placement("domino", { x: 2, y: 0 }),
      ),
    ).toBe(false);
  });

  it("detects target-cell collision", () => {
    expect(
      placementCoversTarget(
        board,
        domino,
        placement("domino", { x: 0, y: 0 }),
        2,
      ),
    ).toBe(true);
    expect(
      placementCoversTarget(
        board,
        domino,
        placement("domino", { x: 0, y: 1 }),
        2,
      ),
    ).toBe(false);
  });

  it("detects overlap between two placements", () => {
    expect(
      placementsOverlap(
        placement("domino", { x: 0, y: 0 }),
        domino,
        placement("vertical", { x: 0, y: 0 }),
        vertical,
      ),
    ).toBe(true);
    expect(
      placementsOverlap(
        placement("domino", { x: 0, y: 0 }),
        domino,
        placement("vertical", { x: 2, y: 0 }),
        vertical,
      ),
    ).toBe(false);
  });

  it("validates a complete state only when every non-target cell is covered", () => {
    const pieces = new Map<string, PieceDefinition>([
      ["top", { ...domino, id: "top" }],
      ["bottom", { ...domino, id: "bottom" }],
      ["last", { ...domino, id: "last" }],
    ]);
    const legalPlacements = [
      placement("top", { x: 0, y: 0 }),
      placement("bottom", { x: 0, y: 1 }),
      placement("last", { x: 2, y: 0 }, 1),
    ];
    expect(isBoardStateLegal(board, pieces, legalPlacements, 7)).toBe(true);
    expect(
      isBoardStateLegal(board, pieces, legalPlacements.slice(0, 2), 7),
    ).toBe(false);
  });
});

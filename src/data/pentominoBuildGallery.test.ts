import { describe, expect, it } from "vitest";
import { pieceDefinitions } from "./pieces";
import { pentominoBuildGallery } from "./pentominoBuildGallery";

describe("pentomino build gallery", () => {
  it("contains ten valid nine-piece compositions", () => {
    expect(pentominoBuildGallery).toHaveLength(10);
    expect(
      new Set(pentominoBuildGallery.map((item) => item.targetPieceId)),
    ).toHaveLength(10);

    for (const item of pentominoBuildGallery) {
      expect(item.placements).toHaveLength(9);
      expect(
        new Set(item.placements.map((placement) => placement.pieceId)).size,
      ).toBe(9);

      const occupied = new Set<string>();
      for (const placement of item.placements) {
        expect(placement.cells).toHaveLength(5);
        for (const cell of placement.cells) {
          expect(cell.x).toBeGreaterThanOrEqual(0);
          expect(cell.x).toBeLessThan(item.width);
          expect(cell.y).toBeGreaterThanOrEqual(0);
          expect(cell.y).toBeLessThan(item.height);
          const key = `${cell.x},${cell.y}`;
          expect(occupied.has(key)).toBe(false);
          occupied.add(key);
        }
      }
      expect(occupied).toHaveLength(45);

      const targetPiece = pieceDefinitions.find(
        (piece) => piece.id === item.targetPieceId,
      );
      expect(targetPiece).toBeDefined();
      const expectedTarget = new Set(
        targetPiece!.cells.flatMap((macroCell) =>
          Array.from({ length: 3 }, (_, y) =>
            Array.from(
              { length: 3 },
              (_, x) => `${macroCell.x * 3 + x},${macroCell.y * 3 + y}`,
            ),
          ).flat(),
        ),
      );
      expect(occupied).toEqual(expectedTarget);
    }
  });
});

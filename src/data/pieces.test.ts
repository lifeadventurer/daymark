import { describe, expect, it } from "vitest";
import { pieceColors } from "./pieces";

describe("piece colors", () => {
  it("keeps smaller piece families visually distinct", () => {
    const pentominoColors = new Set([
      pieceColors.p,
      pieceColors.l,
      pieceColors.y,
      pieceColors.n,
      pieceColors.u,
      pieceColors.v,
      pieceColors.z,
      pieceColors.f,
      pieceColors.i,
      pieceColors.t,
      pieceColors.w,
      pieceColors.x,
    ]);
    const tetrominoIds = ["p4", "o4", "i4", "t4", "l4", "s4"];
    const tetrominoColors = tetrominoIds.map((pieceId) => pieceColors[pieceId]);

    expect(new Set(tetrominoColors).size).toBe(tetrominoIds.length);
    expect(tetrominoColors.every((color) => !pentominoColors.has(color))).toBe(
      true,
    );
    expect(pentominoColors.has(pieceColors.p1)).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  generateOrientations,
  normalizeCells,
  reflectCells,
  rotateCells,
} from "./geometry";

describe("piece geometry", () => {
  it("normalizes cells to the origin and sorts them", () => {
    expect(
      normalizeCells([
        { x: 4, y: 3 },
        { x: 2, y: 5 },
        { x: 3, y: 3 },
      ]),
    ).toEqual([
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 2 },
    ]);
  });

  it("rotates a shape clockwise and normalizes it", () => {
    expect(
      rotateCells([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
      ]),
    ).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ]);
  });

  it("reflects a shape across the vertical axis", () => {
    expect(
      reflectCells([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ]),
    ).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ]);
  });

  it("removes symmetrical duplicate orientations", () => {
    const orientations = generateOrientations({
      id: "square",
      cells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ],
      allowRotation: true,
      allowReflection: true,
    });
    expect(orientations).toHaveLength(1);
  });
});

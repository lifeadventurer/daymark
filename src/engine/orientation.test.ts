import { describe, expect, it } from "vitest";
import { getTransformedOrientationIndex } from "./orientation";
import { generateOrientations, orientationKey } from "./geometry";
import type { PieceDefinition } from "./types";

const asymmetricPiece: PieceDefinition = {
  id: "asymmetric",
  cells: [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ],
  allowRotation: true,
  allowReflection: true,
};

describe("orientation shortcuts", () => {
  it("maps each transform to the generated orientation", () => {
    const orientations = generateOrientations(asymmetricPiece);
    const orientationAt = (index: number) =>
      orientationKey(orientations[index] ?? []);

    expect(
      orientationAt(
        getTransformedOrientationIndex(asymmetricPiece, 0, "rotate-right") ??
          -1,
      ),
    ).toBe(
      orientationKey([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ]),
    );
    expect(
      orientationAt(
        getTransformedOrientationIndex(asymmetricPiece, 0, "rotate-left") ?? -1,
      ),
    ).toBe(
      orientationKey([
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ]),
    );
    expect(
      orientationAt(
        getTransformedOrientationIndex(asymmetricPiece, 0, "flip-horizontal") ??
          -1,
      ),
    ).toBe(
      orientationKey([
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ]),
    );
    expect(
      orientationAt(
        getTransformedOrientationIndex(asymmetricPiece, 0, "flip-vertical") ??
          -1,
      ),
    ).toBe(
      orientationKey([
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ]),
    );
  });

  it("keeps symmetric pieces on their only orientation", () => {
    const square: PieceDefinition = {
      id: "square",
      cells: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ],
      allowRotation: true,
      allowReflection: true,
    };

    expect(getTransformedOrientationIndex(square, 0, "rotate-right")).toBe(0);
    expect(getTransformedOrientationIndex(square, 0, "flip-horizontal")).toBe(
      0,
    );
  });
});

import {
  generateOrientations,
  orientationKey,
  reflectCells,
  reflectCellsVertically,
  rotateCells,
} from "./geometry";
import type { PieceDefinition } from "./types";

export type OrientationAction =
  "rotate-left" | "rotate-right" | "flip-horizontal" | "flip-vertical";

export function getTransformedOrientationIndex(
  piece: PieceDefinition,
  currentIndex: number,
  action: OrientationAction,
): number | undefined {
  const orientations = generateOrientations(piece);
  if (orientations.length === 0) return undefined;

  const normalizedIndex =
    ((currentIndex % orientations.length) + orientations.length) %
    orientations.length;
  const current = orientations[normalizedIndex];
  if (!current) return undefined;

  const transformed = (() => {
    switch (action) {
      case "rotate-left":
        return rotateCells(rotateCells(rotateCells(current)));
      case "rotate-right":
        return rotateCells(current);
      case "flip-horizontal":
        return reflectCells(current);
      case "flip-vertical":
        return reflectCellsVertically(current);
    }
  })();

  const nextIndex = orientations.findIndex(
    (orientation) =>
      orientationKey(orientation) === orientationKey(transformed),
  );
  return nextIndex >= 0 ? nextIndex : undefined;
}

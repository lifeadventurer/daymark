import type { GridPoint } from "../engine/types";
import {
  pentominoTilings,
  type PentominoTilingPieceId,
  type PentominoTilingPlacement,
} from "./pentominoTilings";

export interface PentominoBuildChallenge {
  id: string;
  label: string;
  width: number;
  height: number;
  targetCells: GridPoint[];
  placements: PentominoTilingPlacement[];
}

function createChallenge(
  id: string,
  label: string,
  omittedPieceIds: PentominoTilingPieceId[],
): PentominoBuildChallenge {
  const sourcePlacements = pentominoTilings[0]?.placements ?? [];
  const placements = sourcePlacements
    .filter((placement) => !omittedPieceIds.includes(placement.pieceId))
    .map((placement) => ({
      pieceId: placement.pieceId,
      cells: placement.cells.map((cell) => ({ ...cell })),
    }));
  const cells = placements.flatMap((placement) => placement.cells);
  const minX = Math.min(...cells.map((cell) => cell.x));
  const minY = Math.min(...cells.map((cell) => cell.y));
  const normalizedPlacements = placements.map((placement) => ({
    pieceId: placement.pieceId,
    cells: placement.cells.map((cell) => ({
      x: cell.x - minX,
      y: cell.y - minY,
    })),
  }));
  const targetCells = normalizedPlacements.flatMap(
    (placement) => placement.cells,
  );

  return {
    id,
    label,
    width: Math.max(...targetCells.map((cell) => cell.x)) + 1,
    height: Math.max(...targetCells.map((cell) => cell.y)) + 1,
    targetCells,
    placements: normalizedPlacements,
  };
}

export const pentominoBuildChallenges: PentominoBuildChallenge[] = [
  createChallenge("open-step", "Open step", ["p", "z", "v"]),
  createChallenge("long-step", "Long step", ["n", "i", "p"]),
];

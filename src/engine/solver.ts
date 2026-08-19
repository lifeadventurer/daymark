import { getBoardBounds } from "./board";
import {
  getPlacementCells,
  isBoardStateLegal,
  isPlacementLegal,
} from "./placement";
import { generateOrientations } from "./geometry";
import type {
  BoardDefinition,
  GridPoint,
  PieceDefinition,
  PiecePlacement,
} from "./types";

interface PlacementCandidate {
  placement: PiecePlacement;
  cells: GridPoint[];
  keys: string[];
}

/** Finds one legal solution for a target date, if the supplied pieces can solve it. */
export function findPuzzleSolution(
  board: BoardDefinition,
  pieces: PieceDefinition[],
  targetDate: number,
  requiredPieceCount: number,
): PiecePlacement[] | undefined {
  const targetCell = board.cells.find((cell) => cell.date === targetDate);
  if (!targetCell || targetCell.playable === false) return undefined;

  const piecesById = new Map(pieces.map((piece) => [piece.id, piece]));
  const requiredCells = board.cells
    .filter(
      (cell) =>
        cell.playable !== false &&
        cell.date !== undefined &&
        cell.date !== targetDate,
    )
    .map(pointKey);
  const candidatesByCell = new Map<string, PlacementCandidate[]>();
  const bounds = getBoardBounds(board);

  for (const piece of pieces) {
    const orientations = generateOrientations(piece);
    for (
      let orientation = 0;
      orientation < orientations.length;
      orientation += 1
    ) {
      for (let originY = bounds.minY; originY <= bounds.maxY; originY += 1) {
        for (let originX = bounds.minX; originX <= bounds.maxX; originX += 1) {
          const placement: PiecePlacement = {
            pieceId: piece.id,
            orientation,
            origin: { x: originX, y: originY },
          };
          if (
            !isPlacementLegal(
              board,
              piece,
              placement,
              [],
              piecesById,
              targetDate,
            )
          ) {
            continue;
          }

          const cells = getPlacementCells(piece, placement);
          const candidate = {
            placement,
            cells,
            keys: cells.map(pointKey),
          };
          for (const key of candidate.keys) {
            const candidates = candidatesByCell.get(key) ?? [];
            candidates.push(candidate);
            candidatesByCell.set(key, candidates);
          }
        }
      }
    }
  }

  const failedStates = new Set<string>();

  function search(
    placements: PiecePlacement[],
    usedPieceIds: Set<string>,
    occupied: Set<string>,
  ): PiecePlacement[] | undefined {
    if (placements.length === requiredPieceCount) {
      return isBoardStateLegal(board, piecesById, placements, targetDate)
        ? placements
        : undefined;
    }

    const stateKey = `${[...usedPieceIds].sort().join(",")}|${[...occupied]
      .sort()
      .join(";")}`;
    if (failedStates.has(stateKey)) return undefined;

    const nextCell = requiredCells
      .filter((cell) => !occupied.has(cell))
      .map((cell) => ({
        candidates: (candidatesByCell.get(cell) ?? []).filter(
          (candidate) =>
            !usedPieceIds.has(candidate.placement.pieceId) &&
            candidate.keys.every((key) => !occupied.has(key)),
        ),
      }))
      .sort(
        (first, second) => first.candidates.length - second.candidates.length,
      )[0];

    if (!nextCell || nextCell.candidates.length === 0) {
      failedStates.add(stateKey);
      return undefined;
    }

    for (const candidate of nextCell.candidates) {
      const nextUsedPieceIds = new Set(usedPieceIds);
      nextUsedPieceIds.add(candidate.placement.pieceId);
      const nextOccupied = new Set(occupied);
      for (const key of candidate.keys) nextOccupied.add(key);

      const solution = search(
        [...placements, candidate.placement],
        nextUsedPieceIds,
        nextOccupied,
      );
      if (solution) return solution;
    }

    failedStates.add(stateKey);
    return undefined;
  }

  return search([], new Set(), new Set());
}

function pointKey(point: GridPoint): string {
  return `${point.x},${point.y}`;
}

import { getBoardCell } from "./board";
import { generateOrientations, translateCells } from "./geometry";
import type {
  BoardDefinition,
  GridPoint,
  PieceDefinition,
  PiecePlacement,
} from "./types";

export function getPlacementCells(
  piece: PieceDefinition,
  placement: PiecePlacement,
): GridPoint[] {
  const orientation = generateOrientations(piece)[placement.orientation];
  if (!orientation) return [];
  return translateCells(orientation, placement.origin);
}

export function getCenteredPlacement(
  piece: PieceDefinition,
  orientationIndex: number,
  point: GridPoint,
): PiecePlacement | undefined {
  const orientation = generateOrientations(piece)[orientationIndex];
  if (!orientation) return undefined;

  const width = Math.max(...orientation.map((cell) => cell.x), 0) + 1;
  const height = Math.max(...orientation.map((cell) => cell.y), 0) + 1;

  return {
    pieceId: piece.id,
    orientation: orientationIndex,
    origin: {
      x: Math.round(point.x - width / 2),
      y: Math.round(point.y - height / 2),
    },
  };
}

export function isPlacementWithinBoard(
  board: BoardDefinition,
  piece: PieceDefinition,
  placement: PiecePlacement,
): boolean {
  const cells = getPlacementCells(piece, placement);
  return (
    cells.length > 0 &&
    cells.every((cell) => getBoardCell(board, cell) !== undefined)
  );
}

export function placementCoversTarget(
  board: BoardDefinition,
  piece: PieceDefinition,
  placement: PiecePlacement,
  targetDate: number,
): boolean {
  return getPlacementCells(piece, placement).some(
    (cell) => getBoardCell(board, cell)?.date === targetDate,
  );
}

export function placementsOverlap(
  first: PiecePlacement,
  firstPiece: PieceDefinition,
  second: PiecePlacement,
  secondPiece: PieceDefinition,
): boolean {
  const firstKeys = new Set(getPlacementCells(firstPiece, first).map(pointKey));
  return getPlacementCells(secondPiece, second).some((cell) =>
    firstKeys.has(pointKey(cell)),
  );
}

export function isPlacementLegal(
  board: BoardDefinition,
  piece: PieceDefinition,
  placement: PiecePlacement,
  existingPlacements: PiecePlacement[],
  piecesById: ReadonlyMap<string, PieceDefinition>,
  targetDate: number,
): boolean {
  if (
    !isPlacementWithinBoard(board, piece, placement) ||
    placementCoversTarget(board, piece, placement, targetDate)
  ) {
    return false;
  }

  return existingPlacements.every((existingPlacement) => {
    const existingPiece = piecesById.get(existingPlacement.pieceId);
    return existingPiece
      ? !placementsOverlap(placement, piece, existingPlacement, existingPiece)
      : false;
  });
}

export function allRequiredCellsCovered(
  board: BoardDefinition,
  piecesById: ReadonlyMap<string, PieceDefinition>,
  placements: PiecePlacement[],
  targetDate: number,
): boolean {
  const covered = new Set<string>();
  for (const placement of placements) {
    const piece = piecesById.get(placement.pieceId);
    if (!piece) return false;
    for (const cell of getPlacementCells(piece, placement))
      covered.add(pointKey(cell));
  }

  return board.cells
    .filter(
      (cell) =>
        cell.playable !== false &&
        cell.date !== undefined &&
        cell.date !== targetDate,
    )
    .every((cell) => covered.has(pointKey(cell)));
}

export function isBoardStateLegal(
  board: BoardDefinition,
  piecesById: ReadonlyMap<string, PieceDefinition>,
  placements: PiecePlacement[],
  targetDate: number,
): boolean {
  const seenPieceIds = new Set<string>();

  for (const placement of placements) {
    const piece = piecesById.get(placement.pieceId);
    if (!piece || seenPieceIds.has(placement.pieceId)) return false;
    seenPieceIds.add(placement.pieceId);

    if (
      !isPlacementWithinBoard(board, piece, placement) ||
      placementCoversTarget(board, piece, placement, targetDate)
    ) {
      return false;
    }
  }

  for (let index = 0; index < placements.length; index += 1) {
    for (
      let nextIndex = index + 1;
      nextIndex < placements.length;
      nextIndex += 1
    ) {
      const first = placements[index];
      const second = placements[nextIndex];
      const firstPiece = piecesById.get(first.pieceId);
      const secondPiece = piecesById.get(second.pieceId);
      if (
        firstPiece &&
        secondPiece &&
        placementsOverlap(first, firstPiece, second, secondPiece)
      )
        return false;
    }
  }

  return allRequiredCellsCovered(board, piecesById, placements, targetDate);
}

function pointKey(point: GridPoint): string {
  return `${point.x},${point.y}`;
}

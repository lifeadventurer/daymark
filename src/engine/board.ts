import type { BoardCell, BoardDefinition, GridPoint } from "./types";

export function createBoardDefinition(
  id: string,
  cells: BoardCell[],
): BoardDefinition {
  return { id, cells: cells.map((cell) => ({ ...cell })) };
}

export function hasBoardCell(
  board: BoardDefinition,
  point: GridPoint,
): boolean {
  return board.cells.some(
    (cell) =>
      cell.playable !== false && cell.x === point.x && cell.y === point.y,
  );
}

export function getBoardCell(
  board: BoardDefinition,
  point: GridPoint,
): BoardCell | undefined {
  return board.cells.find(
    (cell) =>
      cell.playable !== false && cell.x === point.x && cell.y === point.y,
  );
}

export function getCellForDate(
  board: BoardDefinition,
  dateNumber: number,
): BoardCell | undefined {
  return board.cells.find((cell) => cell.date === dateNumber);
}

export function getBoardBounds(board: BoardDefinition): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  if (board.cells.length === 0) return { minX: 0, maxX: 0, minY: 0, maxY: 0 };

  return {
    minX: Math.min(...board.cells.map((cell) => cell.x)),
    maxX: Math.max(...board.cells.map((cell) => cell.x)),
    minY: Math.min(...board.cells.map((cell) => cell.y)),
    maxY: Math.max(...board.cells.map((cell) => cell.y)),
  };
}

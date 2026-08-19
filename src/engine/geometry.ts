import type { GridPoint, Orientation, PieceDefinition } from "./types";

export function normalizeCells(cells: GridPoint[]): GridPoint[] {
  if (cells.length === 0) return [];

  const minX = Math.min(...cells.map((cell) => cell.x));
  const minY = Math.min(...cells.map((cell) => cell.y));

  return cells
    .map(({ x, y }) => ({ x: x - minX, y: y - minY }))
    .sort(comparePoints);
}

export function rotateCells(cells: GridPoint[]): GridPoint[] {
  return normalizeCells(cells.map(({ x, y }) => ({ x: -y, y: x })));
}

export function reflectCells(cells: GridPoint[]): GridPoint[] {
  return normalizeCells(cells.map(({ x, y }) => ({ x: -x, y })));
}

export function reflectCellsVertically(cells: GridPoint[]): GridPoint[] {
  return normalizeCells(cells.map(({ x, y }) => ({ x, y: -y })));
}

export function generateOrientations(piece: PieceDefinition): Orientation[] {
  const orientations: Orientation[] = [];
  const candidates: GridPoint[][] = [piece.cells];

  if (piece.allowRotation) {
    let rotated = piece.cells;
    for (let index = 0; index < 3; index += 1) {
      rotated = rotateCells(rotated);
      candidates.push(rotated);
    }
  }

  if (piece.allowReflection) {
    const reflected = reflectCells(piece.cells);
    candidates.push(reflected);
    candidates.push(reflectCellsVertically(piece.cells));

    if (piece.allowRotation) {
      let rotated = reflected;
      for (let index = 0; index < 3; index += 1) {
        rotated = rotateCells(rotated);
        candidates.push(rotated);
      }
    }
  }

  for (const candidate of candidates) {
    const normalized = normalizeCells(candidate);
    const key = orientationKey(normalized);
    if (
      !orientations.some((orientation) => orientationKey(orientation) === key)
    ) {
      orientations.push(normalized);
    }
  }

  return orientations;
}

export function orientationKey(cells: GridPoint[]): string {
  return normalizeCells(cells)
    .map(({ x, y }) => `${x},${y}`)
    .join("|");
}

export function translateCells(
  cells: GridPoint[],
  origin: GridPoint,
): GridPoint[] {
  return cells.map(({ x, y }) => ({ x: x + origin.x, y: y + origin.y }));
}

function comparePoints(a: GridPoint, b: GridPoint): number {
  return a.y - b.y || a.x - b.x;
}

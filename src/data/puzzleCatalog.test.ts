import { describe, expect, it } from "vitest";
import { generateOrientations } from "../engine/geometry";
import {
  getPlacementCells,
  isBoardStateLegal,
  isPlacementLegal,
} from "../engine/placement";
import type {
  GridPoint,
  PieceDefinition,
  PiecePlacement,
} from "../engine/types";
import {
  calendar31Board,
  calendar31PuzzleRules,
  calendarBoardVariants,
  difficultyDefinitions,
  weekdayNames,
} from "./puzzleCatalog";
import { pieceDefinitions } from "./pieces";

const boardWidth = Math.max(...calendar31Board.cells.map((cell) => cell.x));
const boardHeight = Math.max(...calendar31Board.cells.map((cell) => cell.y));

function pointKey(point: GridPoint): string {
  return `${point.x},${point.y}`;
}

function hasSolution(targetDate: number, pieces: PieceDefinition[]): boolean {
  const piecesById = new Map(pieces.map((piece) => [piece.id, piece]));
  const requiredCells = calendar31Board.cells
    .filter((cell) => cell.date !== undefined && cell.date !== targetDate)
    .map(pointKey);
  const candidatesByCell = new Map<string, PiecePlacement[]>();

  for (const piece of pieces) {
    for (
      let orientation = 0;
      orientation < generateOrientations(piece).length;
      orientation += 1
    ) {
      for (let originY = 0; originY <= boardHeight; originY += 1) {
        for (let originX = 0; originX <= boardWidth; originX += 1) {
          const candidate: PiecePlacement = {
            pieceId: piece.id,
            orientation,
            origin: { x: originX, y: originY },
          };
          if (
            !isPlacementLegal(
              calendar31Board,
              piece,
              candidate,
              [],
              piecesById,
              targetDate,
            )
          ) {
            continue;
          }
          for (const cell of getPlacementCells(piece, candidate)) {
            const key = pointKey(cell);
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
  ): boolean {
    if (placements.length === calendar31PuzzleRules.requiredPieceCount) {
      return isBoardStateLegal(
        calendar31Board,
        piecesById,
        placements,
        targetDate,
      );
    }

    const stateKey = `${[...usedPieceIds].sort().join(",")}|${[...occupied]
      .sort()
      .join(";")}`;
    if (failedStates.has(stateKey)) return false;

    const nextCell = requiredCells
      .filter((cell) => !occupied.has(cell))
      .map((cell) => ({
        cell,
        candidates: (candidatesByCell.get(cell) ?? []).filter((candidate) => {
          if (usedPieceIds.has(candidate.pieceId)) return false;
          const piece = piecesById.get(candidate.pieceId);
          return Boolean(
            piece &&
            getPlacementCells(piece, candidate).every(
              (coveredCell) => !occupied.has(pointKey(coveredCell)),
            ),
          );
        }),
      }))
      .sort(
        (first, second) => first.candidates.length - second.candidates.length,
      )[0];

    if (!nextCell || nextCell.candidates.length === 0) {
      failedStates.add(stateKey);
      return false;
    }

    for (const candidate of nextCell.candidates) {
      const piece = piecesById.get(candidate.pieceId);
      if (!piece) continue;

      const nextUsedPieceIds = new Set(usedPieceIds);
      nextUsedPieceIds.add(piece.id);
      const nextOccupied = new Set(occupied);
      for (const cell of getPlacementCells(piece, candidate)) {
        nextOccupied.add(pointKey(cell));
      }
      if (search([...placements, candidate], nextUsedPieceIds, nextOccupied)) {
        return true;
      }
    }

    failedStates.add(stateKey);
    return false;
  }

  return search([], new Set(), new Set());
}

describe("calendar puzzle difficulties", () => {
  it("uses a zero-based weekday index for the current board catalog", () => {
    const currentBoard = calendarBoardVariants["31-0"];

    expect(weekdayNames).toEqual([
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ]);
    expect(currentBoard.daysInMonth).toBe(31);
    expect(currentBoard.startsOnWeekday).toBe(0);
    expect(currentBoard.cells).toHaveLength(31);
  });

  it("keeps the hard seven-piece pool solvable for every date", () => {
    const hardPieces = pieceDefinitions.filter((piece) =>
      difficultyDefinitions.hard.pieceIds.includes(piece.id),
    );

    expect(hardPieces).toHaveLength(7);
    expect(
      Array.from({ length: 31 }, (_, index) => index + 1).every((date) =>
        hasSolution(date, hardPieces),
      ),
    ).toBe(true);
  }, 30_000);

  it("keeps easier difficulties as supersets of the hard pool", () => {
    expect(
      difficultyDefinitions.medium.pieceIds.every((pieceId) =>
        pieceDefinitions.some((piece) => piece.id === pieceId),
      ),
    ).toBe(true);
    expect(
      difficultyDefinitions.easy.pieceIds.every((pieceId) =>
        pieceDefinitions.some((piece) => piece.id === pieceId),
      ),
    ).toBe(true);
    expect(
      difficultyDefinitions.medium.pieceIds.every((pieceId) =>
        difficultyDefinitions.easy.pieceIds.includes(pieceId),
      ),
    ).toBe(true);
    expect(
      difficultyDefinitions.hard.pieceIds.every((pieceId) =>
        difficultyDefinitions.medium.pieceIds.includes(pieceId),
      ),
    ).toBe(true);
  });
});

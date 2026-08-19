import { describe, expect, it } from "vitest";
import { findPuzzleSolution } from "../engine/solver";
import {
  calendar31Board,
  calendar31PuzzleRules,
  calendarBoardVariants,
  difficultyDefinitions,
  weekdayNames,
} from "./puzzleCatalog";
import { pieceDefinitions } from "./pieces";

describe("calendar puzzle catalog", () => {
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
        findPuzzleSolution(
          calendar31Board,
          hardPieces,
          date,
          calendar31PuzzleRules.requiredPieceCount,
        ),
      ),
    ).toBe(true);
  }, 30_000);

  it("rejects a target date that is not on the board", () => {
    const hardPieces = pieceDefinitions.filter((piece) =>
      difficultyDefinitions.hard.pieceIds.includes(piece.id),
    );

    expect(
      findPuzzleSolution(
        calendar31Board,
        hardPieces,
        32,
        calendar31PuzzleRules.requiredPieceCount,
      ),
    ).toBeUndefined();
  });

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

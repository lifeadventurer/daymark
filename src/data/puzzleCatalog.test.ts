import { describe, expect, it } from "vitest";
import { findPuzzleSolution } from "../engine/solver";
import {
  activeCalendarBoardKey,
  activeCalendarPuzzle,
  calendarBoardOptions,
  calendarBoardVariants,
  getCalendarPuzzleConfiguration,
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

    const mondayBoard = calendarBoardVariants["31-1"];
    expect(mondayBoard.daysInMonth).toBe(31);
    expect(mondayBoard.startsOnWeekday).toBe(1);
    expect(mondayBoard.cells).toHaveLength(35);
    expect(
      mondayBoard.cells.filter((cell) => cell.playable !== false),
    ).toHaveLength(31);
    expect(activeCalendarBoardKey).toBe("31-1");
    expect(activeCalendarPuzzle.board.id).toBe("calendar-31-1");
    expect(calendarBoardOptions).toEqual([
      { key: "31-0", label: "31 days · Sunday start" },
      { key: "31-1", label: "31 days · Monday start" },
    ]);
    expect(getCalendarPuzzleConfiguration("31-0").board.id).toBe(
      "calendar-31-0",
    );
    expect(getCalendarPuzzleConfiguration("31-1").startsOnWeekday).toBe(1);
  });

  it("keeps the hard seven-piece pool solvable for every date", () => {
    const difficultyDefinitions = activeCalendarPuzzle.difficultyDefinitions;
    const hardPieces = pieceDefinitions.filter((piece) =>
      difficultyDefinitions.hard.pieceIds.includes(piece.id),
    );

    expect(hardPieces).toHaveLength(7);
    expect(
      Array.from({ length: 31 }, (_, index) => index + 1).every((date) =>
        findPuzzleSolution(
          activeCalendarPuzzle.board,
          hardPieces,
          date,
          activeCalendarPuzzle.requiredPieceCount,
        ),
      ),
    ).toBe(true);
  }, 30_000);

  it("rejects a target date that is not on the board", () => {
    const difficultyDefinitions = activeCalendarPuzzle.difficultyDefinitions;
    const hardPieces = pieceDefinitions.filter((piece) =>
      difficultyDefinitions.hard.pieceIds.includes(piece.id),
    );

    expect(
      findPuzzleSolution(
        activeCalendarPuzzle.board,
        hardPieces,
        32,
        activeCalendarPuzzle.requiredPieceCount,
      ),
    ).toBeUndefined();
  });

  it("keeps easier difficulties as supersets of the hard pool", () => {
    const difficultyDefinitions = activeCalendarPuzzle.difficultyDefinitions;
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

import { describe, expect, it } from "vitest";
import { findPuzzleSolution } from "../engine/solver";
import {
  activeCalendarBoardKey,
  activeCalendarPuzzle,
  calendarBoardOptions,
  calendarBoardVariants,
  getCalendarBoardKeyForDate,
  getCalendarPuzzleConfiguration,
  getPiecePoolForDate,
  getPuzzleSetupForDate,
  weekdayNames,
} from "./puzzleCatalog";
import { pieceDefinitions } from "./pieces";

describe("calendar puzzle catalog", () => {
  it("resolves a date to its month-length and starting-weekday board", () => {
    expect(getCalendarBoardKeyForDate(new Date(2026, 7, 20))).toBe("31-6");
    expect(getCalendarBoardKeyForDate(new Date(2026, 0, 15))).toBe("31-4");
    expect(getCalendarBoardKeyForDate(new Date(2026, 3, 15))).toBe("30-3");
    expect(getCalendarBoardKeyForDate(new Date(2028, 1, 15))).toBeUndefined();
  });

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
    expect(calendarBoardOptions.map((option) => option.key)).toEqual([
      "31-0",
      "31-1",
      "31-2",
      "31-3",
      "31-4",
      "31-5",
      "31-6",
      "30-0",
      "30-1",
      "30-2",
      "30-3",
      "30-4",
      "30-5",
      "30-6",
    ]);
    expect(calendarBoardOptions.at(-1)?.label).toBe("30 days · Saturday start");
    expect(getCalendarPuzzleConfiguration("31-0").board.id).toBe(
      "calendar-31-0",
    );
    expect(getCalendarPuzzleConfiguration("31-1").startsOnWeekday).toBe(1);
    const saturday30 = getCalendarPuzzleConfiguration("30-6");
    expect(saturday30.daysInMonth).toBe(30);
    expect(saturday30.startsOnWeekday).toBe(6);
    expect(
      saturday30.board.cells.filter((cell) => cell.date !== undefined),
    ).toHaveLength(30);
    expect(saturday30.dateRules[8]?.requiredPieceCount).toBe(7);
    expect(saturday30.dateRules[23]?.requiredPieceCount).toBe(7);
    expect(saturday30.dateRules[3]).toBeUndefined();
    expect(saturday30.dateRules[28]).toBeUndefined();
    expect(
      getCalendarPuzzleConfiguration("31-0").difficultyDefinitions.hard
        .piecePools,
    ).toEqual([
      ["p", "l", "y", "n", "u", "v", "z"],
      ["p", "l", "y", "n", "u", "v", "f"],
      ["p", "l", "y", "n", "u", "v", "i"],
      ["p", "l", "y", "n", "u", "z", "f"],
      ["p", "l", "y", "n", "u", "z", "i"],
    ]);
    expect(
      getCalendarPuzzleConfiguration("31-1").difficultyDefinitions.hard
        .piecePools,
    ).toHaveLength(5);
    expect(
      new Set(
        getCalendarPuzzleConfiguration(
          "31-1",
        ).difficultyDefinitions.hard.piecePools.map((pool) => pool.join(",")),
      ).size,
    ).toBeGreaterThan(1);
  });

  it("selects a deterministic hard pool that stays solvable for every date", () => {
    const dateKeys = Array.from(
      { length: 31 },
      (_, index) => `2026-08-${String(index + 1).padStart(2, "0")}`,
    );
    const selectedPools = dateKeys.map((dateKey) =>
      getPiecePoolForDate(activeCalendarPuzzle, "hard", dateKey),
    );

    expect(selectedPools.every((pool) => pool.length === 7)).toBe(true);
    expect(
      getPiecePoolForDate(activeCalendarPuzzle, "hard", dateKeys[0]),
    ).toEqual(selectedPools[0]);
    expect(
      new Set(selectedPools.map((pool) => pool.join(","))).size,
    ).toBeGreaterThan(1);
    expect(
      dateKeys.every((_dateKey, index) => {
        const hardPieces = pieceDefinitions.filter((piece) =>
          selectedPools[index].includes(piece.id),
        );
        return Boolean(
          findPuzzleSolution(
            activeCalendarPuzzle.board,
            hardPieces,
            index + 1,
            activeCalendarPuzzle.requiredPieceCount,
          ),
        );
      }),
    ).toBe(true);
  }, 30_000);

  it("splits the P piece to solve isolated corner dates", () => {
    const isolatedCornerCases = [
      {
        boardKey: "31-5" as const,
        targetDate: 24,
        dateKey: "2026-07-24",
      },
      {
        boardKey: "31-6" as const,
        targetDate: 8,
        dateKey: "2026-08-08",
      },
    ];

    for (const { boardKey, targetDate, dateKey } of isolatedCornerCases) {
      const puzzle = getCalendarPuzzleConfiguration(boardKey);
      for (const difficulty of ["easy", "medium", "hard"] as const) {
        const setup = getPuzzleSetupForDate(
          puzzle,
          difficulty,
          dateKey,
          targetDate,
        );
        const availablePieces = pieceDefinitions.filter((piece) =>
          setup.pieceIds.includes(piece.id),
        );
        const solution = findPuzzleSolution(
          puzzle.board,
          availablePieces,
          targetDate,
          setup.requiredPieceCount,
        );

        expect(setup.requiredPieceCount).toBe(7);
        expect(setup.pieceIds).not.toContain("p");
        expect(setup.pieceIds).toEqual(expect.arrayContaining(["p4", "p1"]));
        expect(solution).toHaveLength(7);
      }
    }

    const regularSetup = getPuzzleSetupForDate(
      getCalendarPuzzleConfiguration("31-5"),
      "hard",
      "2026-07-23",
      23,
    );
    expect(regularSetup.requiredPieceCount).toBe(6);
    expect(regularSetup.pieceIds).toContain("p");
    expect(regularSetup.pieceIds).not.toContain("p4");
    expect(regularSetup.pieceIds).not.toContain("p1");
  }, 30_000);

  it("rejects a target date that is not on the board", () => {
    const hardPool = getPiecePoolForDate(
      activeCalendarPuzzle,
      "hard",
      "2026-08-01",
    );
    const hardPieces = pieceDefinitions.filter((piece) =>
      hardPool.includes(piece.id),
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
      difficultyDefinitions.medium.piecePools[0].every((pieceId) =>
        pieceDefinitions.some((piece) => piece.id === pieceId),
      ),
    ).toBe(true);
    expect(
      difficultyDefinitions.easy.piecePools[0].every((pieceId) =>
        pieceDefinitions.some((piece) => piece.id === pieceId),
      ),
    ).toBe(true);
    expect(
      difficultyDefinitions.medium.piecePools.every((pool) =>
        pool.every((pieceId) =>
          difficultyDefinitions.easy.piecePools[0].includes(pieceId),
        ),
      ),
    ).toBe(true);
    expect(
      difficultyDefinitions.hard.piecePools.every((pool) =>
        pool.every((pieceId) =>
          difficultyDefinitions.medium.piecePools[0].includes(pieceId),
        ),
      ),
    ).toBe(true);
  });
});

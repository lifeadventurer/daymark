import { createBoardDefinition } from "../engine/board";
import type { BoardDefinition } from "../engine/types";
import calendarPuzzleCatalog from "./puzzles/calendar-puzzles.json";

export type PuzzleDifficulty = "easy" | "medium" | "hard";

export interface PuzzleDifficultyDefinition {
  id: PuzzleDifficulty;
  label: string;
  description: string;
  pieceIds: string[];
}

export const weekdayNames = calendarPuzzleCatalog.weekdayIndex;
export const calendarBoardVariants = calendarPuzzleCatalog.boards;

export type CalendarBoardKey = keyof typeof calendarBoardVariants;

export interface CalendarBoardOption {
  key: CalendarBoardKey;
  label: string;
}

export interface CalendarPuzzleConfiguration {
  boardKey: CalendarBoardKey;
  daysInMonth: number;
  startsOnWeekday: number;
  board: BoardDefinition;
  requiredPieceCount: number;
  difficultyDefinitions: Record<PuzzleDifficulty, PuzzleDifficultyDefinition>;
}

function createDifficultyDefinitions(
  boardKey: CalendarBoardKey,
): CalendarPuzzleConfiguration["difficultyDefinitions"] {
  const catalog = calendarBoardVariants[boardKey];

  return {
    easy: {
      id: "easy",
      ...catalog.difficulties.easy,
    },
    medium: {
      id: "medium",
      ...catalog.difficulties.medium,
    },
    hard: {
      id: "hard",
      ...catalog.difficulties.hard,
    },
  };
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export const calendarBoardOptions: CalendarBoardOption[] = Object.entries(
  calendarBoardVariants,
).map(([key, catalog]) => ({
  key: key as CalendarBoardKey,
  label: `${catalog.daysInMonth} days · ${capitalize(
    weekdayNames[catalog.startsOnWeekday],
  )} start`,
}));

export function getCalendarPuzzleConfiguration(
  boardKey: CalendarBoardKey,
): CalendarPuzzleConfiguration {
  const catalog = calendarBoardVariants[boardKey];

  return {
    boardKey,
    daysInMonth: catalog.daysInMonth,
    startsOnWeekday: catalog.startsOnWeekday,
    board: createBoardDefinition(`calendar-${boardKey}`, catalog.cells),
    requiredPieceCount: catalog.requiredPieceCount,
    difficultyDefinitions: createDifficultyDefinitions(boardKey),
  };
}

export const activeCalendarBoardKey: CalendarBoardKey = "31-1";
export const activeCalendarPuzzle = getCalendarPuzzleConfiguration(
  activeCalendarBoardKey,
);

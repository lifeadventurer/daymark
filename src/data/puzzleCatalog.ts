import { createBoardDefinition } from "../engine/board";
import type { BoardDefinition } from "../engine/types";
import calendarPuzzleCatalog from "./puzzles/calendar-puzzles.json";

export type PuzzleDifficulty = "easy" | "medium" | "hard";

export interface PuzzleDifficultyDefinition {
  id: PuzzleDifficulty;
  label: string;
  description: string;
  piecePools: string[][];
}

interface CatalogDifficultyDefinition {
  label: string;
  description: string;
  pieceIds?: string[];
  piecePools?: string[][];
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
    easy: createDifficultyDefinition("easy", catalog.difficulties.easy),
    medium: createDifficultyDefinition("medium", catalog.difficulties.medium),
    hard: createDifficultyDefinition("hard", catalog.difficulties.hard),
  };
}

function createDifficultyDefinition(
  id: PuzzleDifficulty,
  catalogDifficulty: CatalogDifficultyDefinition,
): PuzzleDifficultyDefinition {
  const piecePools =
    catalogDifficulty.piecePools ??
    (catalogDifficulty.pieceIds ? [catalogDifficulty.pieceIds] : []);

  if (piecePools.length === 0) {
    throw new Error(`No piece pools configured for ${id} difficulty`);
  }

  return {
    id,
    label: catalogDifficulty.label,
    description: catalogDifficulty.description,
    piecePools: piecePools.map((pool) => [...pool]),
  };
}

function stableHash(value: string): number {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Select one catalog-defined pool consistently for a board, difficulty, and
 * calendar date. The date is the seed for now; visitor-specific inputs can be
 * added later without changing the catalog format.
 */
export function getPiecePoolForDate(
  puzzle: CalendarPuzzleConfiguration,
  difficulty: PuzzleDifficulty,
  dateKey: string,
): string[] {
  const definition = puzzle.difficultyDefinitions[difficulty];
  const poolIndex =
    stableHash(`${puzzle.boardKey}:${difficulty}:${dateKey}`) %
    definition.piecePools.length;
  return [...definition.piecePools[poolIndex]];
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

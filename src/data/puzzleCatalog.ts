import { createBoardDefinition } from "../engine/board";
import type { BoardDefinition } from "../engine/types";
import calendarPuzzleCatalog from "./puzzles/calendar-puzzles.json";
import { calendar28BoardVariants } from "./puzzles/calendar-28-puzzles";
import { calendar29BoardVariants } from "./puzzles/calendar-29-puzzles";
import { calendar30BoardVariants } from "./puzzles/calendar-30-puzzles";

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

interface CatalogDateRule {
  requiredPieceCount: number;
  pieceReplacements: Record<string, string[]>;
}

interface CatalogBoardWithDateRules {
  dateRules?: Record<string, CatalogDateRule>;
}

export const weekdayNames = calendarPuzzleCatalog.weekdayIndex;
export const calendarBoardVariants = {
  ...calendarPuzzleCatalog.boards,
  ...calendar30BoardVariants,
  ...calendar29BoardVariants,
  ...calendar28BoardVariants,
};

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
  dateRules: Record<number, PuzzleDateRule>;
  difficultyDefinitions: Record<PuzzleDifficulty, PuzzleDifficultyDefinition>;
}

export interface PuzzleDateRule {
  requiredPieceCount: number;
  pieceReplacements: Record<string, string[]>;
}

export interface PuzzleSetup {
  requiredPieceCount: number;
  pieceIds: string[];
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

export function getPuzzleSetupForPiecePool(
  puzzle: CalendarPuzzleConfiguration,
  pieceIds: string[],
  targetDate: number,
): PuzzleSetup {
  const dateRule = puzzle.dateRules[targetDate];
  if (!dateRule) {
    return {
      requiredPieceCount: puzzle.requiredPieceCount,
      pieceIds: [...pieceIds],
    };
  }

  return {
    requiredPieceCount: dateRule.requiredPieceCount,
    pieceIds: pieceIds.flatMap(
      (pieceId) => dateRule.pieceReplacements[pieceId] ?? [pieceId],
    ),
  };
}

export function getPuzzleSetupForDate(
  puzzle: CalendarPuzzleConfiguration,
  difficulty: PuzzleDifficulty,
  dateKey: string,
  targetDate: number,
): PuzzleSetup {
  return getPuzzleSetupForPiecePool(
    puzzle,
    getPiecePoolForDate(puzzle, difficulty, dateKey),
    targetDate,
  );
}

function createDateRules(
  boardKey: CalendarBoardKey,
): CalendarPuzzleConfiguration["dateRules"] {
  const catalog = calendarBoardVariants[
    boardKey
  ] as (typeof calendarBoardVariants)[CalendarBoardKey] &
    CatalogBoardWithDateRules;

  return Object.fromEntries(
    Object.entries(catalog.dateRules ?? {}).map(([date, rule]) => [
      Number(date),
      {
        requiredPieceCount: rule.requiredPieceCount,
        pieceReplacements: Object.fromEntries(
          Object.entries(rule.pieceReplacements).map(
            ([pieceId, replacements]) => [pieceId, [...replacements]],
          ),
        ),
      },
    ]),
  );
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

/**
 * Resolve a real calendar date to the catalog board for its month length and
 * first weekday. A missing result means that month shape has not been added
 * to the catalog yet.
 */
export function getCalendarBoardKeyForDate(
  date: Date,
): CalendarBoardKey | undefined {
  const daysInMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
  ).getDate();
  const startsOnWeekday = new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
  ).getDay();
  const boardKey = `${daysInMonth}-${startsOnWeekday}`;

  return Object.prototype.hasOwnProperty.call(calendarBoardVariants, boardKey)
    ? (boardKey as CalendarBoardKey)
    : undefined;
}

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
    dateRules: createDateRules(boardKey),
    difficultyDefinitions: createDifficultyDefinitions(boardKey),
  };
}

export const activeCalendarBoardKey: CalendarBoardKey = "31-1";
export const activeCalendarPuzzle = getCalendarPuzzleConfiguration(
  activeCalendarBoardKey,
);

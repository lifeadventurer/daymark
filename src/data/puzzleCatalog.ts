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
const calendar31Catalog = calendarBoardVariants["31-0"];

export const calendar31Board: BoardDefinition = createBoardDefinition(
  "calendar-31-start-sunday",
  calendar31Catalog.cells,
);

export const calendar31PuzzleRules = {
  requiredPieceCount: calendar31Catalog.requiredPieceCount,
};

export const difficultyDefinitions: Record<
  PuzzleDifficulty,
  PuzzleDifficultyDefinition
> = {
  easy: {
    id: "easy",
    ...calendar31Catalog.difficulties.easy,
  },
  medium: {
    id: "medium",
    ...calendar31Catalog.difficulties.medium,
  },
  hard: {
    id: "hard",
    ...calendar31Catalog.difficulties.hard,
  },
};

export const difficultyOptions = Object.values(difficultyDefinitions);

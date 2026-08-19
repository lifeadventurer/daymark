import { createBoardDefinition } from "../engine/board";
import type { BoardDefinition } from "../engine/types";
import calendar31Catalog from "./puzzles/calendar-31.json";

export type PuzzleDifficulty = "easy" | "medium" | "hard";

export interface PuzzleDifficultyDefinition {
  id: PuzzleDifficulty;
  label: string;
  description: string;
  pieceIds: string[];
}

export const calendar31Board: BoardDefinition = createBoardDefinition(
  calendar31Catalog.id,
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

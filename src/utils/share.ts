import type { PuzzleDifficulty } from "../data/puzzleCatalog";
import { dateFromInputValue } from "./date";

const puzzleDifficulties = ["easy", "medium", "hard"] as const;

export interface PuzzleShareParameters {
  dateKey: string;
  difficulty: PuzzleDifficulty;
}

export function isPuzzleDifficulty(
  value: string | null,
): value is PuzzleDifficulty {
  return puzzleDifficulties.includes(value as PuzzleDifficulty);
}

export function parsePuzzleShareParameters(
  search: string,
): PuzzleShareParameters | undefined {
  const parameters = new URLSearchParams(search);
  const dateKey = parameters.get("date");
  const difficulty = parameters.get("difficulty");

  if (
    !dateKey ||
    !dateFromInputValue(dateKey) ||
    !isPuzzleDifficulty(difficulty)
  ) {
    return undefined;
  }

  return { dateKey, difficulty };
}

export function createPuzzleShareUrl(
  dateKey: string,
  difficulty: PuzzleDifficulty,
  baseUrl: string,
): string {
  const url = new URL(baseUrl);
  url.search = "";
  url.hash = "";
  url.searchParams.set("date", dateKey);
  url.searchParams.set("difficulty", difficulty);
  return url.toString();
}

export function createPuzzleShareSummary(
  dateLabel: string,
  difficultyLabel: string,
  moveCount: number,
): string {
  const moveLabel = moveCount === 1 ? "move" : "moves";
  return `Daymark — ${dateLabel}\n${difficultyLabel} · ${moveCount} ${moveLabel}`;
}

import type { PuzzleDifficulty } from "../data/puzzleCatalog";
import { dateFromInputValue } from "./date";

const puzzleDifficulties = ["easy", "medium", "hard"] as const;

export interface PuzzleShareParameters {
  dateKey: string;
  difficulty: PuzzleDifficulty;
  boardKey?: string;
}

export interface SharedSolutionPlacement {
  pieceId: string;
  origin: { x: number; y: number };
  orientationIndex: number;
}

export interface PuzzleSolutionShareParameters extends PuzzleShareParameters {
  placements: SharedSolutionPlacement[];
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

  const boardKey = parameters.get("board");
  return boardKey ? { dateKey, difficulty, boardKey } : { dateKey, difficulty };
}

export function createPuzzleShareUrl(
  dateKey: string,
  difficulty: PuzzleDifficulty,
  baseUrl: string,
  boardKey?: string,
): string {
  const url = new URL(baseUrl);
  url.search = "";
  url.hash = "";
  url.searchParams.set("date", dateKey);
  url.searchParams.set("difficulty", difficulty);
  if (boardKey) url.searchParams.set("board", boardKey);
  return url.toString();
}

export function createPuzzleSolutionShareUrl(
  dateKey: string,
  difficulty: PuzzleDifficulty,
  boardKey: string,
  placements: SharedSolutionPlacement[],
  baseUrl: string,
): string {
  const url = new URL(
    createPuzzleShareUrl(dateKey, difficulty, baseUrl, boardKey),
  );
  const payload = JSON.stringify({
    v: 2,
    p: placements.map(({ pieceId, origin, orientationIndex }) => [
      pieceId,
      origin.x,
      origin.y,
      orientationIndex,
    ]),
  });
  url.hash = `solution=${encodeBase64Url(payload)}`;
  return url.toString();
}

export function parsePuzzleSolutionShareParameters(
  search: string,
  hash: string,
): PuzzleSolutionShareParameters | undefined {
  const puzzle = parsePuzzleShareParameters(search);
  if (!puzzle) return undefined;

  const encodedSolution = new URLSearchParams(hash.replace(/^#/, "")).get(
    "solution",
  );
  if (!encodedSolution) return undefined;

  const decoded = decodeBase64Url(encodedSolution);
  if (!decoded) return undefined;

  try {
    const payload: unknown = JSON.parse(decoded);
    if (!isRecord(payload)) return undefined;
    const rawPlacements =
      payload.version === 1 && Array.isArray(payload.placements)
        ? payload.placements
        : payload.v === 2 && Array.isArray(payload.p)
          ? payload.p
          : undefined;
    if (
      !rawPlacements ||
      rawPlacements.length === 0 ||
      rawPlacements.length > 64
    ) {
      return undefined;
    }
    const placements: SharedSolutionPlacement[] = [];
    for (const rawPlacement of rawPlacements) {
      const placement = parseSolutionPlacement(rawPlacement);
      if (!placement) return undefined;
      placements.push(placement);
    }

    return { ...puzzle, placements };
  } catch {
    return undefined;
  }
}

export function createPuzzleShareSummary(
  dateLabel: string,
  difficultyLabel: string,
  moveCount: number,
): string {
  const moveLabel = moveCount === 1 ? "move" : "moves";
  return `Daymark — ${dateLabel}\n${difficultyLabel} · ${moveCount} ${moveLabel}`;
}

export function createPuzzleSolutionShareSummary(
  dateLabel: string,
  difficultyLabel: string,
): string {
  return `Daymark solution — ${dateLabel}\n${difficultyLabel}`;
}

function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

function decodeBase64Url(value: string): string | undefined {
  try {
    const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    );
    return new TextDecoder().decode(bytes);
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function parseSolutionPlacement(
  value: unknown,
): SharedSolutionPlacement | undefined {
  if (Array.isArray(value)) {
    const [pieceId, x, y, orientationIndex] = value;
    if (
      value.length !== 4 ||
      typeof pieceId !== "string" ||
      pieceId.length === 0 ||
      pieceId.length > 64 ||
      !isInteger(x) ||
      !isInteger(y) ||
      !isInteger(orientationIndex) ||
      orientationIndex < 0
    ) {
      return undefined;
    }
    return {
      pieceId,
      origin: { x, y },
      orientationIndex,
    };
  }

  if (!isRecord(value) || typeof value.pieceId !== "string") {
    return undefined;
  }
  if (
    value.pieceId.length === 0 ||
    value.pieceId.length > 64 ||
    !isRecord(value.origin) ||
    !isInteger(value.origin.x) ||
    !isInteger(value.origin.y) ||
    !isInteger(value.orientationIndex) ||
    value.orientationIndex < 0
  ) {
    return undefined;
  }
  return {
    pieceId: value.pieceId,
    origin: { x: value.origin.x, y: value.origin.y },
    orientationIndex: value.orientationIndex,
  };
}

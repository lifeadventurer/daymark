import type { GridPoint } from "../engine/types";

export const RECORDS_STORAGE_KEY = "daymark:records:v1";
export const RECORDS_SCHEMA_VERSION = 1 as const;

export interface SavedPlacement {
  pieceId: string;
  origin: GridPoint;
  orientationIndex: number;
}

export interface SavedPuzzleRecord {
  placements: SavedPlacement[];
  moveCount: number;
  completed: boolean;
  completedAt: string | null;
}

export interface DaymarkRecordStore {
  schemaVersion: typeof RECORDS_SCHEMA_VERSION;
  puzzles: Record<string, SavedPuzzleRecord>;
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function createEmptyRecordStore(): DaymarkRecordStore {
  return {
    schemaVersion: RECORDS_SCHEMA_VERSION,
    puzzles: {},
  };
}

export function loadRecordStore(storage?: StorageLike): DaymarkRecordStore {
  const source = storage ?? getBrowserStorage();
  if (!source) return createEmptyRecordStore();

  try {
    const raw = source.getItem(RECORDS_STORAGE_KEY);
    if (!raw) return createEmptyRecordStore();

    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || parsed.schemaVersion !== RECORDS_SCHEMA_VERSION) {
      return createEmptyRecordStore();
    }

    const puzzles: Record<string, SavedPuzzleRecord> = {};
    if (!isRecord(parsed.puzzles)) return createEmptyRecordStore();

    for (const [dateKey, value] of Object.entries(parsed.puzzles)) {
      const record = parsePuzzleRecord(value);
      if (record) puzzles[dateKey] = record;
    }

    return { schemaVersion: RECORDS_SCHEMA_VERSION, puzzles };
  } catch {
    return createEmptyRecordStore();
  }
}

export function saveRecordStore(
  records: DaymarkRecordStore,
  storage?: StorageLike,
): void {
  const source = storage ?? getBrowserStorage();
  if (!source) return;

  try {
    source.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Storage can be unavailable or full. The puzzle remains playable in memory.
  }
}

function parsePuzzleRecord(value: unknown): SavedPuzzleRecord | undefined {
  if (!isRecord(value) || !Array.isArray(value.placements)) return undefined;

  const placements: SavedPlacement[] = [];
  for (const placement of value.placements) {
    if (!isRecord(placement) || typeof placement.pieceId !== "string") {
      return undefined;
    }
    if (
      !isRecord(placement.origin) ||
      !isFiniteNumber(placement.origin.x) ||
      !isFiniteNumber(placement.origin.y) ||
      !isFiniteNumber(placement.orientationIndex) ||
      !Number.isInteger(placement.orientationIndex) ||
      placement.orientationIndex < 0
    ) {
      return undefined;
    }
    placements.push({
      pieceId: placement.pieceId,
      origin: { x: placement.origin.x, y: placement.origin.y },
      orientationIndex: placement.orientationIndex,
    });
  }

  return {
    placements,
    moveCount:
      isFiniteNumber(value.moveCount) && value.moveCount >= 0
        ? Math.floor(value.moveCount)
        : 0,
    completed: value.completed === true,
    completedAt:
      typeof value.completedAt === "string" ? value.completedAt : null,
  };
}

function getBrowserStorage(): StorageLike | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

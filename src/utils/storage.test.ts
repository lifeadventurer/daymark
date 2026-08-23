import { describe, expect, it } from "vitest";
import {
  createEmptyRecordStore,
  getLegacyPuzzleRecordKey,
  getPuzzleRecordKey,
  getSavedPuzzleRecord,
  loadRecordStore,
  RECORDS_STORAGE_KEY,
  saveRecordStore,
} from "./storage";

function createMemoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("puzzle record storage", () => {
  it("namespaces records by board, date, and difficulty", () => {
    expect(getPuzzleRecordKey("31-1", "2026-08-18", "hard")).toBe(
      "31-1:2026-08-18:hard",
    );
  });

  it("keeps the legacy date-and-difficulty key format available", () => {
    expect(getLegacyPuzzleRecordKey("2026-08-18", "hard")).toBe(
      "2026-08-18:hard",
    );
  });

  it("prefers a board-specific record over legacy records", () => {
    const records = createEmptyRecordStore();
    const boardSpecific = {
      placements: [],
      moveCount: 3,
      completed: false,
      completedAt: null,
    };
    records.puzzles["31-1:2026-08-18:hard"] = boardSpecific;
    records.puzzles["2026-08-18:hard"] = {
      ...boardSpecific,
      moveCount: 7,
    };

    expect(getSavedPuzzleRecord(records, "31-1", "2026-08-18", "hard")).toBe(
      boardSpecific,
    );
  });

  it("reads legacy records only for the original Sunday-start board", () => {
    const records = createEmptyRecordStore();
    const legacyRecord = {
      placements: [],
      moveCount: 7,
      completed: false,
      completedAt: null,
    };
    records.puzzles["2026-08-18:hard"] = legacyRecord;

    expect(getSavedPuzzleRecord(records, "31-0", "2026-08-18", "hard")).toBe(
      legacyRecord,
    );
    expect(
      getSavedPuzzleRecord(records, "31-1", "2026-08-18", "hard"),
    ).toBeUndefined();
  });

  it("supports the former date-only hard-puzzle record", () => {
    const records = createEmptyRecordStore();
    const legacyRecord = {
      placements: [],
      moveCount: 11,
      completed: true,
      completedAt: "2026-08-18T12:30:00.000Z",
    };
    records.puzzles["2026-08-18"] = legacyRecord;

    expect(getSavedPuzzleRecord(records, "31-0", "2026-08-18", "hard")).toBe(
      legacyRecord,
    );
    expect(
      getSavedPuzzleRecord(records, "31-0", "2026-08-18", "easy"),
    ).toBeUndefined();
  });

  it("round-trips one versioned record store", () => {
    const storage = createMemoryStorage();
    const records = createEmptyRecordStore();
    records.puzzles["2026-08-18"] = {
      placements: [
        { pieceId: "red", origin: { x: 2, y: 1 }, orientationIndex: 3 },
      ],
      moveCount: 14,
      completed: true,
      completedAt: "2026-08-18T12:30:00.000Z",
    };

    saveRecordStore(records, storage);

    expect(storage.getItem(RECORDS_STORAGE_KEY)).toBeTruthy();
    expect(loadRecordStore(storage)).toEqual(records);
  });

  it("falls back safely for malformed saved data", () => {
    const storage = createMemoryStorage();
    storage.setItem(RECORDS_STORAGE_KEY, "{not-json");

    expect(loadRecordStore(storage)).toEqual(createEmptyRecordStore());
  });
});

import { describe, expect, it } from "vitest";
import {
  createEmptyRecordStore,
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

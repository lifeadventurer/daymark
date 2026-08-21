import { describe, expect, it } from "vitest";
import {
  createPuzzleShareSummary,
  createPuzzleShareUrl,
  parsePuzzleShareParameters,
} from "./share";

describe("puzzle share links", () => {
  it("parses a valid date and difficulty", () => {
    expect(
      parsePuzzleShareParameters("?date=2026-08-21&difficulty=hard"),
    ).toEqual({ dateKey: "2026-08-21", difficulty: "hard" });
  });

  it("rejects invalid or incomplete puzzle links", () => {
    expect(parsePuzzleShareParameters("?date=2026-02-31&difficulty=hard")).toBe(
      undefined,
    );
    expect(parsePuzzleShareParameters("?date=2026-08-21")).toBeUndefined();
    expect(
      parsePuzzleShareParameters("?date=2026-08-21&difficulty=expert"),
    ).toBeUndefined();
  });

  it("creates a spoiler-free link with only puzzle identity parameters", () => {
    expect(
      createPuzzleShareUrl(
        "2026-08-21",
        "hard",
        "https://example.com/daymark/?solution=secret#placements",
      ),
    ).toBe("https://example.com/daymark/?date=2026-08-21&difficulty=hard");
  });
});

describe("puzzle share summaries", () => {
  it("uses the plural move label when appropriate", () => {
    expect(createPuzzleShareSummary("August 21, 2026", "Hard", 17)).toBe(
      "Daymark — August 21, 2026\nHard · 17 moves",
    );
  });

  it("uses the singular move label for a one-move solve", () => {
    expect(createPuzzleShareSummary("August 21, 2026", "Easy", 1)).toBe(
      "Daymark — August 21, 2026\nEasy · 1 move",
    );
  });
});

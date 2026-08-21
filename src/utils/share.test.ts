import { describe, expect, it } from "vitest";
import {
  createPuzzleShareSummary,
  createPuzzleSolutionShareSummary,
  createPuzzleSolutionShareUrl,
  createPuzzleShareUrl,
  parsePuzzleShareParameters,
  parsePuzzleSolutionShareParameters,
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

  it("preserves a board variant without including solution data", () => {
    expect(
      createPuzzleShareUrl(
        "2026-08-21",
        "hard",
        "https://example.com/daymark/",
        "31-5",
      ),
    ).toBe(
      "https://example.com/daymark/?date=2026-08-21&difficulty=hard&board=31-5",
    );
    expect(
      parsePuzzleShareParameters("?date=2026-08-21&difficulty=hard&board=31-5"),
    ).toEqual({
      dateKey: "2026-08-21",
      difficulty: "hard",
      boardKey: "31-5",
    });
  });

  it("round-trips solution placements through a URL-safe fragment", () => {
    const placements = [
      {
        pieceId: "red",
        origin: { x: 2, y: 1 },
        orientationIndex: 3,
      },
    ];
    const url = createPuzzleSolutionShareUrl(
      "2026-08-21",
      "hard",
      "31-5",
      placements,
      "https://example.com/daymark/",
    );

    expect(url).toMatch(
      /^https:\/\/example\.com\/daymark\/\?date=2026-08-21&difficulty=hard&board=31-5#solution=/,
    );
    expect(url).not.toContain('"pieceId"');
    expect(url.length).toBeLessThan(300);
    const parsedUrl = new URL(url);
    expect(
      parsePuzzleSolutionShareParameters(parsedUrl.search, parsedUrl.hash),
    ).toEqual({
      dateKey: "2026-08-21",
      difficulty: "hard",
      boardKey: "31-5",
      placements,
    });
  });

  it("continues to read the original verbose solution format", () => {
    const placements = [
      {
        pieceId: "red",
        origin: { x: 2, y: 1 },
        orientationIndex: 3,
      },
    ];
    const encodedPayload = btoa(JSON.stringify({ version: 1, placements }))
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replace(/=+$/, "");
    const parsed = parsePuzzleSolutionShareParameters(
      "?date=2026-08-21&difficulty=hard&board=31-5",
      `#solution=${encodedPayload}`,
    );

    expect(parsed).toEqual({
      dateKey: "2026-08-21",
      difficulty: "hard",
      boardKey: "31-5",
      placements,
    });
  });

  it("rejects malformed solution payloads", () => {
    expect(
      parsePuzzleSolutionShareParameters(
        "?date=2026-08-21&difficulty=hard",
        "#solution=not-valid-base64",
      ),
    ).toBeUndefined();

    const emptySolutionUrl = new URL(
      createPuzzleSolutionShareUrl(
        "2026-08-21",
        "hard",
        "31-5",
        [],
        "https://example.com/daymark/",
      ),
    );
    expect(
      parsePuzzleSolutionShareParameters(
        emptySolutionUrl.search,
        emptySolutionUrl.hash,
      ),
    ).toBeUndefined();
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

  it("labels solution shares separately from result shares", () => {
    expect(createPuzzleSolutionShareSummary("August 21, 2026", "Hard")).toBe(
      "Daymark solution — August 21, 2026\nHard",
    );
  });
});

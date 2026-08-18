import { describe, expect, it } from "vitest";
import { dateFromInputValue, formatDateInputValue } from "./date";

describe("date input values", () => {
  it("parses a valid calendar date", () => {
    const date = dateFromInputValue("2026-08-18");
    expect(date && formatDateInputValue(date)).toBe("2026-08-18");
  });

  it("rejects dates that JavaScript would silently roll over", () => {
    expect(dateFromInputValue("2026-02-31")).toBeUndefined();
    expect(dateFromInputValue("not-a-date")).toBeUndefined();
  });
});

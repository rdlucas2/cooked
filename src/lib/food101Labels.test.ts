import { describe, it, expect } from "vitest";
import { FOOD_101_LABELS, getLabelQuery } from "./food101Labels";

describe("FOOD_101_LABELS", () => {
  it("contains exactly 101 entries", () => {
    expect(FOOD_101_LABELS).toHaveLength(101);
  });

  it("has no duplicate entries", () => {
    const unique = new Set(FOOD_101_LABELS);
    expect(unique.size).toBe(FOOD_101_LABELS.length);
  });
});

describe("getLabelQuery", () => {
  it("returns human-readable string for known label", () => {
    expect(getLabelQuery("french_fries")).toBe("french fries");
    expect(getLabelQuery("pad_thai")).toBe("pad thai");
    expect(getLabelQuery("eggs_benedict")).toBe("eggs benedict");
  });

  it("falls back to underscore→space replacement for unknown labels", () => {
    expect(getLabelQuery("unknown_dish_name")).toBe("unknown dish name");
  });

  it("returns a single word unchanged for unknown single-word labels", () => {
    expect(getLabelQuery("pizza")).toBe("pizza");
  });
});

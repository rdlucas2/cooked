import { describe, it, expect, beforeEach } from "vitest";
import {
  saveRecentScan,
  getRecentScans,
  saveFavorite,
  removeFavorite,
  getFavorites,
  isFavorite,
} from "./storage";

// localStorage is cleared in src/test/setup.ts afterEach

describe("recent scans", () => {
  it("returns empty array when nothing has been saved", () => {
    expect(getRecentScans()).toEqual([]);
  });

  it("saves a scan and retrieves it", () => {
    saveRecentScan("pizza");
    const recents = getRecentScans();
    expect(recents).toHaveLength(1);
    expect(recents[0].query).toBe("pizza");
  });

  it("most recent scan appears first", () => {
    saveRecentScan("pizza");
    saveRecentScan("sushi");
    const recents = getRecentScans();
    expect(recents[0].query).toBe("sushi");
    expect(recents[1].query).toBe("pizza");
  });

  it("deduplicates: re-saving an existing query moves it to the top", () => {
    saveRecentScan("pizza");
    saveRecentScan("sushi");
    saveRecentScan("pizza");
    const recents = getRecentScans();
    expect(recents[0].query).toBe("pizza");
    expect(recents).toHaveLength(2);
  });

  it("caps history at 10 entries", () => {
    for (let i = 1; i <= 12; i++) {
      saveRecentScan(`dish-${i}`);
    }
    expect(getRecentScans()).toHaveLength(10);
  });

  it("each scan entry has a numeric timestamp", () => {
    saveRecentScan("tacos");
    const [scan] = getRecentScans();
    expect(typeof scan.timestamp).toBe("number");
    expect(scan.timestamp).toBeGreaterThan(0);
  });
});

describe("favorites", () => {
  const base = {
    id: "meal-1",
    title: "Spaghetti Bolognese",
    source: "allrecipes" as const,
    thumbnail: "https://example.com/img.jpg",
  };

  it("returns empty array when no favorites saved", () => {
    expect(getFavorites()).toEqual([]);
  });

  it("isFavorite returns false for unsaved recipe", () => {
    expect(isFavorite("meal-1")).toBe(false);
  });

  it("saves a favorite and isFavorite returns true", () => {
    saveFavorite(base);
    expect(isFavorite("meal-1")).toBe(true);
  });

  it("saved favorite appears in getFavorites", () => {
    saveFavorite(base);
    const favs = getFavorites();
    expect(favs).toHaveLength(1);
    expect(favs[0].title).toBe("Spaghetti Bolognese");
  });

  it("does not duplicate when saving the same id twice", () => {
    saveFavorite(base);
    saveFavorite(base);
    expect(getFavorites()).toHaveLength(1);
  });

  it("removeFavorite removes the entry and isFavorite returns false", () => {
    saveFavorite(base);
    removeFavorite("meal-1");
    expect(isFavorite("meal-1")).toBe(false);
    expect(getFavorites()).toHaveLength(0);
  });

  it("removeFavorite is a no-op for unknown id", () => {
    saveFavorite(base);
    removeFavorite("does-not-exist");
    expect(getFavorites()).toHaveLength(1);
  });

  it("savedAt is set automatically and is a number", () => {
    saveFavorite(base);
    const [fav] = getFavorites();
    expect(typeof fav.savedAt).toBe("number");
    expect(fav.savedAt).toBeGreaterThan(0);
  });
});

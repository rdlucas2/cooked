import { describe, it, expect } from "vitest";
import { buildYouTubeSearchURL } from "./youtube";

describe("buildYouTubeSearchURL", () => {
  it("returns a youtube.com results URL", () => {
    const url = buildYouTubeSearchURL("pizza");
    expect(url).toMatch(/^https:\/\/www\.youtube\.com\/results/);
  });

  it("appends 'recipe' to the search query", () => {
    const url = buildYouTubeSearchURL("pizza");
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("pizza recipe");
  });

  it("URL-encodes spaces in multi-word queries", () => {
    const url = buildYouTubeSearchURL("pad thai");
    expect(url).toContain(encodeURIComponent("pad thai recipe"));
  });

  it("URL-encodes special characters", () => {
    const url = buildYouTubeSearchURL("crème brûlée");
    expect(url).not.toContain(" ");
    expect(decodeURIComponent(url)).toContain("crème brûlée recipe");
  });
});

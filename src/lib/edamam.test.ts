import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchEdamamRecipes } from "./edamam";

const fakeRecipe = {
  label: "Chicken Curry",
  image: "https://example.com/img.jpg",
  source: "AllRecipes",
  url: "https://allrecipes.com/chicken-curry",
  yield: 4,
  calories: 800,
  cuisineType: ["asian"],
  mealType: ["dinner"],
  dietLabels: ["Low-Fat"],
  healthLabels: ["Peanut-Free"],
  ingredientLines: ["1 lb chicken"],
};

function mockFetch(body: unknown, status = 200) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify(body), { status })
  );
}

afterEach(() => vi.restoreAllMocks());

describe("fetchEdamamRecipes", () => {
  it("calls the internal proxy endpoint with the encoded query", async () => {
    const spy = mockFetch({ hits: [{ recipe: fakeRecipe }], count: 1 });
    await fetchEdamamRecipes("chicken curry");
    expect(spy).toHaveBeenCalledOnce();
    const calledUrl = spy.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/api/recipes/edamam?q=");
    expect(decodeURIComponent(calledUrl)).toContain("chicken curry");
  });

  it("returns hits from a successful response", async () => {
    mockFetch({ hits: [{ recipe: fakeRecipe }], count: 1 });
    const result = await fetchEdamamRecipes("chicken");
    expect(result.hits).toHaveLength(1);
    expect(result.hits[0].recipe.label).toBe("Chicken Curry");
  });

  it("returns empty hits and count 0 on HTTP error", async () => {
    mockFetch({ error: "Unauthorized" }, 401);
    const result = await fetchEdamamRecipes("chicken");
    expect(result).toEqual({ hits: [], count: 0 });
  });

  it("returns empty hits and count 0 on network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("network error")
    );
    await expect(fetchEdamamRecipes("pizza")).resolves.toEqual({
      hits: [],
      count: 0,
    });
  });
});

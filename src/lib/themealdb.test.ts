import { describe, it, expect, vi, afterEach } from "vitest";
import { searchMeals } from "./themealdb";

// Minimal meal fixture for fetch responses
const fakeMeal = {
  idMeal: "52772",
  strMeal: "Teriyaki Chicken Casserole",
  strCategory: "Chicken",
  strArea: "Japanese",
  strInstructions: "Mix and bake.",
  strMealThumb: "https://example.com/thumb.jpg",
  strYoutube: "https://www.youtube.com/watch?v=123",
};

function mockFetch(body: unknown, status = 200) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(JSON.stringify(body), { status })
  );
}

afterEach(() => vi.restoreAllMocks());

describe("searchMeals", () => {
  it("calls the TheMealDB search endpoint with the encoded query", async () => {
    const spy = mockFetch({ meals: [fakeMeal] });
    await searchMeals("teriyaki chicken");
    expect(spy).toHaveBeenCalledOnce();
    const calledUrl = spy.mock.calls[0][0] as string;
    expect(calledUrl).toMatch(/themealdb\.com\/api\/json\/v1\/1\/search\.php\?s=/i);
    expect(decodeURIComponent(calledUrl)).toContain("teriyaki chicken");
  });

  it("returns the meals array on a successful response", async () => {
    mockFetch({ meals: [fakeMeal] });
    const result = await searchMeals("chicken");
    expect(result).toHaveLength(1);
    expect(result[0].strMeal).toBe("Teriyaki Chicken Casserole");
  });

  it("returns empty array when API responds with null meals (no match)", async () => {
    mockFetch({ meals: null });
    const result = await searchMeals("xyzzy");
    expect(result).toEqual([]);
  });

  it("returns empty array on HTTP error", async () => {
    mockFetch({ error: "Not Found" }, 404);
    const result = await searchMeals("anything");
    expect(result).toEqual([]);
  });

  it("returns empty array when fetch rejects (network failure)", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("network error")
    );
    await expect(searchMeals("pizza")).resolves.toEqual([]);
  });
});

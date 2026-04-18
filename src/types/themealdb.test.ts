import { describe, it, expect } from "vitest";
import { getMealIngredients } from "./themealdb";
import type { Meal } from "./themealdb";

function makeMeal(overrides: Partial<Meal> = {}): Meal {
  return {
    idMeal: "1",
    strMeal: "Test Meal",
    strCategory: "Test",
    strArea: "Test",
    strInstructions: "",
    strMealThumb: "",
    strYoutube: null,
    strIngredient1: null,
    strIngredient2: null,
    strIngredient3: null,
    strIngredient4: null,
    strIngredient5: null,
    strIngredient6: null,
    strIngredient7: null,
    strIngredient8: null,
    strIngredient9: null,
    strIngredient10: null,
    strMeasure1: null,
    strMeasure2: null,
    strMeasure3: null,
    strMeasure4: null,
    strMeasure5: null,
    strMeasure6: null,
    strMeasure7: null,
    strMeasure8: null,
    strMeasure9: null,
    strMeasure10: null,
    ...overrides,
  };
}

describe("getMealIngredients", () => {
  it("returns empty array when all ingredients are null", () => {
    expect(getMealIngredients(makeMeal())).toEqual([]);
  });

  it("returns populated ingredients with their measures", () => {
    const meal = makeMeal({
      strIngredient1: "Chicken",
      strMeasure1: "200g",
      strIngredient2: "Garlic",
      strMeasure2: "2 cloves",
    });
    expect(getMealIngredients(meal)).toEqual([
      { ingredient: "Chicken", measure: "200g" },
      { ingredient: "Garlic", measure: "2 cloves" },
    ]);
  });

  it("skips null ingredient slots", () => {
    const meal = makeMeal({
      strIngredient1: "Salt",
      strMeasure1: "1 tsp",
      strIngredient2: null,
      strMeasure2: null,
      strIngredient3: "Pepper",
      strMeasure3: "½ tsp",
    });
    const result = getMealIngredients(meal);
    expect(result).toHaveLength(2);
    expect(result[0].ingredient).toBe("Salt");
    expect(result[1].ingredient).toBe("Pepper");
  });

  it("skips whitespace-only ingredient slots", () => {
    const meal = makeMeal({
      strIngredient1: "  ",
      strMeasure1: "1 cup",
      strIngredient2: "Butter",
      strMeasure2: "50g",
    });
    const result = getMealIngredients(meal);
    expect(result).toHaveLength(1);
    expect(result[0].ingredient).toBe("Butter");
  });

  it("trims whitespace from ingredient and measure", () => {
    const meal = makeMeal({
      strIngredient1: "  Onion  ",
      strMeasure1: "  1 large  ",
    });
    const result = getMealIngredients(meal);
    expect(result[0]).toEqual({ ingredient: "Onion", measure: "1 large" });
  });

  it("uses empty string when measure is null for a present ingredient", () => {
    const meal = makeMeal({
      strIngredient1: "Water",
      strMeasure1: null,
    });
    const result = getMealIngredients(meal);
    expect(result[0]).toEqual({ ingredient: "Water", measure: "" });
  });
});

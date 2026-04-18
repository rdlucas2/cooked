import type { Meal, MealSearchResponse } from "@/types/themealdb";

const BASE = "https://www.themealdb.com/api/json/v1/1";

export async function searchMeals(query: string): Promise<Meal[]> {
  try {
    const res = await fetch(
      `${BASE}/search.php?s=${encodeURIComponent(query)}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data: MealSearchResponse = await res.json();
    return data.meals ?? [];
  } catch {
    return [];
  }
}

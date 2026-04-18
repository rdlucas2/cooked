import type { EdamamResponse } from "@/types/edamam";

export async function fetchEdamamRecipes(query: string): Promise<EdamamResponse> {
  try {
    const res = await fetch(
      `/api/recipes/edamam?q=${encodeURIComponent(query)}`
    );
    if (!res.ok) return { hits: [], count: 0 };
    return res.json();
  } catch {
    return { hits: [], count: 0 };
  }
}

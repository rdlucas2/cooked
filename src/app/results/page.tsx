"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MealDBCard from "@/components/MealDBCard";
import AllRecipesCard from "@/components/AllRecipesCard";
import YouTubeButton from "@/components/YouTubeButton";
import { searchMeals } from "@/lib/themealdb";
import { saveRecentScan } from "@/lib/storage";
import type { Meal } from "@/types/themealdb";
import type { ScrapedRecipe } from "@/types/allrecipes";

async function fetchAllRecipesFallback(query: string): Promise<ScrapedRecipe[]> {
  try {
    const res = await fetch(`/api/recipes/allrecipes?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function ResultsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get("q") ?? "";

  const [mealdbResults, setMealdbResults] = useState<Meal[]>([]);
  const [fallbackResults, setFallbackResults] = useState<ScrapedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFallback, setLoadingFallback] = useState(false);
  const [fallbackTriggered, setFallbackTriggered] = useState(false);
  const fetchedRef = useRef<string | null>(null);

  const triggerFallback = useCallback(async () => {
    if (fallbackTriggered || loadingFallback) return;
    setFallbackTriggered(true);
    setLoadingFallback(true);
    const fallback = await fetchAllRecipesFallback(query);
    setFallbackResults(fallback);
    setLoadingFallback(false);
  }, [query, fallbackTriggered, loadingFallback]);

  useEffect(() => {
    if (!query || fetchedRef.current === query) return;
    fetchedRef.current = query;
    setLoading(true);
    setFallbackResults([]);
    setFallbackTriggered(false);

    searchMeals(query).then(async (meals) => {
      setMealdbResults(meals);
      saveRecentScan(query);
      setLoading(false);

      // Auto-trigger fallback only when TheMealDB has nothing
      if (meals.length === 0) {
        setFallbackTriggered(true);
        setLoadingFallback(true);
        const fallback = await fetchAllRecipesFallback(query);
        setFallbackResults(fallback);
        setLoadingFallback(false);
      }
    });
  }, [query]);

  if (!query) {
    return (
      <div className="text-center text-slate-400 py-20">
        No search query.{" "}
        <button onClick={() => router.push("/scan")} className="text-orange-400 underline">
          Scan food
        </button>
      </div>
    );
  }

  const mealdbHasResults = !loading && mealdbResults.length > 0;
  const showFallbackSection = fallbackTriggered || (!loading && mealdbResults.length === 0);

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 px-4 py-10">
      <header className="flex w-full max-w-md items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 text-slate-400 hover:text-white"
          aria-label="Go back"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold truncate capitalize">{query}</h1>
          <p className="text-xs text-slate-400">recipe results</p>
        </div>
        <YouTubeButton query={query} label="YouTube" className="flex-shrink-0" />
      </header>

      {loading && (
        <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <span>Searching TheMealDB…</span>
        </div>
      )}

      {mealdbHasResults && (
        <section className="w-full max-w-md space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <span className="h-px flex-1 bg-slate-700" />
            TheMealDB
            <span className="h-px flex-1 bg-slate-700" />
          </h2>

          {mealdbResults.slice(0, 5).map((meal) => (
            <MealDBCard key={meal.idMeal} meal={meal} searchQuery={query} />
          ))}

          {/* Manual fallback trigger — user can dismiss TheMealDB results */}
          {!fallbackTriggered && (
            <button
              onClick={triggerFallback}
              className="w-full rounded-xl border border-slate-700 py-3 text-sm text-slate-400 hover:border-slate-500 hover:text-slate-300 transition"
            >
              None of these? Search AllRecipes →
            </button>
          )}
        </section>
      )}

      {showFallbackSection && (
        <section className="w-full max-w-md space-y-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            <span className="h-px flex-1 bg-slate-700" />
            {mealdbHasResults ? "AllRecipes" : "No TheMealDB results — AllRecipes"}
            <span className="h-px flex-1 bg-slate-700" />
          </h2>

          {loadingFallback && (
            <div className="flex items-center justify-center gap-3 py-8 text-slate-400">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
              <span>Searching AllRecipes…</span>
            </div>
          )}

          {!loadingFallback && fallbackResults.length > 0 &&
            fallbackResults.map((recipe, i) => (
              <AllRecipesCard
                key={`${recipe.url}-${i}`}
                recipe={recipe}
                searchQuery={query}
              />
            ))
          }

          {!loadingFallback && fallbackResults.length === 0 && (
            <div className="rounded-xl bg-slate-800 p-5 text-center space-y-3">
              <p className="text-sm text-slate-400">
                No recipes found for &ldquo;{query}&rdquo;
              </p>
              <YouTubeButton query={query} label="Search YouTube instead" />
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}

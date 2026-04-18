"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import MealDBCard from "@/components/MealDBCard";
import EdamamCard from "@/components/EdamamCard";
import YouTubeButton from "@/components/YouTubeButton";
import { searchMeals } from "@/lib/themealdb";
import { fetchEdamamRecipes } from "@/lib/edamam";
import { saveRecentScan } from "@/lib/storage";
import type { Meal } from "@/types/themealdb";
import type { EdamamHit } from "@/types/edamam";

function ResultsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const query = params.get("q") ?? "";

  const [mealdbResults, setMealdbResults] = useState<Meal[]>([]);
  const [edamamResults, setEdamamResults] = useState<EdamamHit[]>([]);
  const [loading, setLoading] = useState(true);
  const [edamamError, setEdamamError] = useState<string | null>(null);
  const fetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!query || fetchedRef.current === query) return;
    fetchedRef.current = query;
    setLoading(true);
    setEdamamError(null);

    Promise.all([
      searchMeals(query),
      fetchEdamamRecipes(query),
    ]).then(([meals, edamam]) => {
      setMealdbResults(meals);
      if ("error" in edamam) {
        setEdamamError((edamam as { error: string }).error);
      } else {
        setEdamamResults(edamam.hits ?? []);
      }
      saveRecentScan(query);
      setLoading(false);
    });
  }, [query]);

  if (!query) {
    return (
      <div className="text-center text-slate-400 py-20">
        No search query provided.{" "}
        <button onClick={() => router.push("/scan")} className="text-orange-400 underline">
          Scan food
        </button>
      </div>
    );
  }

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
          <span>Finding recipes…</span>
        </div>
      )}

      {!loading && (
        <div className="w-full max-w-md space-y-8">
          {/* TheMealDB section */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              <span className="h-px flex-1 bg-slate-700" />
              TheMealDB
              <span className="h-px flex-1 bg-slate-700" />
            </h2>
            {mealdbResults.length === 0 ? (
              <p className="rounded-xl bg-slate-800 p-5 text-center text-sm text-slate-400">
                No TheMealDB results for &ldquo;{query}&rdquo;
              </p>
            ) : (
              <div className="space-y-4">
                {mealdbResults.slice(0, 5).map((meal) => (
                  <MealDBCard key={meal.idMeal} meal={meal} searchQuery={query} />
                ))}
              </div>
            )}
          </section>

          {/* Edamam section */}
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
              <span className="h-px flex-1 bg-slate-700" />
              Edamam
              <span className="h-px flex-1 bg-slate-700" />
            </h2>
            {edamamError ? (
              <div className="rounded-xl bg-slate-800 p-5 text-center text-sm text-amber-400">
                {edamamError}
              </div>
            ) : edamamResults.length === 0 ? (
              <p className="rounded-xl bg-slate-800 p-5 text-center text-sm text-slate-400">
                No Edamam results for &ldquo;{query}&rdquo;
              </p>
            ) : (
              <div className="space-y-4">
                {edamamResults.slice(0, 5).map((hit, i) => (
                  <EdamamCard
                    key={`${hit.recipe.label}-${i}`}
                    recipe={hit.recipe}
                    searchQuery={query}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
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

"use client";

import { useState } from "react";
import type { Meal } from "@/types/themealdb";
import { getMealIngredients } from "@/types/themealdb";
import { buildYouTubeSearchURL } from "@/lib/youtube";
import YouTubeButton from "./YouTubeButton";
import { saveFavorite, removeFavorite, isFavorite } from "@/lib/storage";

interface Props {
  meal: Meal;
  searchQuery: string;
}

export default function MealDBCard({ meal, searchQuery }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [fav, setFav] = useState(() => isFavorite(meal.idMeal));

  function toggleFav() {
    if (fav) {
      removeFavorite(meal.idMeal);
    } else {
      saveFavorite({
        id: meal.idMeal,
        title: meal.strMeal,
        source: "themealdb",
        thumbnail: meal.strMealThumb,
      });
    }
    setFav(!fav);
  }

  const ytUrl = meal.strYoutube || buildYouTubeSearchURL(searchQuery);
  const ingredients = getMealIngredients(meal);

  return (
    <div className="rounded-2xl bg-slate-800 overflow-hidden">
      {meal.strMealThumb && (
        <img
          src={`${meal.strMealThumb}/preview`}
          alt={meal.strMeal}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-white leading-snug">{meal.strMeal}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {meal.strCategory}
              {meal.strArea ? ` · ${meal.strArea}` : ""}
            </p>
          </div>
          <button
            onClick={toggleFav}
            aria-label={fav ? "Remove from favorites" : "Save to favorites"}
            className="flex-shrink-0 text-orange-400 hover:text-orange-300"
          >
            <svg className="h-5 w-5" fill={fav ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <a
            href={ytUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 active:scale-95 transition"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Watch on YouTube
          </a>
          <button
            onClick={() => setExpanded(!expanded)}
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:border-slate-400 transition"
          >
            {expanded ? "Hide" : "Show"} recipe
          </button>
        </div>

        {expanded && (
          <div className="space-y-3 pt-1">
            {ingredients.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Ingredients</p>
                <ul className="text-sm text-slate-300 space-y-0.5">
                  {ingredients.map(({ ingredient, measure }) => (
                    <li key={ingredient} className="flex gap-2">
                      <span className="text-orange-400 flex-shrink-0">{measure}</span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Instructions</p>
              <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed line-clamp-10">
                {meal.strInstructions}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

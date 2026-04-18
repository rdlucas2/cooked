"use client";

import { useState } from "react";
import type { ScrapedRecipe } from "@/types/allrecipes";
import YouTubeButton from "./YouTubeButton";
import { saveFavorite, removeFavorite, isFavorite } from "@/lib/storage";

interface Props {
  recipe: ScrapedRecipe;
  searchQuery: string;
}

export default function AllRecipesCard({ recipe, searchQuery }: Props) {
  const id = `allrecipes-${encodeURIComponent(recipe.url)}`;
  const [fav, setFav] = useState(() => isFavorite(id));

  function toggleFav() {
    if (fav) {
      removeFavorite(id);
    } else {
      saveFavorite({
        id,
        title: recipe.title,
        source: "allrecipes",
        thumbnail: recipe.image,
        url: recipe.url,
      });
    }
    setFav(!fav);
  }

  return (
    <div className="rounded-2xl bg-slate-800 overflow-hidden">
      {recipe.image && (
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-white leading-snug">{recipe.title}</h3>
            {recipe.description && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                {recipe.description}
              </p>
            )}
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
            href={recipe.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:border-slate-400 transition"
          >
            Full recipe
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </a>
          <YouTubeButton query={searchQuery} />
        </div>
      </div>
    </div>
  );
}

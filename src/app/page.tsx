"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getRecentScans, getFavorites } from "@/lib/storage";
import type { RecentScan, FavoriteRecipe } from "@/lib/storage";

export default function HomePage() {
  const router = useRouter();
  const [recents, setRecents] = useState<RecentScan[]>([]);
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [tab, setTab] = useState<"recent" | "favorites">("recent");
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    setRecents(getRecentScans());
    setFavorites(getFavorites());
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-10 gap-8">
      {/* Hero */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-extrabold text-white">
          🍽️ Cooked
        </h1>
        <p className="text-slate-400 text-sm">
          Snap any food → get recipes instantly
        </p>
      </div>

      {/* CTA */}
      <Link
        href="/scan"
        className="w-full max-w-sm rounded-2xl bg-orange-500 px-6 py-5 text-center text-lg font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-400 active:scale-95"
      >
        📷 Scan Food
      </Link>

      {/* Manual search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value.trim();
          if (q) router.push(`/results?q=${encodeURIComponent(q)}`);
        }}
        className="w-full max-w-sm flex gap-2"
      >
        <input
          name="q"
          type="text"
          placeholder="Or type a dish name…"
          className="flex-1 rounded-xl bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none ring-1 ring-slate-700 focus:ring-orange-500"
        />
        <button
          type="submit"
          className="rounded-xl bg-slate-700 px-4 py-3 text-sm font-medium text-white hover:bg-slate-600 transition"
        >
          Search
        </button>
      </form>

      {/* Recent + Favorites tabs */}
      {(recents.length > 0 || favorites.length > 0) && (
        <div className="w-full max-w-sm space-y-3">
          <div className="flex rounded-xl bg-slate-800 p-1 gap-1">
            {(["recent", "favorites"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                  tab === t
                    ? "bg-slate-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {t === "recent" ? "Recent" : "Favorites"}
              </button>
            ))}
          </div>

          {tab === "recent" && recents.length > 0 && (
            <ul className="space-y-2">
              {recents.map((r) => (
                <li key={r.query}>
                  <Link
                    href={`/results?q=${encodeURIComponent(r.query)}`}
                    className="flex items-center justify-between rounded-xl bg-slate-800 px-4 py-3 hover:bg-slate-700 transition"
                  >
                    <span className="capitalize text-sm text-white">{r.query}</span>
                    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {tab === "favorites" && favorites.length > 0 && (
            <ul className="space-y-2">
              {favorites.map((f) => (
                <li key={f.id}>
                  <a
                    href={f.url ?? `/results?q=${encodeURIComponent(f.title)}`}
                    target={f.url ? "_blank" : undefined}
                    rel={f.url ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-3 rounded-xl bg-slate-800 px-4 py-3 hover:bg-slate-700 transition"
                  >
                    {f.thumbnail && (
                      <img
                        src={f.thumbnail}
                        alt={f.title}
                        className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{f.title}</p>
                      <p className="text-xs text-slate-400 capitalize">{f.source}</p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}

          {tab === "recent" && recents.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-4">No recent scans yet</p>
          )}
          {tab === "favorites" && favorites.length === 0 && (
            <p className="text-center text-sm text-slate-500 py-4">No saved favorites yet</p>
          )}
        </div>
      )}
    </main>
  );
}

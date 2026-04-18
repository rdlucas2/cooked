const RECENT_KEY = "cooked:recent";
const FAVORITES_KEY = "cooked:favorites";
const MAX_RECENT = 10;

export interface RecentScan {
  query: string;
  timestamp: number;
}

export interface FavoriteRecipe {
  id: string;
  title: string;
  source: "themealdb" | "allrecipes";
  thumbnail?: string;
  url?: string;
  savedAt: number;
}

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function saveRecentScan(query: string): void {
  const recent = safeGet<RecentScan[]>(RECENT_KEY, []);
  const filtered = recent.filter((r) => r.query !== query);
  filtered.unshift({ query, timestamp: Date.now() });
  safeSet(RECENT_KEY, filtered.slice(0, MAX_RECENT));
}

export function getRecentScans(): RecentScan[] {
  return safeGet<RecentScan[]>(RECENT_KEY, []);
}

export function saveFavorite(recipe: Omit<FavoriteRecipe, "savedAt">): void {
  const favs = safeGet<FavoriteRecipe[]>(FAVORITES_KEY, []);
  const exists = favs.some((f) => f.id === recipe.id);
  if (!exists) {
    favs.unshift({ ...recipe, savedAt: Date.now() });
    safeSet(FAVORITES_KEY, favs);
  }
}

export function removeFavorite(id: string): void {
  const favs = safeGet<FavoriteRecipe[]>(FAVORITES_KEY, []).filter(
    (f) => f.id !== id
  );
  safeSet(FAVORITES_KEY, favs);
}

export function getFavorites(): FavoriteRecipe[] {
  return safeGet<FavoriteRecipe[]>(FAVORITES_KEY, []);
}

export function isFavorite(id: string): boolean {
  return safeGet<FavoriteRecipe[]>(FAVORITES_KEY, []).some((f) => f.id === id);
}

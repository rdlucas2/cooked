import * as cheerio from "cheerio";
import type { ScrapedRecipe } from "@/types/allrecipes";

const ALLRECIPES_BASE = "https://www.allrecipes.com";
const MAX_RESULTS = 5;

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
};

function absoluteUrl(href: string): string {
  if (href.startsWith("http")) return href;
  return `${ALLRECIPES_BASE}${href.startsWith("/") ? "" : "/"}${href}`;
}

function parseJsonLd(html: string): ScrapedRecipe[] | null {
  const $ = cheerio.load(html);
  const results: ScrapedRecipe[] = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html() ?? "");
      // ItemList containing Recipe items
      if (data["@type"] === "ItemList" && Array.isArray(data.itemListElement)) {
        for (const entry of data.itemListElement) {
          const recipe = entry.item ?? entry;
          if (recipe["@type"] !== "Recipe") continue;
          results.push({
            title: recipe.name,
            url: absoluteUrl(recipe.url ?? entry.url ?? ""),
            image: typeof recipe.image === "string"
              ? recipe.image
              : recipe.image?.url,
            description: recipe.description,
          });
        }
      }
      // Single Recipe block
      if (data["@type"] === "Recipe") {
        results.push({
          title: data.name,
          url: absoluteUrl(data.url ?? ""),
          image: typeof data.image === "string" ? data.image : data.image?.url,
          description: data.description,
        });
      }
    } catch {
      // malformed JSON-LD — skip
    }
  });

  return results.length > 0 ? results : null;
}

function parseFallbackLinks(html: string): ScrapedRecipe[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const results: ScrapedRecipe[] = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    if (!href.includes("/recipe/")) return;
    const url = absoluteUrl(href);
    if (seen.has(url)) return;
    seen.add(url);
    const title = $(el).text().trim() || url;
    results.push({ title, url });
  });

  return results;
}

export async function scrapeAllRecipes(query: string): Promise<ScrapedRecipe[]> {
  try {
    const url = `${ALLRECIPES_BASE}/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return [];
    const html = await res.text();
    const results = parseJsonLd(html) ?? parseFallbackLinks(html);
    return results.slice(0, MAX_RESULTS);
  } catch {
    return [];
  }
}

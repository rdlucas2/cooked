import { describe, it, expect, vi, afterEach } from "vitest";
import { scrapeAllRecipes } from "./allrecipes";

afterEach(() => vi.restoreAllMocks());

// ─── HTML fixtures ────────────────────────────────────────────────────────────

const JSON_LD_ITEM_LIST = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      url: "https://www.allrecipes.com/recipe/11691/best-pizza-dough-ever/",
      item: {
        "@type": "Recipe",
        name: "Best Pizza Dough Ever",
        image: "https://images.allrecipes.com/pizza.jpg",
        description: "A classic pizza dough recipe.",
        url: "https://www.allrecipes.com/recipe/11691/best-pizza-dough-ever/",
      },
    },
    {
      "@type": "ListItem",
      position: 2,
      url: "https://www.allrecipes.com/recipe/23891/worlds-best-pizza-sauce/",
      item: {
        "@type": "Recipe",
        name: "World's Best Pizza Sauce",
        image: "https://images.allrecipes.com/sauce.jpg",
        description: "Tangy and rich.",
        url: "https://www.allrecipes.com/recipe/23891/worlds-best-pizza-sauce/",
      },
    },
  ],
});

function makeHtmlWithJsonLd(jsonLd: string) {
  return `<!DOCTYPE html><html><head>
    <script type="application/ld+json">${jsonLd}</script>
  </head><body><main>Search results</main></body></html>`;
}

// Fallback: no JSON-LD, just recipe anchor tags in the HTML
function makeHtmlWithLinks() {
  return `<!DOCTYPE html><html><body>
    <a href="/recipe/11691/pizza-dough/">Pizza Dough</a>
    <a href="/recipe/22345/chicken-parm/">Chicken Parmigiana</a>
    <a href="/contact">Contact</a>
    <a href="/recipe/99999/garlic-bread/">Garlic Bread</a>
  </body></html>`;
}

function mockFetch(html: string, status = 200) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
    new Response(html, { status, headers: { "content-type": "text/html" } })
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("scrapeAllRecipes", () => {
  it("requests the AllRecipes search URL with the encoded query", async () => {
    const spy = mockFetch(makeHtmlWithJsonLd(JSON_LD_ITEM_LIST));
    await scrapeAllRecipes("pizza");
    const url = spy.mock.calls[0][0] as string;
    expect(url).toMatch(/allrecipes\.com\/search/);
    expect(decodeURIComponent(url)).toContain("pizza");
  });

  it("extracts recipes from JSON-LD ItemList", async () => {
    mockFetch(makeHtmlWithJsonLd(JSON_LD_ITEM_LIST));
    const results = await scrapeAllRecipes("pizza");
    expect(results).toHaveLength(2);
    expect(results[0].title).toBe("Best Pizza Dough Ever");
    expect(results[0].url).toBe(
      "https://www.allrecipes.com/recipe/11691/best-pizza-dough-ever/"
    );
    expect(results[0].image).toBe("https://images.allrecipes.com/pizza.jpg");
    expect(results[0].description).toBe("A classic pizza dough recipe.");
  });

  it("falls back to parsing recipe href links when no JSON-LD is present", async () => {
    mockFetch(makeHtmlWithLinks());
    const results = await scrapeAllRecipes("pizza");
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results.every((r) => r.url.includes("/recipe/"))).toBe(true);
    // non-recipe links (/contact) must be filtered out
    expect(results.some((r) => r.url.includes("/contact"))).toBe(false);
  });

  it("absolutises relative URLs in the fallback path", async () => {
    mockFetch(makeHtmlWithLinks());
    const results = await scrapeAllRecipes("pizza");
    expect(results.every((r) => r.url.startsWith("https://"))).toBe(true);
  });

  it("returns empty array on HTTP error", async () => {
    mockFetch("", 503);
    await expect(scrapeAllRecipes("pizza")).resolves.toEqual([]);
  });

  it("returns empty array on network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("offline"));
    await expect(scrapeAllRecipes("pizza")).resolves.toEqual([]);
  });

  it("caps results at 5", async () => {
    const manyItems = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: Array.from({ length: 10 }, (_, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://www.allrecipes.com/recipe/${i}/dish-${i}/`,
        item: {
          "@type": "Recipe",
          name: `Dish ${i}`,
          url: `https://www.allrecipes.com/recipe/${i}/dish-${i}/`,
        },
      })),
    };
    mockFetch(makeHtmlWithJsonLd(JSON.stringify(manyItems)));
    const results = await scrapeAllRecipes("food");
    expect(results).toHaveLength(5);
  });
});

import { NextRequest, NextResponse } from "next/server";
import { scrapeAllRecipes } from "@/lib/allrecipes";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query) return NextResponse.json([]);
  const results = await scrapeAllRecipes(query);
  return NextResponse.json(results);
}

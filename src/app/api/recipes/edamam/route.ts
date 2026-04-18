import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query) {
    return NextResponse.json({ hits: [], count: 0 });
  }

  const appId = process.env.EDAMAM_APP_ID;
  const appKey = process.env.EDAMAM_APP_KEY;

  if (!appId || !appKey) {
    return NextResponse.json(
      { error: "Edamam API credentials not configured. See .env.example." },
      { status: 503 }
    );
  }

  const url = new URL("https://api.edamam.com/api/recipes/v2");
  url.searchParams.set("type", "public");
  url.searchParams.set("q", query);
  url.searchParams.set("app_id", appId);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("field", "label");
  url.searchParams.set("field", "image");
  url.searchParams.set("field", "source");
  url.searchParams.set("field", "url");
  url.searchParams.set("field", "yield");
  url.searchParams.set("field", "calories");
  url.searchParams.set("field", "cuisineType");
  url.searchParams.set("field", "mealType");
  url.searchParams.set("field", "dietLabels");
  url.searchParams.set("field", "healthLabels");
  url.searchParams.set("field", "ingredientLines");

  const res = await fetch(url.toString(), {
    headers: { "Edamam-Account-User": appId },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: `Edamam error: ${res.status}`, detail: text },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}

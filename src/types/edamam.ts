export interface EdamamRecipe {
  label: string;
  image: string;
  source: string;
  url: string;
  yield: number;
  calories: number;
  cuisineType: string[];
  mealType: string[];
  dietLabels: string[];
  healthLabels: string[];
  ingredientLines: string[];
}

export interface EdamamHit {
  recipe: EdamamRecipe;
}

export interface EdamamResponse {
  hits: EdamamHit[];
  count: number;
}

import assert from "node:assert/strict";
import {
  normalizeSearchText,
  parseSearchIntent,
  prepareSearchQuery,
  searchCocktailDocuments,
  searchMixIngredients,
  searchOmnibarIngredients,
  searchLearnItems,
  type CocktailSearchDocument,
} from "./index";
import type { MixIngredient } from "@/lib/mixTypes";

function doc(
  name: string,
  extras: Partial<CocktailSearchDocument> = {}
): CocktailSearchDocument {
  return {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    ...extras,
  };
}

const catalog = [
  doc("Margarita", {
    primarySpirit: "tequila",
    ingredientNames: ["Tequila", "Lime Juice", "Triple Sec"],
    categories: ["sour", "classic"],
  }),
  doc("Negroni", {
    primarySpirit: "gin",
    ingredientNames: ["Gin", "Campari", "Sweet Vermouth"],
    tags: ["bitter", "classic"],
    categories: ["classic"],
  }),
  doc("Whiskey Sour", {
    primarySpirit: "whiskey",
    ingredientNames: ["Whiskey", "Lemon Juice", "Simple Syrup"],
    categories: ["sour"],
  }),
  doc("Daiquiri", {
    primarySpirit: "rum",
    ingredientNames: ["White Rum", "Lime Juice", "Simple Syrup"],
    categories: ["sour"],
  }),
  doc("Espresso Martini", {
    primarySpirit: "vodka",
    ingredientNames: ["Vodka", "Coffee Liqueur", "Espresso"],
  }),
  doc("Gin and Tonic", {
    primarySpirit: "gin",
    ingredientNames: ["Gin", "Tonic Water"],
    categories: ["refreshing"],
  }),
  doc("Old Fashioned", {
    primarySpirit: "whiskey",
    ingredientNames: ["Bourbon", "Angostura Bitters", "Sugar"],
  }),
  doc("Curaçao Cooler", {
    primarySpirit: "rum",
    ingredientNames: ["Rum", "Blue Curaçao", "Lemon Juice"],
  }),
];

// Normalization
assert.equal(normalizeSearchText("Curaçao"), "curacao");
assert.equal(normalizeSearchText("Bailey's"), "baileys");

// Synonym / misspelling expansion
{
  const prepared = prepareSearchQuery("magarita");
  assert.ok(prepared.tokens.includes("margarita"));
}
{
  const prepared = prepareSearchQuery("whisky");
  assert.ok(prepared.expandedTokens[0].includes("whiskey"));
}

// Exact name ranks first
{
  const hits = searchCocktailDocuments(catalog, "Negroni");
  assert.equal(hits[0]?.item.name, "Negroni");
}

// Typo tolerance
{
  const hits = searchCocktailDocuments(catalog, "magarita");
  assert.equal(hits[0]?.item.name, "Margarita");
}
{
  const hits = searchCocktailDocuments(catalog, "negronni");
  assert.equal(hits[0]?.item.name, "Negroni");
}
{
  const hits = searchCocktailDocuments(catalog, "daquiri");
  assert.equal(hits[0]?.item.name, "Daiquiri");
}

// Synonyms
{
  const intent = parseSearchIntent("whisky sour");
  const hits = searchCocktailDocuments(catalog, "whisky sour", { intent });
  assert.ok(hits.some((h) => h.item.name === "Whiskey Sour"));
}
{
  const hits = searchCocktailDocuments(catalog, "curacao");
  assert.ok(hits.some((h) => h.item.name === "Curaçao Cooler"));
}

// Token AND
{
  const hits = searchCocktailDocuments(catalog, "gin sour");
  assert.ok(!hits.some((h) => h.item.name === "Gin and Tonic"));
  assert.ok(!hits.some((h) => h.item.name === "Margarita"));
}

// Ingredient intent
{
  const hits = searchCocktailDocuments(catalog, "campari");
  assert.equal(hits[0]?.item.name, "Negroni");
}

// Glued misspelling
{
  const hits = searchCocktailDocuments(catalog, "oldfashioned");
  assert.equal(hits[0]?.item.name, "Old Fashioned");
}
{
  const hits = searchCocktailDocuments(catalog, "expressomartini");
  assert.equal(hits[0]?.item.name, "Espresso Martini");
}

// Intent parsing
{
  const intent = parseSearchIntent("gin cocktails");
  assert.equal(intent.spirit, "gin");
  assert.equal(intent.chipHref, "/cocktails?spirit=gin");
  const hits = searchCocktailDocuments(catalog, "gin cocktails", { intent });
  assert.ok(hits.every((h) => h.item.primarySpirit === "gin"));
  assert.ok(hits.some((h) => h.item.name === "Negroni"));
  assert.ok(!hits.some((h) => h.item.name === "Margarita"));
}
{
  const intent = parseSearchIntent("drinks with campari");
  assert.equal(intent.ingredient, "campari");
  const hits = searchCocktailDocuments(catalog, "drinks with campari", { intent });
  assert.equal(hits[0]?.item.name, "Negroni");
}
{
  const intent = parseSearchIntent("how to shake");
  assert.equal(intent.preferLearn, true);
  assert.ok(intent.chipHref?.includes("/learn"));
}
{
  const intent = parseSearchIntent("something sour");
  assert.equal(intent.category, "sour");
  const hits = searchCocktailDocuments(catalog, "something sour", { intent });
  assert.ok(hits.every((h) => h.item.categories?.includes("sour")));
}

// Mix ingredients
{
  const ingredients: MixIngredient[] = [
    { id: "1", name: "Blue Curaçao", category: "liqueur" },
    { id: "2", name: "Gin", category: "spirit" },
    { id: "3", name: "Ginger Beer", category: "mixer" },
  ];
  const hits = searchMixIngredients(ingredients, "curacao");
  assert.equal(hits[0]?.name, "Blue Curaçao");
  const ginHits = searchMixIngredients(ingredients, "gin");
  assert.ok(ginHits.some((i) => i.name === "Gin"));
  // "gin" should not preferentially return only ginger via substring — ranked exact wins
  assert.equal(ginHits[0]?.name, "Gin");
}

// Omnibar ingredients + learn
{
  const ingredients = searchOmnibarIngredients("campari", { limit: 5 });
  assert.ok(ingredients.length > 0);
  assert.ok(ingredients.some((i) => /campari/i.test(i.name) || i.slug.includes("campari")));
}
{
  const learn = searchLearnItems("how to shake", { limit: 5 });
  assert.ok(learn.length > 0);
  assert.ok(learn.some((item) => /shake/i.test(item.title) || item.href.includes("shake")));
}

console.log("searchCocktails.test.ts: all assertions passed");

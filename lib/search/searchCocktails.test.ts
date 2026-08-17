import assert from "node:assert/strict";
import {
  normalizeSearchText,
  prepareSearchQuery,
  searchCocktailDocuments,
  type CocktailSearchDocument,
} from "./index";

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
  }),
  doc("Whiskey Sour", {
    primarySpirit: "whiskey",
    ingredientNames: ["Whiskey", "Lemon Juice", "Simple Syrup"],
    categories: ["sour"],
  }),
  doc("Daiquiri", {
    primarySpirit: "rum",
    ingredientNames: ["White Rum", "Lime Juice", "Simple Syrup"],
  }),
  doc("Espresso Martini", {
    primarySpirit: "vodka",
    ingredientNames: ["Vodka", "Coffee Liqueur", "Espresso"],
  }),
  doc("Gin and Tonic", {
    primarySpirit: "gin",
    ingredientNames: ["Gin", "Tonic Water"],
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
  const hits = searchCocktailDocuments(catalog, "whisky sour");
  assert.ok(hits.some((h) => h.item.name === "Whiskey Sour"));
}
{
  const hits = searchCocktailDocuments(catalog, "curacao");
  assert.ok(hits.some((h) => h.item.name === "Curaçao Cooler"));
}

// Token AND: both tokens must match
{
  const hits = searchCocktailDocuments(catalog, "gin sour");
  assert.ok(!hits.some((h) => h.item.name === "Gin and Tonic"));
  // Negroni is gin but not sour category/name — may or may not match via tags
  // Margarita is sour but tequila — should not match gin
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

console.log("searchCocktails.test.ts: all assertions passed");

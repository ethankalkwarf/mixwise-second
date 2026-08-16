import assert from "node:assert/strict";
import {
  extractIngredientName,
  findWholePhraseIndex,
  lookupIngredient,
  matchIngredientName,
  nameHasToken,
} from "./ingredientMatching";

type IngredientData = { id: string; name: string; type?: string };

function catalog(names: string[]): Map<string, IngredientData> {
  const map = new Map<string, IngredientData>();
  for (const name of names) {
    map.set(name.toLowerCase(), { id: name.toLowerCase().replace(/\s+/g, "-"), name });
  }
  return map;
}

const db = catalog([
  "Gin",
  "Ginger ale",
  "Ginger beer",
  "Rum",
  "Dark rum",
  "Lemon juice",
  "Orange juice",
  "Orange bitters",
  "Angostura bitters",
  "Coffee liqueur",
]);

assert.equal(extractIngredientName("4 oz ginger ale"), "ginger ale");
assert.equal(extractIngredientName("2 dashes Angostura bitters optional"), "Angostura bitters");
assert.equal(extractIngredientName("0.75 oz simple syrup"), "simple syrup");
assert.equal(extractIngredientName("1.5 oz vodka"), "vodka");
assert.equal(extractIngredientName("0.5 oz fresh lime juice"), "fresh lime juice");
assert.equal(extractIngredientName("1/2 oz lime juice"), "lime juice");
assert.equal(extractIngredientName("1 1/2 oz gin"), "gin");
assert.equal(extractIngredientName("optional salt rim"), "salt rim");
assert.equal(matchIngredientName("ginger ale", db)?.name, "Ginger ale");
assert.notEqual(matchIngredientName("ginger ale", db)?.name, "Gin");
assert.equal(matchIngredientName("ginger beer", db)?.name, "Ginger beer");
assert.equal(matchIngredientName("gin", db)?.name, "Gin");
assert.equal(matchIngredientName("dark rum", db)?.name, "Dark rum");
assert.equal(matchIngredientName("fresh lemon juice", db)?.name, "Lemon juice");
assert.equal(matchIngredientName("orange bitters", db)?.name, "Orange bitters");
assert.notEqual(matchIngredientName("orange bitters", db)?.name, "Orange juice");
assert.equal(matchIngredientName("coffee liqueur", db)?.name, "Coffee liqueur");
assert.equal(matchIngredientName("mint leaves", catalog(["Mint"]))?.name, "Mint");
assert.equal(matchIngredientName("Scotch whisky", catalog(["Scotch"]))?.name, "Scotch");
assert.equal(matchIngredientName("Bénédictine", catalog(["Benedictine"]))?.name, "Benedictine");

const withoutGingerAle = catalog(["Gin", "Ginger beer", "Ale"]);
assert.equal(matchIngredientName("ginger ale", withoutGingerAle), null);

assert.equal(findWholePhraseIndex("4 oz ginger ale", "gin"), -1);
assert.ok(findWholePhraseIndex("4 oz ginger ale", "ginger ale") >= 0);
assert.equal(findWholePhraseIndex("4 oz gin", "gin") >= 0, true);

assert.equal(nameHasToken("Ginger ale", "gin"), false);
assert.equal(nameHasToken("Gin", "gin"), true);
assert.equal(nameHasToken("Ginger beer", "gin"), false);

const list = [
  { id: "1", name: "Gin" },
  { id: "2", name: "Ginger ale" },
  { id: "3", name: "Lime juice" },
];
assert.equal(lookupIngredient("Gin", list)?.id, "1");
assert.equal(lookupIngredient("Lime Juice", list)?.id, "3");
assert.notEqual(lookupIngredient("Gin", list)?.name, "Ginger ale");

console.log("ingredientMatching tests passed");

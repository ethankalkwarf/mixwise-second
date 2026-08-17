import assert from "node:assert/strict";
import { getMixMatchGroups } from "./mixMatching";
import type { MixCocktail } from "./mixTypes";

function cocktail(
  name: string,
  ingredients: Array<{ id: string; name: string; isOptional?: boolean }>
): MixCocktail {
  return {
    id: name.toLowerCase().replace(/\s+/g, "-"),
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    ingredients,
  };
}

const margarita = cocktail("Margarita", [
  { id: "tequila", name: "Tequila" },
  { id: "lime", name: "Lime Juice" },
  { id: "triple-sec", name: "Triple Sec" },
  { id: "unknown", name: "Lime wheel" },
]);

const { ready, almostThere } = getMixMatchGroups({
  cocktails: [margarita],
  ownedIngredientIds: ["tequila", "lime", "triple-sec"],
  stapleIngredientIds: ["ice"],
});

assert.equal(ready.length, 1, "unknown garnish must not block ready");
assert.equal(ready[0]?.cocktail.name, "Margarita");
assert.equal(almostThere.length, 0);

const missingOne = getMixMatchGroups({
  cocktails: [margarita],
  ownedIngredientIds: ["tequila", "lime"],
  stapleIngredientIds: ["ice"],
});
assert.equal(missingOne.ready.length, 0);
assert.equal(missingOne.almostThere.length, 1);
assert.deepEqual(missingOne.almostThere[0]?.missingIngredientNames, ["Triple Sec"]);

const skipped = getMixMatchGroups({
  cocktails: [margarita],
  ownedIngredientIds: ["tequila", "lime", "triple-sec"],
  stapleIngredientIds: ["ice"],
  excludeCocktailIds: [margarita.id],
});
assert.equal(skipped.ready.length, 0);
assert.equal(skipped.almostThere.length, 0);

console.log("mixMatching tests passed");

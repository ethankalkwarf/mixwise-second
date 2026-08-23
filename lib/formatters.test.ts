import assert from "node:assert/strict";
import { formatCocktailName, formatIngredientName } from "./formatters";

assert.equal(formatCocktailName("gin and tonic"), "Gin and Tonic");
assert.equal(formatCocktailName("the last word"), "The Last Word");

assert.equal(formatIngredientName("ruby port"), "Ruby Port");
assert.equal(formatIngredientName("Sugar"), "Sugar");
assert.equal(formatIngredientName("Orange Peel"), "Orange Peel");
assert.equal(formatIngredientName("cloves"), "Cloves");
assert.equal(formatIngredientName("pinch cinnamon"), "Pinch Cinnamon");
assert.equal(formatIngredientName("creme de cacao"), "Creme de Cacao");
assert.equal(formatIngredientName("Club soda"), "Club Soda");
assert.equal(formatIngredientName("IPA"), "IPA");

console.log("formatters.test.ts: ok");

import DatabaseConnection from "./common/src/Interface/databaseConnection";
import DBMuck from "./DBMuck";
import RecipeManager from "./RecipeManager";
import InventoryManager from "./InventoryManager";
import Recipe from "./common/src/Modules/Recipe";

class Controller implements DatabaseConnection {
  private recipeManager;
  private inventoryManager;
  DbMuck;

  constructor() {
    this.DbMuck = DBMuck;
    this.recipeManager = RecipeManager.getInstance();
    this.inventoryManager = InventoryManager.getInstance()
  }
  //#region Database
  connectToDatabase() {
    return this.recipeManager.connectToDatabase() && this.inventoryManager.connectToDatabase()
  }

  fetchData() {
    this.recipeManager.fetchData();
    this.inventoryManager.fetchData();
  }

  updateDatabase() {
    return this.recipeManager.updateDatabase() && this.inventoryManager.updateDatabase();
  }
  //#endregion Database

  //#region inventory
  addIngredient(name: string, category: string, remaining: number, minRequired: number = 0, alcoholPercentage: number = 0) {
    return this.inventoryManager.addIngredient(name, category, remaining, minRequired, alcoholPercentage)
  }

  getIngredient(name: string) {
    return this.inventoryManager.getIngredient(name);
  }

  updateIngredient(ingredientName: string, ingredientParam: string, newValue: any) {
    return this.inventoryManager.updateIngredient(ingredientName, ingredientParam, newValue);
  }

  deleteIngredient(name: string) {
    return this.inventoryManager.deleteIngredient(name)
  }

  ingredientsToJson() {
    return this.inventoryManager.toJson();
  }

  filterIngredientsByCategory(targetCategory: string) {
    return this.inventoryManager.filterByCategory(targetCategory);
  }
  //#endregion inventory

  //#region Recipes
  addRecipe(name: string, ingredients: [number, string][], method: string[], portion: number) {
    return this.recipeManager.addRecipe(name, ingredients, method, portion);
  }

  getRecipe(name: string) {
    return this.recipeManager.getRecipe(name)
  }

  updateRecipe(recipeName: string, recipeParam: string, newValue: any) {
    return this.recipeManager.updateRecipe(recipeName, recipeParam, newValue)
  }

  deleteRecipe(name: string) {
    return this.recipeManager.deleteRecipe(name)
  }

  makeCocktail(name: string) {
    return this.recipeManager.MakeCocktailByName(name);
  }

  checkRecipeAvailability(param: Recipe | string) {
    return this.recipeManager.checkRecipeAvailability(param);
  }
  //#endregion Recipes
}

export default Controller;

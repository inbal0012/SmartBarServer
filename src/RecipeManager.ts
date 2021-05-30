import EInventoryCategory from './common/src/Enums/EInventoryCategory';
import DatabaseConnection from './common/src/Interface/databaseConnection';
import AbstractInventoryItem from './common/src/Modules/InventoryItemModules/AbstractInventoryItem';
import InventoryItem from './common/src/Modules/InventoryItemModules/InventoryItem';
import Recipe, { NullRecipe } from './common/src/Modules/Recipe';
import DBMuck from './DBMuck';

class RecipeManager implements DatabaseConnection {
  private static instance: RecipeManager;
  recipeList: Recipe[];
  isDBRecipeUpdateRequired: boolean;

  private constructor() {
    this.recipeList = [];
    this.isDBRecipeUpdateRequired = false;
    RecipeManager.instance = this;
  }

  public static getInstance(): RecipeManager {
    if (!RecipeManager.instance) {
      RecipeManager.instance = new RecipeManager();
    }

    return RecipeManager.instance;
  }

  //#region Database
  connectToDatabase() {
    // TODO
    return true
  }

  fetchData() {
    this.recipeList = DBMuck.getInstance().recipeList;
  }

  updateDatabase() {
    // TODO
    return true
  }
  //#endregion database
  //#region CRUD
  addRecipe(name: string, ingredients: [number, string][], method: string[], portion: number) {
    if (this.recipeList.find((rcp) => rcp.name === name))
      return { success: false, reason: name + ' already exist' };
    var newIngredients = this.extractIngredients(ingredients);
    this.recipeList.push(new Recipe(name, newIngredients, method, portion));
    this.isDBRecipeUpdateRequired = true;
    return { success: true, reason: name + ' was added successfully' };
  }

  getRecipe(name: string) {
    var result = this.recipeList.find((recipe) => recipe.name === name);
    if (result === undefined) {
      return new NullRecipe();
    } else return result;
  }

  updateRecipe(recipeName: string, recipeParam: string, newValue: any) {
    var recipe = this.recipeList.find(
      (item) => item.name === recipeName
    );
    if (recipe === undefined)
      return { success: false, reason: recipeName + " doesn't exist" };
    switch (recipeParam) {
      case 'name':
        return { success: false, reason: "You can't change the name" };
      case 'ingredients':
        //TODO 
        break;
      case 'method':
        //TODO 
        break;
      case "portion":
        //TODO
        break;
      case "isAvailable":
      case "Availability":
        recipe.checkAvailability();
        break;
      default:
        return {
          success: false,
          reason:
            recipeName + " doesn't have a " + recipeParam + ' parameter',
        };
    }
  }
  
  deleteRecipe(name: string) {
    this.recipeList.forEach((item, index) => {
      if (item.name === name) this.recipeList.splice(index, 1);
    });
  }
  //#endregion CRUD

  toJson() {
    return this.recipeList.map(rcp => rcp.toJson())
  }

  extractIngredients(ingredients: [number, string][]) {
    var newIngredients: [number, AbstractInventoryItem][] = [];
    ingredients.forEach((element) => {
      var item = DBMuck.getInstance().getIngredientByName(element[1]);
      if (item.getName() !== 'Unavailable') {
        newIngredients.push([element[0], item]);
      } else {
        var newItem = new InventoryItem(
          element[1],
          EInventoryCategory.Unsorted,
          0,
          0
        );
        DBMuck.getInstance().addItem(newItem);
        newIngredients.push([element[0], newItem]);
      }
    });
    return newIngredients;
  }

  MakeCocktailByName(name: string) {
    console.log('make cocktail ' + name);
    var recipe = this.recipeList.find((recipe) => recipe.name === name);
    if (recipe !== undefined) return this.MakeCocktail(recipe);
    else
      return {
        success: false,
        reason: name + ' not found',
      };
  }

  MakeCocktail(recipe: Recipe) {
    var result = recipe.checkAvailability();
    if (!result.success) {
      return {
        success: false,
        reason: 'Unable to make the ' + recipe.name + ' cocktail. ' + result.reason,
      };
    }
    recipe.ingredients.forEach((element) => {
      element[1].use(element[0]);
    });
    return {
      success: true,
      reason: 'Enjoy your ' + recipe.name + ' cocktail',
    };
  }

  checkRecipeAvailability(param: Recipe | string) {
    if (typeof (param) === 'string') {

      var recipe = this.recipeList.find((rcp) => rcp.name === param);
      if (recipe !== undefined)
        param = recipe;
      else
        return {
          success: false,
          reason: param + ' not found',
        };
    }
    if (param instanceof Recipe) {
      var result = param.checkAvailability();
      var unavailableStr = 'Unable to make the ' + param.name + ' cocktail ' + result.reason

      return {
        success: result.success,
        reason: result.success ? param.name + " is availabile" : unavailableStr
      };

    }
    return {
      success: false,
      reason: param + "not found"
    };
  }
}

export default RecipeManager;

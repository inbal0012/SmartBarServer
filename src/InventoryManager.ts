import EInventoryCategory from "./common/src/Enums/EInventoryCategory";
import DatabaseConnection from "./common/src/Interface/databaseConnection";
import AbstractInventoryItem from "./common/src/Modules/InventoryItemModules/AbstractInventoryItem";
import BinaryInventoryItem from "./common/src/Modules/InventoryItemModules/BinaryInventoryItem";
import BottleBuilder, { Bottle } from "./common/src/Modules/InventoryItemModules/Bottle";
import FruitVegetable from "./common/src/Modules/InventoryItemModules/FruitVegetable";
import InventoryItem, { NullInventoryItem } from "./common/src/Modules/InventoryItemModules/InventoryItem";
import DBMuck from "./DBMuck";

class InventoryManager implements DatabaseConnection {
  private static instance: InventoryManager;
  inventory: AbstractInventoryItem[] = [];
  isDBInventoryUpdateRequired: boolean;

  private constructor() {
    this.fetchData();
    this.isDBInventoryUpdateRequired = false
    InventoryManager.instance = this;
  }

  public static getInstance(): InventoryManager {
    if (!InventoryManager.instance) {
      InventoryManager.instance = new InventoryManager();
    }

    return InventoryManager.instance;
  }

  //#region Database
  connectToDatabase(): boolean {
    //TODO 
    return true;
  }

  fetchData() {
    this.inventory = DBMuck.getInstance().inventory;
  }

  updateDatabase() {
    // if (this.isDBInventoryUpdateRequired)
    // TODO
    return true;
  }
  //#endregion database

  //#region CRUD
  addIngredient(
    name: string,
    category: string,
    remaining: number,
    minRequired: number = 0,
    alcoholPercentage: number = 0
  ) {
    if (!this.checkIfIsCategory(category))
      return { success: false, reason: 'please select a valid category' };
    if (this.inventory.find((item) => item.name === name)) {
      return { success: false, reason: name + ' already exist' };
    }
    var newIngredient;
    if (Bottle.isABottleCategory(category)) {
      var builder = new BottleBuilder(name, category, remaining, minRequired);
      if (Bottle.isAAlcoholCategory(category))
        builder.alcoholPercentage(alcoholPercentage);
      newIngredient = builder.build();
    } else if (
      category === EInventoryCategory.Fruits ||
      category === EInventoryCategory.Vegetables
    ) {
      newIngredient = new FruitVegetable(
        name,
        category,
        remaining,
        minRequired
      );
    }
    else if (category === EInventoryCategory.Herbs || category === EInventoryCategory.Spices) {
      newIngredient = new BinaryInventoryItem(name, category, remaining > 0 ? true : false)
    }
    else {
      newIngredient = new InventoryItem(name, category, remaining, minRequired);
    }
    if (newIngredient !== undefined) {
      this.inventory.push(newIngredient);
      this.inventory.sort(function (a, b) {
        if (a.getName() < b.getName()) return -1;
        if (a.getName() > b.getName()) return 1;
        return 0;
      });
      this.updateDatabase();
      return { success: true, reason: name + ' was added successfully' };
    } else return { success: false, reason: 'Sorry, something want wrong' };
  }

  getIngredient(name: string) {
    var result = this.inventory.find((item) => item.name === name);
    if (result === undefined) {
      return new NullInventoryItem();
    } else return result;
  }

  updateIngredient(ingredientName: string, ingredientParam: string, newValue: any) {
    var ingredient = this.inventory.find(
      (item) => item.name === ingredientName
    );
    if (ingredient === undefined)
      return { success: false, reason: ingredientName + " doesn't exist" };
    if (ingredientParam === "category") return this.updateCategory(ingredient, newValue);
    else return ingredient.update(ingredientParam, newValue);
  }

  deleteIngredient(name: string) {
    this.inventory.forEach((item, index) => {
      if (item.name === name) this.inventory.splice(index, 1);
    });
  }
  //#endregion CRUD

  checkIfIsCategory(category: string) {
    return (
      Object.values(EInventoryCategory).includes(category) ||
      Object.values(EInventoryCategory.BottleCategory).includes(category) ||
      Object.values(EInventoryCategory.BottleCategory.AlcoholCategory).includes(
        category
      ) && (category !== EInventoryCategory.Unsorted && category !== EInventoryCategory.Unavailable)
    );
  }

  toJson() {
    return JSON.stringify(this);
  }

  filterByCategory(targetCategory: string) {
    return this.inventory.filter((item) => item.category === targetCategory);
  }

  updateCategory(ingredient: AbstractInventoryItem, newValue: any) {
    if (!this.checkIfIsCategory(newValue))
      return { success: false, reason: 'please select a valid category' };
    else {
      if (newValue === EInventoryCategory.Unavailable || newValue === EInventoryCategory.Unsorted || ingredient instanceof InventoryItem) {
        this.deleteIngredient(ingredient.name);
        this.addIngredient(ingredient.name, newValue, ingredient.remaining, 1);
        return { success: true, reason: ingredient.name + "'s category changed to " + newValue, };
      }
      else return ingredient.update("category", newValue);
    }
  }
}

export default InventoryManager;